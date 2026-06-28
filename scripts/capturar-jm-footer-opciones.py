#!/usr/bin/env python3
"""Captura la página de opciones de footer (comparativa A–D)."""

from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
HTML = ROOT / "index/clientes/JoyasMercury/interfaces/mockups-inicio/wireframe-footer-opciones.html"
OUT = HTML.parent


def main():
    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        raise SystemExit("Instala Playwright: pip install playwright && playwright install chromium")

    url = HTML.as_uri()

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        for archivo, width in [
            ("jm-footer-opciones-desktop.png", 1440),
            ("jm-footer-opciones-mobile.png", 390),
        ]:
            context = browser.new_context(
                viewport={"width": width, "height": 900},
                device_scale_factor=2 if width == 390 else 1,
            )
            page = context.new_page()
            print(f"Capturando {archivo} …")
            page.goto(url, wait_until="networkidle", timeout=60000)
            page.wait_for_timeout(600)
            dest = OUT / archivo
            page.screenshot(path=str(dest), full_page=True)
            print(f"  → {dest.relative_to(ROOT)} ({dest.stat().st_size // 1024} KB)")
            context.close()
        browser.close()

    print(f"\nListo en {OUT.relative_to(ROOT)}/")


if __name__ == "__main__":
    main()
