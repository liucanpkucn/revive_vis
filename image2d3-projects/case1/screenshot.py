"""
This script does the following:
1. Start `bun dev`, which will run a server at `http://localhost:3000`
2. Use playwright to take a screenshot of the page
3. Save the screenshot to `./mobile-version.png`
4. Stop the server

Run this script by `un run python screenshot.py`
DO NOT MODIFY THIS SCRIPT
"""

import subprocess
import time
import os
import signal
import socket
import random
import urllib.request
import logging
from playwright.sync_api import sync_playwright


def find_available_port(
    min_port: int = 3000, max_port: int = 20000, max_attempts: int = 100
) -> int:
    """Find an available port by randomly selecting from the given range."""
    for _ in range(max_attempts):
        port = random.randint(min_port, max_port)
        try:
            with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
                s.bind(("localhost", port))
                return port
        except OSError:
            continue
    raise RuntimeError(
        f"Could not find an available port in range {min_port}-{max_port} after {max_attempts} attempts"
    )


def main():
    # Configure logging
    logging.basicConfig(level=logging.WARNING, format="%(levelname)s: %(message)s")

    # Get the directory of the script to run commands relative to it
    script_dir = os.path.dirname(os.path.abspath(__file__))
    output_path = os.path.join(script_dir, "mobile-version.png")
    if os.path.exists(output_path):
        os.remove(output_path)

    # Find an available port
    port = find_available_port()
    server_url = f"http://localhost:{port}"

    logging.info(f"Starting bun dev server on port {port}...")
    # Start the server
    # We use preexec_fn=os.setsid to be able to kill the whole process group later
    process = subprocess.Popen(
        ["bun", "dev", "--port", str(port)],
        cwd=script_dir,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        preexec_fn=os.setsid,
    )

    try:
        # Wait for server to be ready
        logging.info(f"Waiting for server to be ready at {server_url}...")
        max_retries = 30
        server_ready = False

        for i in range(max_retries):
            try:
                with urllib.request.urlopen(server_url) as response:
                    if response.status == 200:
                        server_ready = True
                        break
            except Exception:
                time.sleep(1)

        if not server_ready:
            logging.error("Server failed to start in time.")
            # Print stdout/stderr for debugging
            if process.poll() is None:
                # It's still running but not responding?
                pass
            else:
                stdout, stderr = process.communicate()
                logging.error(f"Server Stdout: {stdout.decode(errors='replace')}")
                logging.error(f"Server Stderr: {stderr.decode(errors='replace')}")
            return

        logging.info("Server is ready. Taking screenshot...")

        with sync_playwright() as p:
            # Launch browser
            # We use a large viewport to ensure we can capture the whole phone frame without scrolling issues
            browser = p.chromium.launch()
            page = browser.new_page(viewport={"width": 1920, "height": 1200})

            # Navigate
            page.goto(server_url)

            # Wait for network idle to ensure everything loaded
            page.wait_for_load_state("networkidle")

            # Take screenshot
            try:
                # Check for phone frame container with a short timeout
                page.locator("#phone-frame-container").wait_for(
                    state="visible", timeout=3000
                )
                page.locator("#phone-frame-container").screenshot(path=output_path)
                logging.info(f"Screenshot saved to {output_path}")
                print(f"Screenshot saved to {output_path}")
            except Exception:
                logging.warning(
                    "Phone frame container not found. Taking full page screenshot."
                )
                page.screenshot(path=output_path, full_page=True)
                logging.info(f"Screenshot saved to {output_path} (full page)")
                print(f"Screenshot saved to {output_path} (full page)")

            browser.close()

    except Exception as e:
        logging.error(f"An error occurred: {e}")
        # Print stdout/stderr from server if failed
        if process.poll() is not None:
            stdout, stderr = process.communicate()
            logging.error(f"Server Stdout: {stdout.decode(errors='replace')}")
            logging.error(f"Server Stderr: {stderr.decode(errors='replace')}")

    finally:
        logging.info("Stopping server...")
        # Kill the process group to ensure child processes (Next.js) are also killed
        try:
            os.killpg(os.getpgid(process.pid), signal.SIGTERM)
            process.wait()
        except Exception:
            pass
        logging.info("Server stopped.")


if __name__ == "__main__":
    main()
