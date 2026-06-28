#!/usr/bin/env python3
"""Captura PNG de la maqueta navbar JM (solo desktop)."""

from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
HTML = ROOT / "index/clientes/joyasmercury/interfaces/mockups-navbar/navbar-jm-maqueta.html"
OUT = HTML.parent

CAPTURAS = [
    ("navbar-jm-maqueta-desktop.png", 1280, 400, "desktop", ".maqueta-frame--desktop .jm-navbar-wrap"),
]


def main():
    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        raise SystemExit("pip install playwright && python -m playwright install chromium")

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        for archivo, width, height, shot, selector in CAPTURAS:
            url = HTML.as_uri() + f"?shot={shot}"
            ctx = browser.new_context(
                viewport={"width": width, "height": height},
                device_scale_factor=1,
            )
            page = ctx.new_page()
            page.goto(url, wait_until="networkidle", timeout=60000)
            page.wait_for_timeout(600)
            dest = OUT / archivo
            el = page.locator(selector)
            el.screenshot(path=str(dest))
            print(f"→ {dest.relative_to(ROOT)} ({dest.stat().st_size // 1024} KB)")
            ctx.close()
        browser.close()
    print("Listo.")


if __name__ == "__main__":
    main()
