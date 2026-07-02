#!/usr/bin/env python3
"""Genera PNG de diagramas mova_auth desde diagramas.html."""

from pathlib import Path

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent.parent
HTML = ROOT / "index/clientes/mkof/guia-mova-auth/diagramas.html"
OUT = ROOT / "index/clientes/mkof/guia-mova-auth/img"
OUT.mkdir(parents=True, exist_ok=True)

DIAGRAMS = [
    ("01-problema-fragmentado", "#d1"),
    ("02-objetivo-centralizado", "#d2"),
    ("03-flujo-login", "#d3"),
    ("04-validacion-modulo", "#d4"),
    ("05-estructura-carpetas", "#d5"),
    ("06-antes-despues", "#d6"),
]


def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 980, "height": 800})
        page.goto(HTML.as_uri(), wait_until="networkidle")
        for name, sel in DIAGRAMS:
            el = page.locator(sel)
            path = OUT / f"{name}.png"
            el.screenshot(path=str(path))
            print(f"  ✓ {path.name} ({path.stat().st_size // 1024} KB)")
        browser.close()
    print(f"\nDiagramas en: {OUT}")


if __name__ == "__main__":
    main()
