#!/usr/bin/env python3
"""
Rellena / publica una receta JSON en Business Manager Cencosud (local).

Requisitos previos (en TU PC):
  1. secrets/.env con usuario (y opcionalmente password)
  2. Habiendo corrido: python3 scripts/explorar-bm-cencosud.py
     → genera secrets/bm-selectores.json y bm-session.json

Uso:
  python3 scripts/publicar-receta-cencosud.py \\
    index/clientes/Herramientas/carga-recetas-cencosud/out/anticuchos-de-verduras-con-chimichurri.json \\
    --headed --dry-run
"""
from __future__ import annotations

import argparse
import json
import os
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CRC = ROOT / "index/clientes/Herramientas/carga-recetas-cencosud"
SECRETS = CRC / "secrets"
ENV_PATH = SECRETS / ".env"
SESSION_PATH = SECRETS / "bm-session.json"
MAPA_SELECTORES_PATH = SECRETS / "bm-selectores.json"


def load_env(path: Path) -> dict[str, str]:
    data: dict[str, str] = {}
    if path.exists():
        for line in path.read_text(encoding="utf-8").splitlines():
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            k, v = line.split("=", 1)
            data[k.strip()] = v.strip().strip('"').strip("'")
    for k in (
        "CENCOSUD_BM_USER",
        "CENCOSUD_BM_PASSWORD",
        "CENCOSUD_BM_URL",
        "CENCOSUD_BM_BANDERA",
        "CENCOSUD_BM_HEADED",
        "CENCOSUD_BM_DRY_RUN",
    ):
        if os.environ.get(k):
            data[k] = os.environ[k]
    return data


def load_selectores() -> dict:
    if MAPA_SELECTORES_PATH.exists():
        return json.loads(MAPA_SELECTORES_PATH.read_text(encoding="utf-8"))
    return {}


def _scope_editor(page):
    for sel in (
        '[role="dialog"]:visible',
        '[class*="drawer"]:visible',
        '[class*="panel"]:visible',
        '[class*="sidebar"]:visible',
        'form:visible',
    ):
        loc = page.locator(sel).first
        if loc.count():
            return loc
    return page


def _agregar_tag_repeater(page, scope, tag: str) -> bool:
    for pat in (r"agregar\s*item", r"agregar", r"añadir", r"add\s*item"):
        btn = scope.get_by_role("button", name=re.compile(pat, re.I)).first
        if btn.count() and btn.is_visible():
            btn.click()
            page.wait_for_timeout(350)
            break

    inp = scope.get_by_label(re.compile(r"tag\*?", re.I)).last
    if not inp.count():
        inp = scope.locator(
            'input[name*="tag" i]:visible, input[id*="tag" i]:visible, textarea[name*="tag" i]:visible'
        ).last
    if not inp.count():
        inp = scope.locator('input:visible, textarea:visible, [contenteditable="true"]:visible').last
    if not inp.count():
        return False

    inp.click()
    inp.fill(tag)
    page.wait_for_timeout(200)
    page.keyboard.press("Enter")
    page.wait_for_timeout(200)

    for pat in (r"agregar.*arreglo", r"agregar.*tag", r"confirmar", r"aceptar"):
        btn = scope.get_by_role("button", name=re.compile(pat, re.I)).first
        if btn.count() and btn.is_visible():
            btn.click()
            page.wait_for_timeout(300)
            break
    return True


def _guardar_formulario_tags(page, scope) -> bool:
    for pat in (r"^guardar$", r"guardar cambios", r"save", r"aplicar"):
        btn = scope.get_by_role("button", name=re.compile(pat, re.I)).first
        if btn.count() and btn.is_visible():
            btn.click()
            page.wait_for_timeout(700)
            return True
    return False


def _volver_al_canvas(page) -> None:
    for pat in (r"volver", r"regresar", r"back"):
        btn = page.get_by_role("button", name=re.compile(pat, re.I)).first
        if btn.count() and btn.is_visible():
            btn.click()
            page.wait_for_timeout(500)
            return


def _confirmar_si_acepto(page) -> bool:
    dlg = page.locator('text=/cambios sin guardar/i')
    if not dlg.count():
        return False
    btn = page.get_by_role("button", name=re.compile(r"s[ií],\s*acepto", re.I)).first
    if btn.count() and btn.is_visible():
        btn.click()
        page.wait_for_timeout(900)
        return True
    return False


def _abrir_editor_tags(page, selectores: dict) -> None:
    if selectores.get("btn_tags_abrir"):
        page.locator(selectores["btn_tags_abrir"]).first.click()
        page.wait_for_timeout(600)
        return
    page.evaluate(
        """() => {
      const vacio = /componente vac[ií]o|edita este componente/i;
      for (const el of document.querySelectorAll('div, section, article, li')) {
        const lines = (el.innerText || '').split('\\n').map(s => s.trim()).filter(Boolean);
        if (!lines.length || lines[0].toLowerCase() !== 'tags') continue;
        if (!vacio.test(el.innerText || '')) continue;
        const root = el.closest('[class*="component"], [class*="block"], [class*="module"], [class*="widget"]') || el.parentElement;
        if (!root) continue;
        for (const b of root.querySelectorAll('button, a[role="button"], [role="button"]')) {
          const hint = ((b.getAttribute('aria-label') || '') + ' ' + (b.title || '') + ' ' + (b.className || '')).toLowerCase();
          if (hint.includes('edit') || hint.includes('ditar') || hint.includes('lápiz') || hint.includes('lapiz') || hint.includes('pencil')) {
            b.click();
            return;
          }
        }
        const btn = root.querySelector('button, a[role="button"]');
        if (btn) btn.click();
        return;
      }
    }"""
    )
    page.wait_for_timeout(600)


def _tags_guardados(page, tags: list[str]) -> bool:
    return page.evaluate(
        """(expected) => {
      const vacio = /componente vac[ií]o|edita este componente/i;
      for (const el of document.querySelectorAll('div, section, article, li')) {
        const lines = (el.innerText || '').split('\\n').map(s => s.trim()).filter(Boolean);
        if (!lines.length || lines[0].toLowerCase() !== 'tags') continue;
        const text = (el.innerText || '').toLowerCase();
        if (vacio.test(el.innerText || '')) return false;
        return expected.some(t => text.includes(String(t).toLowerCase()));
      }
      return false;
    }""",
        tags,
    )


def fill_tags(page, selectores: dict, categorias: list) -> bool:
    tags = [str(t).strip() for t in (categorias or []) if str(t).strip()]
    if not tags:
        print("  · omitido tags")
        return True
    try:
        print(f"  tags a cargar ({len(tags)}): {', '.join(tags)}")
        _abrir_editor_tags(page, selectores)
        scope = _scope_editor(page)

        ok_items = 0
        for i, tag in enumerate(tags, 1):
            if _agregar_tag_repeater(page, scope, tag):
                ok_items += 1
                print(f"    · item {i}: {tag}")
            else:
                print(f"    ✗ item {i}: no pude agregar «{tag}»")

        if ok_items == 0:
            print("  ✗ tags: ningún ítem en el repetidor Tag*")
            return False

        scope = _scope_editor(page)
        if not _guardar_formulario_tags(page, scope):
            print("  ! tags: sin botón Guardar en el formulario (intento Volver igual)")
        _volver_al_canvas(page)
        _confirmar_si_acepto(page)
        page.wait_for_timeout(1000)

        ok = _tags_guardados(page, tags)
        print(f"  {'✓' if ok else '✗'} tags en canvas ({ok_items}/{len(tags)} ítems)")
        if not ok:
            print("  ✗ el bloque tags sigue vacío en la zona de trabajo")
        return ok
    except Exception as e:
        print(f"  ✗ tags: {e}")
        return False


def fill(page, sel: str | None, value, label: str) -> bool:
    if not sel or value is None or value == "":
        print(f"  · omitido {label}")
        return False
    try:
        loc = page.locator(sel).first
        if not loc.count():
            print(f"  ✗ {label}: no hay nodo {sel}")
            return False
        tag = loc.evaluate("el => el.tagName.toLowerCase()")
        if tag == "select":
            try:
                loc.select_option(label=str(value))
            except Exception:
                loc.select_option(value=str(value))
        else:
            loc.fill(str(value))
        print(f"  ✓ {label}")
        return True
    except Exception as e:
        print(f"  ✗ {label}: {e}")
        return False


def main() -> int:
    ap = argparse.ArgumentParser(description="Cargar receta JSON en Business Manager Cencosud")
    ap.add_argument("json_path", type=Path, help="Ruta al JSON en out/")
    ap.add_argument("--dry-run", action="store_true", help="No publicar; intentar guardar borrador")
    ap.add_argument("--headed", action="store_true", help="Navegador visible (recomendado)")
    ap.add_argument("--no-session", action="store_true", help="No reutilizar bm-session.json")
    args = ap.parse_args()

    path = args.json_path.expanduser().resolve()
    if not path.exists():
        print(f"No existe JSON: {path}", file=sys.stderr)
        return 1

    receta = json.loads(path.read_text(encoding="utf-8"))
    env = load_env(ENV_PATH)
    selectores = load_selectores()
    base_url = env.get("CENCOSUD_BM_URL", "https://business-manager.ecomm.cencosud.com/")
    dry = args.dry_run or env.get("CENCOSUD_BM_DRY_RUN", "true").lower() in ("1", "true", "yes")
    headed = args.headed or env.get("CENCOSUD_BM_HEADED", "true").lower() in ("1", "true", "yes")

    print("=== Carga CRC → BM ===")
    print(f"receta:  {receta.get('titulo')}")
    print(f"estado:  {receta.get('estado')}")
    print(f"dry_run: {dry} · headed: {headed}")

    utiles = {k: v for k, v in selectores.items() if v}
    if len(utiles) < 2:
        print(
            "\nAún no hay selectores útiles en secrets/bm-selectores.json.\n"
            "En TU PC corre primero:\n"
            "  python3 scripts/explorar-bm-cencosud.py\n"
            "Inicia sesión, abre el formulario de receta, pulsa ENTER en la terminal.",
            file=sys.stderr,
        )
        return 2

    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        print("Instala: pip install playwright && playwright install chromium", file=sys.stderr)
        return 1

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=not headed)
        ctx_kwargs = {"viewport": {"width": 1400, "height": 900}}
        if not args.no_session and SESSION_PATH.exists():
            ctx_kwargs["storage_state"] = str(SESSION_PATH)
            print(f"Sesión: {SESSION_PATH}")
        context = browser.new_context(**ctx_kwargs)
        page = context.new_page()
        page.goto(base_url, wait_until="domcontentloaded")

        nav = selectores.get("nav_nueva_receta")
        if nav:
            if str(nav).startswith("http") or str(nav).startswith("/"):
                page.goto(nav if str(nav).startswith("http") else base_url.rstrip("/") + str(nav))
            else:
                try:
                    page.locator(nav).first.click()
                except Exception:
                    print(f"No se pudo navegar con nav_nueva_receta={nav}")

        print("Rellenando…")
        fill(page, selectores.get("field_titulo"), receta.get("titulo"), "titulo")
        fill(page, selectores.get("field_descripcion"), receta.get("descripcion"), "descripcion")
        fill(page, selectores.get("field_porciones"), receta.get("porciones"), "porciones")
        fill(page, selectores.get("field_dificultad"), receta.get("dificultad"), "dificultad")
        fill(page, selectores.get("field_tiempo"), receta.get("tiempoTotal"), "tiempo")
        categorias = receta.get("categorias") or []
        if categorias and not fill_tags(page, selectores, categorias):
            print("\nSTOP: tags no guardados → no se cargan ingredientes ni pasos.", file=sys.stderr)
            context.storage_state(path=str(SESSION_PATH))
            if headed:
                print("Corrige tags en el BM y vuelve a correr el script. ENTER…")
                try:
                    input()
                except EOFError:
                    page.wait_for_timeout(15_000)
            browser.close()
            return 3
        seo = receta.get("seo") or {}
        fill(page, selectores.get("field_meta_titulo"), seo.get("metaTitulo"), "meta_titulo")
        fill(page, selectores.get("field_meta_descripcion"), seo.get("metaDescripcion"), "meta_descripcion")

        ings = receta.get("ingredientes") or []
        if ings:
            texto_ing = "\n".join(
                " ".join(
                    filter(
                        None,
                        [str(i.get("cantidad") or ""), str(i.get("unidad") or ""), str(i.get("nombre") or "")],
                    )
                ).strip()
                for i in ings
            )
            fill(page, selectores.get("field_ingredientes"), texto_ing, "ingredientes")

        pasos = receta.get("pasos") or []
        if pasos:
            texto_pas = "\n".join(f"{p.get('orden')}. {p.get('texto')}" for p in pasos)
            fill(page, selectores.get("field_pasos"), texto_pas, "pasos")

        if dry:
            btn = selectores.get("btn_guardar_borrador")
            if btn:
                try:
                    page.locator(btn).first.click()
                    print("Dry-run: clic guardar borrador.")
                    receta["estado"] = "cargado"
                except Exception as e:
                    print(f"Dry-run: no se pudo guardar borrador ({e}). Revisa la ventana.")
            else:
                print("Dry-run: campos rellenados; sin selector de borrador. Revisa la ventana y guarda a mano si hace falta.")
        else:
            btn = selectores.get("btn_publicar")
            if not btn:
                print("Sin btn_publicar en bm-selectores.json", file=sys.stderr)
            else:
                page.locator(btn).first.click()
                print("Publicado (según flujo BM).")
                receta["estado"] = "publicado"

        path.write_text(json.dumps(receta, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        context.storage_state(path=str(SESSION_PATH))

        if headed:
            print("\nRevisa el BM. ENTER para cerrar…")
            try:
                input()
            except EOFError:
                page.wait_for_timeout(15_000)
        browser.close()

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
