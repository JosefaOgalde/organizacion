#!/usr/bin/env python3
"""Captura pantallas reales de github.com/signup para la guía MOVA."""

from pathlib import Path

from playwright.sync_api import sync_playwright

OUT = Path(__file__).resolve().parent.parent / "index/clientes/mkof/guia-github/img"
OUT.mkdir(parents=True, exist_ok=True)

VIEWPORT = {"width": 1400, "height": 900}


def shot_locator(page, locator, name):
    path = OUT / f"{name}.png"
    locator.screenshot(path=str(path))
    print(f"  ✓ {path.name} ({path.stat().st_size // 1024} KB)")
    return path


def shot_page(page, name):
    path = OUT / f"{name}.png"
    page.screenshot(path=str(path), full_page=False)
    print(f"  ✓ {path.name} ({path.stat().st_size // 1024} KB)")
    return path


def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport=VIEWPORT, locale="en-US")
        page = context.new_page()

        print("Capturando github.com/signup …")
        page.goto("https://github.com/signup", wait_until="domcontentloaded", timeout=60000)
        page.wait_for_timeout(2500)

        # Contenedor principal del signup (varios selectores por si GitHub cambia el DOM)
        panel = page.locator(
            '[data-testid="signup-form"], .signup-form, main, [class*="SignUp"]'
        ).first
        if not panel.count():
            panel = page.locator("body")

        shot_page(page, "01-signup-pagina-completa")
        shot_locator(page, panel, "02-formulario-inicio")

        email = page.locator("#email, input[name='email']").first
        if email.count():
            email.click()
            email.fill("infra@mova.cl")
            page.wait_for_timeout(600)
            shot_locator(page, panel, "03-campo-email")

        pwd = page.locator("#password, input[name='password']").first
        if pwd.count():
            pwd.click()
            pwd.fill("Mova-2026-Ejemplo-Segura!")
            page.wait_for_timeout(600)
            shot_locator(page, panel, "04-campo-password")

        user = page.locator("#login, input[name='login']").first
        if user.count():
            user.click()
            user.fill("mova-infra")
            page.wait_for_timeout(600)
            shot_locator(page, panel, "05-campo-username")

        shot_locator(page, panel, "06-formulario-completo")

        # Login = referencia de cuenta creada
        page.goto("https://github.com/login", wait_until="domcontentloaded", timeout=60000)
        page.wait_for_timeout(1500)
        login_panel = page.locator("main").first
        shot_page(page, "07-pagina-login")
        shot_locator(page, login_panel, "08-login-formulario")

        # Docs oficiales (verificación y planes)
        page.goto(
            "https://docs.github.com/en/get-started/signing-up-for-github/signing-up-for-a-new-github-account",
            wait_until="domcontentloaded",
            timeout=60000,
        )
        page.wait_for_timeout(2000)
        shot_page(page, "09-docs-signup-oficial")

        browser.close()

    print(f"\nImágenes en: {OUT}")


if __name__ == "__main__":
    main()
