#!/usr/bin/env python3
"""Capturas wireframe ficha producto · desktop + mobile."""

from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
HTML = ROOT / "index/clientes/JoyasMercury/interfaces/mockups-producto/wireframe-producto-landing.html"
OUT = HTML.parent

CAPTURAS = [
    ("jm-producto-landing-desktop.png", 1440, 900, 1, "esencial&producto=aros-corazon"),
    ("jm-producto-landing-mobile.png", 390, 844, 2, "esencial&producto=aros-corazon"),
]


def main():
    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        raise SystemExit("pip install playwright && playwright install chromium")

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        for archivo, width, height, scale, query in CAPTURAS:
            url = HTML.as_uri() + f"?shot=1&coleccion={query}"
            ctx = browser.new_context(
                viewport={"width": width, "height": height},
                device_scale_factor=scale,
            )
            page = ctx.new_page()
            print(f"Capturando {archivo} …")
            page.goto(url, wait_until="networkidle", timeout=60000)
            page.wait_for_timeout(800)
            dest = OUT / archivo
            page.screenshot(path=str(dest), full_page=True)
            print(f"  → {dest.relative_to(ROOT)} ({dest.stat().st_size // 1024} KB)")
            ctx.close()
        browser.close()

    print(f"\nListo: {len(CAPTURAS)} capturas en {OUT.relative_to(ROOT)}/")


if __name__ == "__main__":
    main()
