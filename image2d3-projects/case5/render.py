"""render.py

Take a pixel-aligned screenshot of the current reconstruction.

What it does:
1) Starts `bun dev` on a random available port (robust on Windows/IPv6)
2) Opens the page with Playwright
3) Screenshots `#reconstruction-container`
4) Saves it to `./reconstruction.png`
5) Stops the dev server

Run:
  uv run python render.py

Notes:
- This script assumes the reconstruction is rendered inside an element with id `reconstruction-container`.
- It auto-reads `public/reference.png` size to set a sensible viewport.
- On Windows, bun is often a .cmd shim; we handle that safely.
"""

from __future__ import annotations

import argparse
import logging
import os
import random
import signal
import socket
import subprocess
import sys
import time
import shutil
import urllib.request
from pathlib import Path

from PIL import Image
from playwright.sync_api import sync_playwright


def can_bind_ipv4(port: int) -> bool:
    try:
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            s.bind(("127.0.0.1", port))
        return True
    except OSError:
        return False


def can_bind_ipv6(port: int) -> bool:
    if not socket.has_ipv6:
        return True
    try:
        with socket.socket(socket.AF_INET6, socket.SOCK_STREAM) as s:
            s.bind(("::1", port))
        return True
    except OSError:
        return False


def find_available_port(min_port: int = 3000, max_port: int = 20000, max_attempts: int = 400) -> int:
    for _ in range(max_attempts):
        port = random.randint(min_port, max_port)
        # Must be free on BOTH ipv4 and ipv6 (Windows/Next often listens on ::)
        if can_bind_ipv4(port) and can_bind_ipv6(port):
            return port
    raise RuntimeError(f"Could not find an available port in {min_port}-{max_port}")


def wait_until_ready(url: str, max_retries: int = 240, sleep_s: float = 0.5) -> bool:
    """
    Consider server ready if it responds (any status < 500).
    Next dev may take time to compile; during that time it should still respond.
    """
    for i in range(1, max_retries + 1):
        # Print every 10 times
        if i == 1 or i % 10 == 0:
            logging.info("Waiting for dev server... (%d/%d) %s", i, max_retries, url)

        try:
            with urllib.request.urlopen(url, timeout=0.5) as response:
                if response.status < 500:
                    return True
        except Exception:
            time.sleep(sleep_s)
    return False


def stop_server(proc: subprocess.Popen[bytes]) -> None:
    """Best-effort cross-platform termination. Only stops the process we started."""
    try:
        if os.name == "nt":
            # Kill process tree to avoid orphan dev servers holding ports
            subprocess.run(
                ["taskkill", "/PID", str(proc.pid), "/T", "/F"],
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
                check=False,
            )
        else:
            os.killpg(os.getpgid(proc.pid), signal.SIGTERM)
        try:
            proc.wait(timeout=10)
        except Exception:
            pass
    except Exception:
        try:
            proc.kill()
        except Exception:
            pass


def pick_viewport(reference_png: Path) -> dict:
    if not reference_png.exists():
        return {"width": 1600, "height": 1000}

    with Image.open(reference_png) as im:
        w, h = im.size

    vw = min(max(900, w + 260), 4200)
    vh = min(max(700, h + 260), 4200)
    return {"width": int(vw), "height": int(vh)}


def build_bun_command(bun_path: str, port: int) -> list[str]:
    """
    If bun is a .cmd shim, run via cmd.exe to be robust on Windows CreateProcess rules.
    """
    bun_lower = bun_path.lower()
    if os.name == "nt" and bun_lower.endswith((".cmd", ".bat")):
        comspec = os.environ.get("COMSPEC", "cmd.exe")
        return [comspec, "/c", bun_path, "dev", "--port", str(port)]
    return [bun_path, "dev", "--port", str(port)]


def start_dev_server(script_dir: Path, bun_path: str, max_start_retries: int = 8) -> tuple[subprocess.Popen[bytes], str]:
    """
    Try to start bun dev. If port is in use, retry with a new port.
    """
    last_err_tail = None

    for attempt in range(1, max_start_retries + 1):
        port = find_available_port()
        server_url = f"http://localhost:{port}"

        cmd = build_bun_command(bun_path, port)
        logging.info("Starting dev server: %s", " ".join(cmd))
        proc = subprocess.Popen(
            cmd,
            cwd=str(script_dir),
            stdout=None,  # Inherits the current console output
            stderr=None,  # Inherits the current console output
            start_new_session=True,
        )

        # Give it a moment; if it exits immediately, read stderr and retry on EADDRINUSE.
        time.sleep(0.8)
        code = proc.poll()
        if code is not None:
            err = ""
            try:
                if proc.stderr is not None:
                    err = proc.stderr.read().decode(errors="replace")
            except Exception:
                pass
            last_err_tail = (err or "")[-2500:]

            if "EADDRINUSE" in (err or "") or "address already in use" in (err or ""):
                logging.warning("bun dev failed due to port in use (attempt %d/%d). Retrying...", attempt, max_start_retries)
                stop_server(proc)
                continue

            logging.error("bun dev exited early (attempt %d/%d).", attempt, max_start_retries)
            if last_err_tail:
                logging.error("bun dev stderr (tail):\n%s", last_err_tail)
            stop_server(proc)
            raise RuntimeError("bun dev failed to start (not a port conflict). See stderr above.")

        # Wait until it responds
        ready_url = f"{server_url}/?screenshot=1"
        if wait_until_ready(ready_url):
            return proc, server_url

        # Not ready in time → dump tail and retry once more (could be slow compile or start failure)
        out_tail = err_tail = ""
        try:
            if proc.stdout is not None:
                out_tail = proc.stdout.read().decode(errors="replace")[-2000:]
            if proc.stderr is not None:
                err_tail = proc.stderr.read().decode(errors="replace")[-2000:]
        except Exception:
            pass

        logging.warning("Dev server not ready yet (attempt %d/%d).", attempt, max_start_retries)
        if out_tail:
            logging.warning("bun dev stdout (tail):\n%s", out_tail)
        if err_tail:
            logging.warning("bun dev stderr (tail):\n%s", err_tail)

        stop_server(proc)

    raise RuntimeError("Failed to start dev server after multiple attempts.")


def main() -> None:
    logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")

    parser = argparse.ArgumentParser()
    parser.add_argument("--out", type=Path, default=Path("reconstruction.png"))
    parser.add_argument("--url", type=str, default=None, help="Override dev server URL (skip starting bun dev)")
    args = parser.parse_args()

    script_dir = Path(__file__).resolve().parent
    output_path: Path = args.out
    if not output_path.is_absolute():
        output_path = script_dir / output_path

    if output_path.exists():
        output_path.unlink()

    server_url = args.url
    proc: subprocess.Popen[bytes] | None = None

    if server_url is None:
        bun_path = shutil.which("bun") or shutil.which("bun.cmd")
        if not bun_path:
            raise RuntimeError("bun not found. Ensure bun is installed and on PATH.")
        proc, server_url = start_dev_server(script_dir, bun_path=bun_path, max_start_retries=8)

    try:
        viewport = pick_viewport(script_dir / "public" / "reference.png")
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page(viewport=viewport)

            # Next dev can be slow on first compile; do not wait for full 'load' event.
            page.set_default_navigation_timeout(180_000)
            page.goto(f"{server_url}/?screenshot=1", wait_until="domcontentloaded", timeout=180_000)

            # Wait for our container to exist, then give React a short moment to settle
            page.wait_for_selector("#reconstruction-container", state="attached", timeout=180_000)
            page.wait_for_timeout(800)

            # Screenshot can fail in Next dev because the element gets replaced during hydration/HMR.
            # Retry a few times by re-querying the locator each time.
            last_err: Exception | None = None
            for attempt in range(1, 6):
                try:
                    locator = page.locator("#reconstruction-container")
                    locator.wait_for(state="visible", timeout=180_000)
                    locator.screenshot(path=str(output_path), timeout=180_000, animations="disabled")
                    last_err = None
                    break
                except Exception as e:
                    last_err = e
                    msg = str(e)
                    if "not attached to the DOM" in msg or "Element is not attached" in msg:
                        logging.warning("Element detached during screenshot; retrying (%d/5)...", attempt)
                        page.wait_for_timeout(800)
                        continue
                    raise

            if last_err is not None:
                raise RuntimeError(f"Failed to take screenshot after retries: {last_err}")

            browser.close()

        print(f"Saved {output_path}")

    finally:
        if proc is not None:
            stop_server(proc)


if __name__ == "__main__":
    main()
