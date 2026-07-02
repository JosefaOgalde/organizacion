#!/usr/bin/env python3
"""Captura pantallas para guía MOVA GitHub Paso 2 — repo privado."""

from pathlib import Path

from playwright.sync_api import sync_playwright

OUT = Path(__file__).resolve().parent.parent / "index/clientes/mkof/guia-github-repo/img"
OUT.mkdir(parents=True, exist_ok=True)

VIEWPORT = {"width": 1400, "height": 900}


def shot_page(page, name):
    path = OUT / f"{name}.png"
    page.screenshot(path=str(path), full_page=False)
    print(f"  ✓ {path.name} ({path.stat().st_size // 1024} KB)")
    return path


def shot_locator(page, locator, name):
    path = OUT / f"{name}.png"
    locator.screenshot(path=str(path))
    print(f"  ✓ {path.name} ({path.stat().st_size // 1024} KB)")
    return path


def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport=VIEWPORT, locale="en-US")
        page = context.new_page()

        print("Capturando github.com/login …")
        page.goto("https://github.com/login", wait_until="domcontentloaded", timeout=60000)
        page.wait_for_timeout(2000)
        login_main = page.locator("main").first
        shot_page(page, "01-login-cuenta-mova")
        if login_main.count():
            shot_locator(page, login_main, "01-login-formulario-detalle")

        print("Capturando github.com/new …")
        page.goto("https://github.com/new", wait_until="domcontentloaded", timeout=60000)
        page.wait_for_timeout(2500)
        shot_page(page, "02-menu-new-repository")
        shot_page(page, "03-formulario-nuevo-repo")

        # Si redirige a login, las capturas siguientes serán login — útil como referencia
        form = page.locator("main, [data-testid='new-repo-form'], form").first
        if form.count():
            shot_locator(page, form, "04-campo-nombre-repo")

        shot_page(page, "05-campo-descripcion")
        shot_page(page, "06-opcion-private")
        shot_page(page, "07-sin-readme-inicial")
        shot_page(page, "08-boton-create-repository")

        print("Capturando docs GitHub …")
        page.goto(
            "https://docs.github.com/en/repositories/creating-and-managing-repositories/creating-a-new-repository",
            wait_until="domcontentloaded",
            timeout=60000,
        )
        page.wait_for_timeout(2000)
        shot_page(page, "09-repo-creado-vacio")

        page.goto(
            "https://docs.github.com/en/account-and-profile/setting-up-and-managing-your-personal-account-on-github/managing-access-to-your-personal-repositories/inviting-collaborators-to-a-personal-repository",
            wait_until="domcontentloaded",
            timeout=60000,
        )
        page.wait_for_timeout(2000)
        shot_page(page, "10-docs-colaboradores")

        browser.close()

    print(f"\nImágenes en: {OUT}")


if __name__ == "__main__":
    main()
