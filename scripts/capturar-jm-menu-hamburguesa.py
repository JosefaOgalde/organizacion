#!/usr/bin/env python3
"""Captura PNG del menú hamburguesa JM (drawer abierto, móvil 390px)."""

from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
HTML = ROOT / "index/clientes/joyasmercury/interfaces/mockups-navbar/menu-hamburguesa-jm-maqueta.html"
OUT = HTML.parent


def main():
    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        raise SystemExit("pip install playwright && python3 -m playwright install chromium")

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        url = HTML.as_uri() + "?shot=open"
        ctx = browser.new_context(viewport={"width": 390, "height": 844}, device_scale_factor=2)
        page = ctx.new_page()
        page.goto(url, wait_until="networkidle", timeout=60000)
        page.wait_for_timeout(600)
        dest = OUT / "menu-hamburguesa-jm-maqueta-open.png"
        page.locator(".jm-phone__screen").screenshot(path=str(dest))
        print(f"→ {dest.relative_to(ROOT)} ({dest.stat().st_size // 1024} KB)")
        ctx.close()
        browser.close()
    print("Listo.")


if __name__ == "__main__":
    main()
