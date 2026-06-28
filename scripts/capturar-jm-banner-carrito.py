#!/usr/bin/env python3
"""Exporta banner Mi Carrito general 1000×500 px."""

from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
HTML = ROOT / "index/clientes/JoyasMercury/interfaces/mockups-carrito/banner-carrito-landing.html"
OUT = HTML.parent


def main():
    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        raise SystemExit("pip install playwright && playwright install chromium")

    url = HTML.as_uri() + "?shot=1"

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1000, "height": 500}, device_scale_factor=1)
        page = context.new_page()
        page.goto(url, wait_until="networkidle", timeout=60000)
        page.wait_for_timeout(900)

        for name in ("jm-banner-carrito-1000x500.png",):
            dest = OUT / name
            page.locator("#banner-carrito").screenshot(path=str(dest))
            print(f"→ {dest.relative_to(ROOT)} ({dest.stat().st_size // 1024} KB) · 1000×500")

        page.set_viewport_size({"width": 1440, "height": 900})
        page.goto(
            (OUT / "wireframe-carrito-landing.html").as_uri(),
            wait_until="networkidle",
        )
        page.wait_for_timeout(600)
        full = OUT / "jm-carrito-landing-desktop.png"
        page.screenshot(path=str(full), full_page=True)
        print(f"→ {full.relative_to(ROOT)} ({full.stat().st_size // 1024} KB)")

        browser.close()


if __name__ == "__main__":
    main()
