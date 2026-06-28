#!/usr/bin/env python3
"""Exporta banner y landing completa Mi Carrito (desktop + mobile)."""

from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
HTML = ROOT / "index/clientes/joyasmercury/interfaces/mockups-carrito/banner-carrito-landing.html"
WIREFRAME = HTML.parent / "wireframe-carrito-landing.html"
OUT = HTML.parent


def main():
    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        raise SystemExit("pip install playwright && playwright install chromium")

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)

        # Banner 1000×500
        ctx = browser.new_context(viewport={"width": 1000, "height": 500}, device_scale_factor=1)
        page = ctx.new_page()
        page.goto(HTML.as_uri() + "?shot=1", wait_until="networkidle", timeout=60000)
        page.wait_for_timeout(900)
        dest = OUT / "jm-banner-carrito-1000x500.png"
        page.locator("#banner-carrito").screenshot(path=str(dest))
        print(f"→ {dest.relative_to(ROOT)} ({dest.stat().st_size // 1024} KB) · 1000×500")
        ctx.close()

        # Landing desktop
        ctx = browser.new_context(viewport={"width": 1440, "height": 900}, device_scale_factor=1)
        page = ctx.new_page()
        page.goto(WIREFRAME.as_uri() + "?estado=productos", wait_until="networkidle", timeout=60000)
        page.wait_for_timeout(800)
        full = OUT / "jm-carrito-landing-desktop.png"
        page.screenshot(path=str(full), full_page=True)
        print(f"→ {full.relative_to(ROOT)} ({full.stat().st_size // 1024} KB) · desktop")

        # Landing mobile
        page.set_viewport_size({"width": 390, "height": 844})
        page.wait_for_timeout(500)
        mobile = OUT / "jm-carrito-landing-mobile.png"
        page.screenshot(path=str(mobile), full_page=True)
        print(f"→ {mobile.relative_to(ROOT)} ({mobile.stat().st_size // 1024} KB) · mobile")

        ctx.close()
        browser.close()


if __name__ == "__main__":
    main()
