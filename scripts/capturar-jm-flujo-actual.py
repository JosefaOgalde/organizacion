#!/usr/bin/env python3
"""Captura pantallas reales de joyasmercury.cl para el prototipo interactivo."""

from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "index/clientes/joyasmercury/flujo-actual"

CAPTURAS = [
    ("01-inicio-home.png", "https://joyasmercury.cl/", "networkidle"),
    ("02-coleccion-esencial.png", "https://joyasmercury.cl/esencial/", "networkidle"),
    ("03-coleccion-gold.png", "https://joyasmercury.cl/gold/", "networkidle"),
    ("04-coleccion-deluxe.png", "https://joyasmercury.cl/deluxe/", "networkidle"),
    ("05-tienda-catalogo.png", "https://joyasmercury.cl/tienda/", "networkidle"),
    ("06-mi-carrito.png", "https://joyasmercury.cl/mi-carrito/", "networkidle"),
    ("07-nosotros.png", "https://joyasmercury.cl/nosotros/", "networkidle"),
]


def main():
    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        raise SystemExit("Instala Playwright: pip install playwright && playwright install chromium")

    OUT.mkdir(parents=True, exist_ok=True)

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            viewport={"width": 1280, "height": 900},
            device_scale_factor=1,
            locale="es-CL",
        )
        page = context.new_page()

        for archivo, url, wait in CAPTURAS:
            print(f"Capturando {archivo} …")
            page.goto(url, wait_until=wait, timeout=90000)
            page.wait_for_timeout(1500)
            dest = OUT / archivo
            page.screenshot(path=str(dest), full_page=True)
            print(f"  → {dest.relative_to(ROOT)} ({dest.stat().st_size // 1024} KB)")

        # Pie: scroll al footer en carrito (texto garantía + footer dorado)
        print("Capturando 08-pie-garantia-footer.png …")
        page.goto("https://joyasmercury.cl/mi-carrito/", wait_until="networkidle", timeout=90000)
        page.wait_for_timeout(1000)
        page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
        page.wait_for_timeout(800)
        dest = OUT / "08-pie-garantia-footer.png"
        page.screenshot(path=str(dest), full_page=False)
        print(f"  → {dest.relative_to(ROOT)} ({dest.stat().st_size // 1024} KB)")

        browser.close()

    print(f"\nListo: {len(CAPTURAS) + 1} capturas en {OUT.relative_to(ROOT)}/")


if __name__ == "__main__":
    main()
