#!/usr/bin/env python3
"""
Rellena receta JSON en Business Manager Cencosud (local).

Uso tags (default — PARA después de cargar tags):
  python scripts\\publicar-receta-cencosud.py out\\receta.json --headed

Siguiente paso (ingredientes, pasos, seo) solo si tags ya guardados:
  python scripts\\publicar-receta-cencosud.py out\\receta.json --headed --continuar
"""
from __future__ import annotations

import argparse
import json
import os
import re
import sys
from pathlib import Path

CRC_VERSION = "2026-08-24-tags-v2"

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


def pausa_usuario(msg: str) -> None:
    print(msg)
    try:
        input()
    except EOFError:
        pass


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


def _abrir_lapiz_componente(page, nombre: str) -> bool:
    want = nombre.lower()

    # 1) Bloque en ZONA DE TRABAJO (no paleta izquierda): tiene «tags» + «componente vacío» o «Id:»
    ok = page.evaluate(
        """(want) => {
      const vacio = /componente vac[ií]o|edita este componente/i;
      const idPat = /Id:\\s*[a-f0-9]{4,}/i;
      const isPalette = (el) => {
        let n = el;
        while (n) {
          const c = (n.className || '') + ' ' + (n.getAttribute('class') || '');
          const t = (n.innerText || '').slice(0, 80).toLowerCase();
          if (/paleta|palette|sidebar|components-list/i.test(c)) return true;
          if (/paleta de componentes/i.test(t)) return true;
          if (n.tagName === 'ASIDE') return true;
          n = n.parentElement;
        }
        return false;
      };
      const candidates = [];
      for (const el of document.querySelectorAll('div, section, article')) {
        if (isPalette(el)) continue;
        const t = el.innerText || '';
        if (!vacio.test(t) && !idPat.test(t)) continue;
        const lines = t.split('\\n').map(s => s.trim()).filter(Boolean);
        if (!lines.some(l => l.toLowerCase() === want)) continue;
        candidates.push(el);
      }
      candidates.sort((a, b) => (a.innerText || '').length - (b.innerText || '').length);
      const root = candidates[0];
      if (!root) return false;
      const buttons = [...root.querySelectorAll('button, a[role="button"], [role="button"]')]
        .filter(b => b.offsetParent !== null);
      for (const b of buttons) {
        const hint = ((b.getAttribute('aria-label') || '') + ' ' + (b.title || '') + ' ' + (b.className || '')).toLowerCase();
        if (/edit|ditar|lápiz|lapiz|pencil/.test(hint)) { b.click(); return true; }
      }
      if (buttons[0]) { buttons[0].click(); return true; }
      return false;
    }""",
        want,
    )
    page.wait_for_timeout(700)
    if ok:
        return True

    # 2) Playwright: bloque con «componente vacío» + título exacto
    bloque = (
        page.locator("div, section, article")
        .filter(has_text=re.compile(r"componente vac[ií]o", re.I))
        .filter(has=page.get_by_text(nombre, exact=True))
        .last
    )
    if bloque.count():
        lapiz = bloque.locator("button, [role='button']").first
        if lapiz.count() and lapiz.is_visible():
            lapiz.click()
            page.wait_for_timeout(700)
            return True

    return False


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
    page.wait_for_timeout(250)
    return True


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
        print("  · sin tags en JSON")
        return True

    print(f"[CMS] Abriendo componente «tags» en la zona de trabajo…")
    abierto = False
    if selectores.get("btn_tags_abrir"):
        loc = page.locator(selectores["btn_tags_abrir"]).first
        if loc.count():
            try:
                loc.click()
                page.wait_for_timeout(700)
                abierto = True
            except Exception:
                pass
    if not abierto:
        abierto = _abrir_lapiz_componente(page, "tags")
    if not abierto:
        print("  ✗ no pude abrir el lápiz de «tags» (¿estás en la zona de trabajo?)")
        return False
    print("  lápiz OK «tags»")

    print(f"  tags a cargar ({len(tags)}): {', '.join(tags)}")
    scope = _scope_editor(page)
    ok_items = 0
    for i, tag in enumerate(tags, 1):
        if _agregar_tag_repeater(page, scope, tag):
            ok_items += 1
            print(f"    · item {i}: {tag}")
        else:
            print(f"    ✗ item {i}: «{tag}»")

    if ok_items == 0:
        return False

    print("\n  === PARA AQUÍ ===")
    print("  El script NO hace clic en Volver ni en «Sí, acepto».")
    print("  Tú: Guardar (si hace falta) → Volver → «Sí, acepto» en el popup azul.")
    pausa_usuario("  Cuando el bloque tags ya NO diga «componente vacío», pulsa ENTER…")

    ok = _tags_guardados(page, tags)
    print(f"  {'✓' if ok else '✗'} tags en canvas ({ok_items}/{len(tags)})")
    return ok


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
    ap.add_argument("--dry-run", action="store_true", help="No publicar al final")
    ap.add_argument("--headed", action="store_true", help="Navegador visible (recomendado)")
    ap.add_argument("--continuar", action="store_true", help="Tags ya guardados → ingredientes/pasos/seo")
    ap.add_argument("--no-session", action="store_true", help="No reutilizar bm-session.json")
    args = ap.parse_args()

    path = args.json_path.expanduser().resolve()
    if not path.exists():
        print(f"No existe JSON: {path}", file=sys.stderr)
        return 1

    receta = json.loads(path.read_text(encoding="utf-8"))
    env = load_env(ENV_PATH)
    selectores = load_selectores()
    dry = args.dry_run or env.get("CENCOSUD_BM_DRY_RUN", "true").lower() in ("1", "true", "yes")
    headed = args.headed or env.get("CENCOSUD_BM_HEADED", "true").lower() in ("1", "true", "yes")

    print(f"=== Carga CRC → BM · script {CRC_VERSION} ===")
    print(f"receta:  {receta.get('titulo')}")
    print(f"modo:    {'continuar (ingredientes+)' if args.continuar else 'SOLO TAGS — para al terminar'}")
    print(f"dry_run: {dry} · headed: {headed}")

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
        context = browser.new_context(**ctx_kwargs)
        page = context.new_page()

        pausa_usuario(
            "\n1) En ESTA ventana de Chromium: abre la receta hasta ver la ZONA DE TRABAJO\n"
            "   (bloques: cabecera, tags, ingredientes…)\n"
            "2) Pulsa ENTER aquí (no navego a otra URL)…"
        )

        if not args.continuar:
            categorias = receta.get("categorias") or []
            ok = fill_tags(page, selectores, categorias)
            context.storage_state(path=str(SESSION_PATH))
            if ok:
                print("\n=== FIN — tags OK ===")
                print("Para ingredientes después:")
                print(f'  python scripts\\publicar-receta-cencosud.py "{path}" --headed --continuar')
            else:
                print("\n=== FIN — tags NO guardados ===", file=sys.stderr)
            pausa_usuario("ENTER para cerrar…")
            browser.close()
            return 0 if ok else 3

        # --continuar: ingredientes, instrucciones, seo (tags ya hechos a mano)
        print("[CMS] Modo continuar — asumo tags ya guardados en el canvas.")
        if _abrir_lapiz_componente(page, "ingredientes"):
            print("  lápiz OK «ingredientes»")
            scope = _scope_editor(page)
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
            pausa_usuario("Revisa ingredientes, guarda/volver, ENTER…")

        if _abrir_lapiz_componente(page, "instrucciones") or _abrir_lapiz_componente(page, "lista de instrucciones"):
            pasos = receta.get("pasos") or []
            if pasos:
                texto_pas = "\n".join(f"{p.get('orden')}. {p.get('texto')}" for p in pasos)
                fill(page, selectores.get("field_pasos"), texto_pas, "pasos")
            pausa_usuario("Revisa instrucciones, ENTER…")

        seo = receta.get("seo") or {}
        if _abrir_lapiz_componente(page, "seo"):
            fill(page, selectores.get("field_meta_titulo"), seo.get("metaTitulo"), "meta_titulo")
            fill(page, selectores.get("field_meta_descripcion"), seo.get("metaDescripcion"), "meta_descripcion")

        context.storage_state(path=str(SESSION_PATH))
        pausa_usuario("\nListo. ENTER para cerrar…")
        browser.close()

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
