#!/usr/bin/env python3
"""Captura PNG de las landings referencia entregadas (carrusel ficha JM)."""

from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
HTML = ROOT / "index/clientes/joyasmercury/interfaces/referencia-landings/referencia-landings.html"
OUT = HTML.parent

CAPTURAS = [
    ("01-inicio-referencia.png", "pagina=inicio"),
    ("02-esencial-referencia.png", "pagina=coleccion&coleccion=esencial"),
    ("03-gold-referencia.png", "pagina=coleccion&coleccion=gold"),
    ("04-deluxe-referencia.png", "pagina=coleccion&coleccion=deluxe"),
]


def main():
    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        raise SystemExit("Instala Playwright: pip install playwright && playwright install chromium")

    base = HTML.as_uri() + "?shot=1&"

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        for archivo, query in CAPTURAS:
            url = base + query
            context = browser.new_context(
                viewport={"width": 1440, "height": 900},
                device_scale_factor=1,
            )
            page = context.new_page()
            print(f"Capturando {archivo} …")
            page.goto(url, wait_until="networkidle", timeout=60000)
            page.wait_for_timeout(900)
            dest = OUT / archivo
            page.screenshot(path=str(dest), full_page=True)
            print(f"  → {dest.relative_to(ROOT)} ({dest.stat().st_size // 1024} KB)")
            context.close()
        browser.close()

    print(f"\nListo: {len(CAPTURAS)} capturas en {OUT.relative_to(ROOT)}/")


if __name__ == "__main__":
    main()
