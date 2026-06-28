#!/usr/bin/env python3
"""Genera capturas PNG del wireframe inicio completo (mobile + desktop)."""

from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
HTML = ROOT / "index/clientes/JoyasMercury/interfaces/mockups-inicio/wireframe-inicio.html"
OUT = HTML.parent

CAPTURAS = [
    ("jm-inicio-wireframe-mobile.png", 390, 844, "mobile"),
    ("jm-inicio-wireframe-desktop.png", 1440, 900, "desktop"),
]


def main():
    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        raise SystemExit("Instala Playwright: pip install playwright && playwright install chromium")

    if not HTML.is_file():
        raise SystemExit(f"No existe {HTML}")

    url = HTML.as_uri() + "?shot=1"

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        for archivo, width, height, viewport in CAPTURAS:
            shot_url = url + ("&viewport=desktop" if viewport == "desktop" else "")
            context = browser.new_context(
                viewport={"width": width, "height": height},
                device_scale_factor=2 if viewport == "mobile" else 1,
            )
            page = context.new_page()
            print(f"Capturando {archivo} ({width}px) …")
            page.goto(shot_url, wait_until="networkidle", timeout=60000)
            page.wait_for_timeout(800)
            dest = OUT / archivo
            page.screenshot(path=str(dest), full_page=True)
            print(f"  → {dest.relative_to(ROOT)} ({dest.stat().st_size // 1024} KB)")
            context.close()

        browser.close()

    print(f"\nListo: {len(CAPTURAS)} capturas en {OUT.relative_to(ROOT)}/")


if __name__ == "__main__":
    main()
