#!/usr/bin/env python3
"""Genera las 7 capturas mobile del carrusel referencia-landings-mobile/."""

from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
JM = ROOT / "index/clientes/joyasmercury"
OUT = JM / "interfaces/referencia-landings-mobile"

CAPTURAS = [
    (
        "01-inicio-referencia-mobile.png",
        JM / "interfaces/mockups-inicio/wireframe-inicio.html",
        "?shot=1&footer=e",
    ),
    (
        "02-esencial-referencia-mobile.png",
        JM / "interfaces/mockups-coleccion/wireframe-coleccion.html",
        "?shot=1&coleccion=esencial&filtro=circulos",
    ),
    (
        "03-gold-referencia-mobile.png",
        JM / "interfaces/mockups-coleccion/wireframe-coleccion.html",
        "?shot=1&coleccion=gold&filtro=circulos",
    ),
    (
        "04-deluxe-referencia-mobile.png",
        JM / "interfaces/mockups-coleccion/wireframe-coleccion.html",
        "?shot=1&coleccion=deluxe&filtro=circulos",
    ),
    (
        "05-carrito-referencia-mobile.png",
        JM / "interfaces/mockups-carrito/wireframe-carrito-landing.html",
        "?shot=1",
    ),
    (
        "06-ayuda-referencia-mobile.png",
        JM / "interfaces/mockups-ayuda/wireframe-ayuda-landing.html",
        "?shot=1",
    ),
    (
        "07-productos-referencia-mobile.png",
        JM / "interfaces/mockups-producto/wireframe-producto-landing.html",
        "?shot=1&coleccion=esencial&producto=aros-corazon",
    ),
]

MOBILE_W = 390
MOBILE_H = 844


def main():
    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        raise SystemExit(
            "Instala Playwright: pip install playwright && playwright install chromium"
        )

    OUT.mkdir(parents=True, exist_ok=True)

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        for archivo, html, query in CAPTURAS:
            if not html.is_file():
                raise SystemExit(f"No existe {html}")
            url = html.as_uri() + query
            context = browser.new_context(
                viewport={"width": MOBILE_W, "height": MOBILE_H},
                device_scale_factor=2,
            )
            page = context.new_page()
            print(f"Capturando {archivo} …")
            page.goto(url, wait_until="networkidle", timeout=90000)
            page.wait_for_timeout(900)
            dest = OUT / archivo
            page.screenshot(path=str(dest), full_page=True)
            print(f"  → {dest.relative_to(ROOT)} ({dest.stat().st_size // 1024} KB)")
            context.close()
        browser.close()

    print(f"\nListo: {len(CAPTURAS)} capturas mobile en {OUT.relative_to(ROOT)}/")
    print("Siguiente: python3 scripts/sync-jm-landings-carrusel-mobile.py")


if __name__ == "__main__":
    main()
