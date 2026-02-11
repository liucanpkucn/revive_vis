# Image2D3 Agent Rules

## Goal
Reconstruct `public/reference.png` using **D3 + SVG** rendered inside **`#reconstruction-container`**.

Optimize for:
1) Pixel alignment (geometry/layout)
2) Style match (colors/strokes/typography as close as feasible)
3) Data correctness (values consistent with visible ticks/labels/gridlines)

---

## Hard rules (non-negotiable)
- Work ONLY inside this project folder.
- Edit ONLY: `./src/components/Visualization.tsx`
  - Overwrite the ENTIRE file each iteration (no patch/replace edits).
- Do NOT modify any other files.
- Deterministic output: no randomness, no animation.

---

## What you MUST read first
1) `public/reference.png` (truth source)
2) `transform-plan.md` if present (HINTS only)
3) Current `./src/components/Visualization.tsx`

### IMPORTANT about `transform-plan.md`
- Treat it as hints. If ANY statement conflicts with what is visible in `reference.png`, follow the IMAGE.
- Especially: axis ordering words like “bottom-to-top / top-to-bottom” are often ambiguous for D3.
  You MUST match the visual order in the IMAGE.

---

## Axis order & orientation (generic, mandatory)
When an axis has categorical labels:
- X axis categories must be in the same LEFT→RIGHT order as in the image.
- Y axis categories must be in the same TOP→BOTTOM order as in the image.

Implementation note (D3/SVG coordinate system):
- In SVG, Y increases downward.
- With `d3.scaleBand().domain(list).range([plotTop, plotBottom])`,
  the FIRST domain item appears at the TOP.
Therefore:
- Always build your domain arrays in SCREEN ORDER:
  - yDomain = topToBottomLabels
  - xDomain = leftToRightLabels
- Do NOT “flip” the whole SVG unless the reference image itself is flipped.

Sanity check:
- After your first meaningful render, visually verify (via `diff.png`) that the topmost label row in the reference corresponds to the topmost row in your output.
  If it is inverted, fix by reversing the domain order (or swapping the y range), NOT by guessing new data.

---

## Data correctness
- Do NOT invent numbers.
- Infer values only from visible ticks/labels/gridlines.
- Write final numbers explicitly in arrays (no placeholders like “from image”).

If the reference clearly shows **percent stacks** (e.g., 0–100% axis and each row fills to 100):
- Enforce per-row stack sum = 100.
Otherwise:
- Do NOT enforce a fake sum constraint.

---

## Geometry constraints
- If the chart has visible gridlines used as measurement guides:
  snap boundaries (e.g., bar ends/segment edges) to those gridlines exactly.

---

## Verification loop (mandatory)
After EACH edit:
1) Run: `uv run python compare.py`
2) Print the MAE line and RMSE line verbatim from console output.
3) Inspect `diff.png` and decide the next fix.

If the page times out / container not found:
- Assume your latest code caused a render crash.
- Simplify the latest change and re-run.
- Do NOT do cache clearing, dependency reinstall, or manual dev-server workflows.

---

## Forbidden actions
- No cache clearing/debugging (.next, bun cache, etc.)
- No dependency reinstall (bun/npm install)
- No manual `bun dev` workflow (judge is `compare.py`)
- No editing files other than `Visualization.tsx`

---

## Stop condition
- Max 10 iterations
OR
- Stop early if MAE and RMSE do not improve for 2 consecutive iterations.

At the end, report:
- Best MAE/RMSE achieved
- Any explicit constraints you enforced (only if they are visible in the reference)
