#!/usr/bin/env python3
"""Capturas wireframe colección Esencial / Gold / Deluxe."""

from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
HTML = ROOT / "index/clientes/joyasmercury/interfaces/mockups-coleccion/wireframe-coleccion.html"
OUT = HTML.parent

CAPTURAS = [
    ("jm-coleccion-esencial-mobile.png", 390, 844, "esencial"),
    ("jm-coleccion-esencial-desktop.png", 1440, 900, "esencial"),
    ("jm-coleccion-gold-mobile.png", 390, 844, "gold"),
    ("jm-coleccion-gold-desktop.png", 1440, 900, "gold"),
    ("jm-coleccion-deluxe-mobile.png", 390, 844, "deluxe"),
    ("jm-coleccion-deluxe-desktop.png", 1440, 900, "deluxe"),
]


def main():
    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        raise SystemExit("Instala Playwright: pip install playwright && playwright install chromium")

    base = HTML.as_uri() + "?shot=1"

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        for archivo, width, height, col in CAPTURAS:
            url = f"{base}&coleccion={col}&filtro=circulos"
            if width >= 900:
                url += "&viewport=desktop"
            context = browser.new_context(
                viewport={"width": width, "height": height},
                device_scale_factor=2 if width == 390 else 1,
            )
            page = context.new_page()
            print(f"Capturando {archivo} ({col}) …")
            page.goto(url, wait_until="networkidle", timeout=60000)
            page.wait_for_timeout(700)
            dest = OUT / archivo
            page.screenshot(path=str(dest), full_page=True)
            print(f"  → {dest.relative_to(ROOT)} ({dest.stat().st_size // 1024} KB)")
            context.close()
        browser.close()

    print(f"\nListo: {len(CAPTURAS)} capturas")


if __name__ == "__main__":
    main()
