from __future__ import annotations

import argparse
import asyncio
import json
import os
import re
import shutil
from io import BytesIO
from pathlib import Path

import pathspec
from dotenv import load_dotenv
from PIL import Image, ImageOps

from google import genai
from google.genai import types


def copy_project_template(template_path: Path, new_project_path: Path) -> None:
    """
    Copy a project template to a new folder, respecting .gitignore patterns.
    """
    if new_project_path.exists():
        print(f"Warning: Project directory '{new_project_path}' already exists.")

    gitignore_path = template_path / ".gitignore"
    patterns: list[str] = []
    if gitignore_path.exists():
        patterns = gitignore_path.read_text(encoding="utf-8", errors="replace").splitlines()

    spec = pathspec.PathSpec.from_lines(pathspec.patterns.GitWildMatchPattern, patterns)

    def ignore_func(src: str, names: list[str]) -> list[str]:
        rel_path = Path(src).resolve().relative_to(template_path.resolve())
        ignored: list[str] = []
        for name in names:
            if name == ".git":
                ignored.append(name)
                continue
            item_rel = (rel_path / name).as_posix()
            if spec.match_file(item_rel) or spec.match_file(item_rel + "/"):
                ignored.append(name)
        return ignored

    shutil.copytree(template_path, new_project_path, ignore=ignore_func, dirs_exist_ok=True)


def write_reference_ts(project_path: Path, width: int, height: int) -> None:
    ref_ts = project_path / "src" / "lib" / "reference.ts"
    ref_ts.parent.mkdir(parents=True, exist_ok=True)
    ref_ts.write_text(
        "// Auto-updated by prepare_image2d3_project.py\n"
        "export const REFERENCE = {\n"
        f"\twidth: {width},\n"
        f"\theight: {height},\n"
        "\tpath: \"/reference.png\",\n"
        "} as const;\n",
        encoding="utf-8",
    )


def build_plan_prompt(action_space_text: str, width: int, height: int) -> str:
    """
    IMPORTANT:
    - This prompt is used to generate transform-plan.md.
    - It MUST be consistent with GEMINI.md (hard rules), and must NOT encourage guessing data.
    """
    return (
        "You are helping reconstruct a visualization image into a D3+SVG implementation.\n\n"
        "Context (facts):\n"
        "- Project: Next.js app.\n"
        "- You MUST implement the reconstruction ONLY in: src/components/Visualization.tsx\n"
        "- Reference image: public/reference.png\n"
        f"- Reference image size is EXACTLY: {width} x {height} pixels.\n"
        "- The reconstruction must be pixel-aligned to the reference.\n"
        "- The SVG viewBox MUST be exactly: '0 0 <width> <height>' using the exact image size.\n"
        "- Verification: run `uv run python compare.py` to generate diff.png and MAE/RMSE.\n\n"
        "Task:\n"
        "Write a transform plan in Markdown that tells an agent how to reconstruct the reference image.\n\n"
        "Hard rules (MUST follow):\n"
        "1) Do NOT guess / invent numeric data.\n"
        "   - Do NOT include any 'Estimated Data Table'.\n"
        "   - Do NOT provide numeric arrays unless every value is explicitly readable from ticks/labels/annotations.\n"
        "   - If a value is not readable, write 'TBD' and describe a strict extraction method (e.g., pixel->scale mapping).\n"
        "2) Do NOT weaken the pixel alignment requirement.\n"
        f"   - Never say the viewBox is approximate. It is exactly 0 0 {width} {height}.\n"
        "3) The plan must NOT contradict GEMINI.md. If there is any conflict, GEMINI.md wins.\n"
        "4) Axis ordering MUST be unambiguous and D3-ready.\n"
        "   - If there is a categorical X axis, you MUST output:\n"
        "     X_DOMAIN_LEFT_TO_RIGHT = [ ... ] in exact SCREEN order (left -> right).\n"
        "   - If there is a categorical Y axis, you MUST output:\n"
        "     Y_DOMAIN_TOP_TO_BOTTOM = [ ... ] in exact SCREEN order (top -> bottom).\n"
        "   - IMPORTANT D3/SVG note: in SVG, Y increases downward.\n"
        "     With d3.scaleBand().domain(list).range([plotTop, plotBottom]), the FIRST domain item appears at the TOP.\n"
        "     Therefore yScale.domain MUST use TOP->BOTTOM screen order.\n"
        "   - Never recommend flipping the whole SVG unless the reference image itself is flipped.\n\n"
        "What to include (required sections):\n"
        "A) Chart inventory: chart type, marks, axes, scales (linear/log), gridlines, legend, annotations.\n"
        "B) Layout spec: margins, title position, plot area bounds, axis label positions, legend box positions (all in pixels).\n"
        "C) Typography & palette: font family guess, font sizes, weights, colors, strokes (allowed to be approximate).\n"
        "D) Data extraction protocol (exact): how to infer each datum from the reference (ticks/labels), how to validate consistency.\n"
        "E) Implementation steps: scaffold -> axes -> grid -> marks -> labels -> annotations -> final polish.\n"
        "F) Verification loop: after EACH edit run compare.py, read diff.png, fix biggest structural errors first.\n"
        "   - Stop after max 10 iterations OR stop if MAE/RMSE does not improve for 2 consecutive iterations.\n\n"
        "Action Space (allowed operations / constraints):\n"
        f"{action_space_text}\n"
    )

def sanitize_transform_plan(plan: str, width: int, height: int) -> str:
    """
    Best-effort removal of problematic content that tends to conflict with GEMINI.md,
    even if the model produces it.
    """
    text = plan.replace("\r\n", "\n")

    # 1) Remove any section that starts with 'Estimated Data Table' (markdown heading or bold)
    patterns = [
        r"(?is)^\s*\*\*Estimated Data Table.*?(?=^\s*##\s|\Z)",
        r"(?is)^\s*##\s*Estimated Data Table.*?(?=^\s*##\s|\Z)",
        r"(?is)^\s*#\s*Estimated Data Table.*?(?=^\s*#\s|\Z)",
    ]
    for pat in patterns:
        text = re.sub(pat, "", text)

    # 2) Remove the classic "initial estimates" line if present
    text = re.sub(r"(?is)^\s*\*?\(?(note:\s*)?these are initial estimates.*?\n", "", text)

    # 3) Strongly discourage "approximate viewBox" by normalizing language
    text = re.sub(r"(?i)\bviewBox\b.*approximate.*", f"Set SVG viewBox to exactly: 0 0 {width} {height}.", text)

    # Trim excessive blank lines
    text = re.sub(r"\n{4,}", "\n\n\n", text).strip() + "\n"
    return text


def load_reference_as_png_bytes(reference_image: Path) -> tuple[bytes, int, int]:
    """
    Load any common raster image (png/jpg/jpeg) and return PNG bytes + (w, h).
    Normalize EXIF orientation so width/height and pixels match what you see.
    """
    with Image.open(reference_image) as im:
        im = ImageOps.exif_transpose(im)
        width, height = im.size
        buf = BytesIO()
        if im.mode not in ("RGB", "RGBA"):
            im = im.convert("RGBA")
        im.save(buf, format="PNG")
        return buf.getvalue(), width, height


async def generate_transform_plan(
    reference_png_bytes: bytes,
    width: int,
    height: int,
    action_space_document: Path,
    use_flash: bool,
    model: str | None,
) -> str:
    load_dotenv()
    api_key = os.getenv("GEMINI_KEY") or os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
    if not api_key:
        raise ValueError("Gemini API key not found. Set GEMINI_KEY (recommended) in .env.")

    action_space_text = action_space_document.read_text(encoding="utf-8", errors="replace")
    prompt_text = build_plan_prompt(action_space_text, width=width, height=height)

    chosen_model = model or ("gemini-3-flash-preview" if use_flash else "gemini-3-pro-preview")

    client = genai.Client(api_key=api_key).aio
    config = types.GenerateContentConfig(
        thinking_config=types.ThinkingConfig(thinking_level="HIGH"),
        media_resolution="MEDIA_RESOLUTION_HIGH",
    )

    contents = [
        types.Content(
            role="user",
            parts=[
                types.Part.from_text(text=prompt_text),
                types.Part.from_bytes(data=reference_png_bytes, mime_type="image/png"),
            ],
        )
    ]

    response = await client.models.generate_content(model=chosen_model, contents=contents, config=config)
    plan = response.parts[0].text if response.parts else response.text  # fallback
    return sanitize_transform_plan(plan, width=width, height=height)


async def main(
    reference_image: Path,
    project_name: str,
    project_template: Path,
    action_space_document: Path,
    skip_plan: bool,
    use_flash: bool,
    model: str | None,
) -> None:
    assert reference_image.exists(), f"Reference image does not exist: {reference_image}"
    assert project_template.exists(), f"Project template does not exist: {project_template}"
    assert action_space_document.exists(), f"Action space document does not exist: {action_space_document}"

    project_root = Path(project_name)
    copy_project_template(project_template, project_root)

    # Load input image (png/jpg/jpeg/...) and normalize to PNG for the project.
    reference_png_bytes, width, height = load_reference_as_png_bytes(reference_image)

    # Copy images (as PNG)
    (project_root / "public").mkdir(parents=True, exist_ok=True)
    (project_root / "public" / "reference.png").write_bytes(reference_png_bytes)

    original_folder = project_root / "original_visualization"
    original_folder.mkdir(parents=True, exist_ok=True)
    (original_folder / "reference.png").write_bytes(reference_png_bytes)

    # Write meta + reference.ts
    meta_path = original_folder / "reference_meta.json"
    meta_path.write_text(json.dumps({"width": width, "height": height}, indent=2) + "\n", encoding="utf-8")
    write_reference_ts(project_root, width, height)

    # Copy docs
    shutil.copy2(action_space_document, project_root / action_space_document.name)

    if not skip_plan:
        plan = await generate_transform_plan(
            reference_png_bytes=reference_png_bytes,
            width=width,
            height=height,
            action_space_document=action_space_document,
            use_flash=use_flash,
            model=model,
        )
        (project_root / "transform-plan.md").write_text(plan, encoding="utf-8")
        print(f"Saved transform plan to {project_root / 'transform-plan.md'}")

    print(f"Project prepared at: {project_root}")
    print("Next:")
    print(f"  cd {project_root}")
    print("  bun install")
    print("  # Optional sanity check (pipeline):")
    print("  uv run python compare.py")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description=(
            "Prepare an Image2D3 project. It copies the template, installs the reference image, writes reference size, "
            "and optionally generates a transform plan with Gemini."
        )
    )
    parser.add_argument(
        "--reference-image",
        type=Path,
        required=True,
        help="Path to reference image (png/jpg/jpeg; will be converted to PNG)",
    )
    parser.add_argument(
        "--project-name",
        type=str,
        required=True,
        help="Output project directory (e.g. image2d3-projects/my-case)",
    )
    parser.add_argument(
        "--project-template",
        type=Path,
        default=Path("./image2d3-template"),
        help="Path to the Image2D3 project template directory",
    )
    parser.add_argument(
        "--action-space-document",
        type=Path,
        default=Path("./image2d3-design-action-space.md"),
        help="Path to the action space document",
    )
    parser.add_argument("--skip-plan", action="store_true", help="Skip generating transform-plan.md")
    parser.add_argument("--use-flash", action="store_true", help="Use a cheaper/faster Gemini model")
    parser.add_argument("--model", type=str, default=None, help="Override Gemini model name")

    args = parser.parse_args()

    asyncio.run(
        main(
            reference_image=args.reference_image,
            project_name=args.project_name,
            project_template=args.project_template,
            action_space_document=args.action_space_document,
            skip_plan=args.skip_plan,
            use_flash=args.use_flash,
            model=args.model,
        )
    )
