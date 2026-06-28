#!/usr/bin/env python3
"""Captura PNG de la maqueta diseño Inicio JM (desktop full page)."""

from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
HTML = ROOT / "index/clientes/joyasmercury/interfaces/maqueta-diseno/index.html"
OUT = HTML.parent


def main():
    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        raise SystemExit("pip install playwright && python -m playwright install chromium")

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        url = HTML.as_uri() + "?shot=desktop"
        ctx = browser.new_context(viewport={"width": 1280, "height": 900}, device_scale_factor=1)
        page = ctx.new_page()
        page.goto(url, wait_until="networkidle", timeout=60000)
        page.wait_for_timeout(800)
        dest = OUT / "jm-maqueta-diseno-inicio-desktop.png"
        page.screenshot(path=str(dest), full_page=True)
        print(f"→ {dest.relative_to(ROOT)} ({dest.stat().st_size // 1024} KB)")
        ctx.close()
        browser.close()
    print("Listo.")


if __name__ == "__main__":
    main()
