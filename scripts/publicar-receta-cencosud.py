#!/usr/bin/env python3
"""
CRC — Carga recetas en Business Manager Cencosud (local).

Solo tags (cabecera ya OK en el canvas):
  python scripts\\publicar-receta-cencosud.py out\\receta.json

El navegador se abre visible por defecto. Sin ventana: --headless
"""
from __future__ import annotations

import argparse
import json
import os
import re
import sys
from pathlib import Path

CRC_VERSION = "2026-08-24-tags-v10"

ROOT = Path(__file__).resolve().parents[1]
CRC = ROOT / "index/clientes/Herramientas/carga-recetas-cencosud"
SECRETS = CRC / "secrets"
ENV_PATH = SECRETS / ".env"
SESSION_PATH = SECRETS / "bm-session.json"
MAPA_SELECTORES_PATH = SECRETS / "bm-selectores.json"
ESTRUCTURA_PATH = SECRETS / "bm-estructura.json"


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
        "CENCOSUD_BM_RECETA_URL",
        "CENCOSUD_BM_TAGS_URL",
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


def navegar_a_tags_o_canvas(page, env: dict, selectores: dict, receta: dict) -> str:
    """Abre el BM: URL de tags si está en .env; si no, zona de trabajo (canvas)."""
    if env.get("CENCOSUD_BM_TAGS_URL"):
        base = env.get("CENCOSUD_BM_URL", "https://business-manager.ecomm.cencosud.com/").rstrip("/")
        url = env["CENCOSUD_BM_TAGS_URL"]
        if url.startswith("/"):
            url = base + url
        print(f"  → tags: {url[:100]}…")
        page.goto(url, wait_until="domcontentloaded", timeout=120_000)
        page.wait_for_timeout(2500)
        return url
    return navegar_a_canvas(page, env, selectores, receta)


def navegar_a_canvas(page, env: dict, selectores: dict, receta: dict) -> str:
    """Zona de trabajo (cabecera + tags + …). No abre el editor de tags."""
    base = env.get("CENCOSUD_BM_URL", "https://business-manager.ecomm.cencosud.com/").rstrip("/")
    candidatos: list[str] = []

    if env.get("CENCOSUD_BM_RECETA_URL"):
        candidatos.append(env["CENCOSUD_BM_RECETA_URL"])

    for k in ("url_canvas", "url_editor_receta", "url_editor", "receta_editor_url", "bmUrl", "urlEditor"):
        v = selectores.get(k) or receta.get(k)
        if v:
            candidatos.append(str(v))

    if ESTRUCTURA_PATH.exists():
        try:
            u = str(json.loads(ESTRUCTURA_PATH.read_text(encoding="utf-8")).get("url") or "")
            if u and "/edit/component" not in u:
                candidatos.append(u)
        except Exception:
            pass

    url = candidatos[0] if candidatos else f"{base}/"
    if url.startswith("/"):
        url = base + url
    print(f"  → canvas: {url[:100]}…")
    page.goto(url, wait_until="domcontentloaded", timeout=120_000)
    page.wait_for_timeout(2500)
    return url


def _resolver_headed(args, env: dict) -> bool:
    """CRC es interactivo: navegador visible salvo --headless o CENCOSUD_BM_HEADED=false."""
    if getattr(args, "headless", False):
        return False
    if env.get("CENCOSUD_BM_HEADED", "").lower() in ("0", "false", "no"):
        return False
    return True


def en_zona_trabajo(page) -> bool:
    return page.evaluate(
        """() => {
      const t = document.body.innerText || '';
      return /zona de trabajo/i.test(t) && /tags/i.test(t);
    }"""
    )


def en_formulario_tags(page) -> bool:
    return page.evaluate(
        """() => {
      const t = document.body.innerText || '';
      const href = location.href || '';
      if (/formulario tags|edici[oó]n de tags/i.test(t)) return true;
      if (href.includes('/edit/component') && /tag/i.test(t + document.title)) return true;
      return false;
    }"""
    )


def _abrir_lapiz_tags(page) -> bool:
    ok = page.evaluate(
        """() => {
      const isPalette = (el) => {
        let n = el;
        while (n) {
          const c = (n.className || '') + ' ' + (n.getAttribute('class') || '');
          if (/paleta|palette|sidebar/i.test(c)) return true;
          if (n.tagName === 'ASIDE') return true;
          n = n.parentElement;
        }
        return false;
      };
      const candidates = [];
      for (const el of document.querySelectorAll('div, section, article')) {
        if (isPalette(el)) continue;
        const t = el.innerText || '';
        const lines = t.split('\\n').map(s => s.trim()).filter(Boolean);
        if (!lines.some(l => l.toLowerCase() === 'tags')) continue;
        if (!/componente vac[ií]o|edita este componente|Id:\\s*[a-f0-9]{4,}/i.test(t)) continue;
        candidates.push(el);
      }
      candidates.sort((a, b) => (a.innerText || '').length - (b.innerText || '').length);
      const root = candidates[0];
      if (!root) return false;
      const buttons = [...root.querySelectorAll('button, [role="button"]')].filter(b => b.offsetParent);
      for (const b of buttons) {
        const h = ((b.getAttribute('aria-label') || '') + ' ' + (b.title || '') + ' ' + (b.className || '')).toLowerCase();
        if (/edit|ditar|lápiz|lapiz|pencil/.test(h)) { b.click(); return true; }
      }
      if (buttons[0]) { buttons[0].click(); return true; }
      return false;
    }"""
    )
    page.wait_for_timeout(1000)
    return bool(ok)


def _click_btn(page, patrones: tuple[str, ...]) -> bool:
    for pat in patrones:
        btn = page.get_by_role("button", name=re.compile(pat, re.I)).first
        if btn.count() and btn.is_visible():
            btn.click()
            page.wait_for_timeout(600)
            return True
    return False


def _agregar_item_arreglo(page) -> bool:
    return _click_btn(
        page,
        (
            r"agregar\s+nuevo\s*ítem",
            r"agregar\s+nuevo\s*item",
            r"agregar\s*item",
            r"agregar\s*ítem",
            r"agregar",
            r"añadir",
        ),
    )


def _abrir_item_arreglo(page, n: int) -> bool:
    """Expande «Formulario Ítem N» (desplegable). No colapsa si ya está abierto."""
    inputs = page.get_by_label(re.compile(r"tag\s*\*?", re.I))
    try:
        if inputs.count() >= n and inputs.nth(n - 1).is_visible():
            return True
    except Exception:
        pass

    for pat in (
        rf"Formulario\s+Ítem\s+{n}",
        rf"Formulario\s+Item\s+{n}",
        rf"Formulario\s+ítem\s+{n}",
        rf"ítem\s+{n}",
        rf"item\s+{n}",
    ):
        item = page.get_by_text(re.compile(pat, re.I)).first
        if not item.count():
            continue
        try:
            item.scroll_into_view_if_needed(timeout=8000)
            item.click(timeout=5000)
            page.wait_for_timeout(650)
            if inputs.count() >= n and inputs.nth(n - 1).is_visible():
                return True
        except Exception:
            continue

    # Chevron / cabecera del acordeón
    bloque = page.locator("div, section, li").filter(
        has_text=re.compile(rf"Formulario\s+Í?tem\s+{n}", re.I)
    )
    for chevron in (
        bloque.locator("[class*='chevron'], [class*='expand'], button").first,
        bloque.get_by_role("button").first,
    ):
        if chevron.count():
            try:
                chevron.click(timeout=3000)
                page.wait_for_timeout(500)
                if inputs.count() >= n and inputs.nth(n - 1).is_visible():
                    return True
            except Exception:
                pass
    return False


def _escribir_tag_item(page, n: int, tag: str) -> bool:
    """Escribe en el Tag* del ítem N (tras expandir). Verifica input_value()."""
    tag = tag.strip()
    if not _abrir_item_arreglo(page, n):
        print(f"    ! ítem {n}: no pude expandir desplegable")

    candidatos = [
        page.get_by_label(re.compile(r"tag\s*\*?", re.I)).nth(n - 1),
        page.locator('input[name*="tag" i]:visible').nth(n - 1),
        page.get_by_label(re.compile(r"tag\s*\*?", re.I)).last,
        page.locator('input[placeholder*="valor" i]:visible').nth((n - 1) * 2),
    ]

    for inp in candidatos:
        if not inp.count():
            continue
        try:
            inp.wait_for(state="visible", timeout=5000)
        except Exception:
            continue
        for _ in range(3):
            try:
                inp.scroll_into_view_if_needed(timeout=5000)
                inp.click(timeout=5000)
                page.wait_for_timeout(100)
                inp.fill(tag, timeout=5000)
                page.wait_for_timeout(200)
                inp.press("Tab")
                page.wait_for_timeout(250)
                if inp.input_value().strip() == tag:
                    return True
                inp.click(force=True, timeout=3000)
                page.keyboard.press("Control+a")
                page.keyboard.type(tag, delay=25)
                page.wait_for_timeout(200)
                inp.press("Tab")
                page.wait_for_timeout(250)
                if inp.input_value().strip() == tag:
                    return True
            except Exception:
                page.wait_for_timeout(300)
    return False


def _agregar_y_rellenar_tag(page, tag: str, indice: int) -> bool:
    """Flujo v5 probado: Agregar ítem → expandir → escribir Tag*."""
    if indice > 0:
        if not _agregar_item_arreglo(page):
            return False
        page.wait_for_timeout(700)
    return _escribir_tag_item(page, indice + 1, tag)


def _tags_en_formulario(page, tags: list[str]) -> int:
    """Cuántos Tag* del formulario coinciden con lo esperado (orden 1..n)."""
    inputs = page.get_by_label(re.compile(r"tag\s*\*?", re.I))
    ok = 0
    for i, esperado in enumerate(tags):
        if i >= inputs.count():
            break
        try:
            if inputs.nth(i).input_value().strip() == esperado.strip():
                ok += 1
        except Exception:
            break
    return ok


def _tags_en_canvas(page, tags: list[str]) -> bool:
    return page.evaluate(
        """(expected) => {
      const vacio = /componente vac[ií]o|edita este componente/i;
      for (const el of document.querySelectorAll('div, section, article')) {
        const lines = (el.innerText || '').split('\\n').map(s => s.trim()).filter(Boolean);
        if (!lines.length || lines[0].toLowerCase() !== 'tags') continue;
        if (vacio.test(el.innerText || '')) return false;
        const text = (el.innerText || '').toLowerCase();
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

    if en_formulario_tags(page):
        print("  ✓ ya en «Edición de tags» — relleno directo")
    elif not en_formulario_tags(page):
        print("[1] Abro lápiz del bloque «tags» en zona de trabajo…")
        if selectores.get("btn_tags_abrir"):
            page.locator(selectores["btn_tags_abrir"]).first.click()
            page.wait_for_timeout(1000)
        elif not _abrir_lapiz_tags(page):
            print("  ! no encontré el lápiz — si ya ves «Edición de tags», sigo")
        else:
            print("  ✓ lápiz tags")
        page.wait_for_timeout(1000)

    if not en_formulario_tags(page):
        print("  ✗ no estoy en «Edición de tags» / Formulario Tags")
        return False

    print(f"[2] Cargo {len(tags)} tags (1 ítem = 1 tag):")
    ok = 0
    for i, tag in enumerate(tags):
        if _agregar_y_rellenar_tag(page, tag, i):
            ok += 1
            print(f"  ✓ ítem {i + 1}: {tag}")
        else:
            print(f"  ✗ ítem {i + 1}: falló «{tag}»")

    verificado = _tags_en_formulario(page, tags)
    if verificado < len(tags):
        print(f"  ✗ verificación formulario: {verificado}/{len(tags)} — NO guardo")
        return False
    ok = verificado

    # 3) Guardar formulario
    print("[3] Guardar formulario tags…")
    _click_btn(page, (r"^guardar$", r"guardar cambios", r"save"))

    # 4) Volver al canvas (abre popup)
    print("[4] Volver al canvas…")
    if not _click_btn(page, (r"volver", r"regresar", r"back")):
        print("  ! no encontré Volver — hazlo a mano")

    page.wait_for_timeout(800)

    # 5) Popup azul — tú confirmas
    print("\n[5] POPUP: haz clic en «Sí, acepto» (azul).")
    pausa_usuario("     Cuando el bloque tags en el canvas ya NO diga «vacío», pulsa ENTER…")

    guardado = _tags_en_canvas(page, tags)
    print(f"  {'✓' if guardado else '✗'} tags guardados en canvas ({ok}/{len(tags)})")
    return guardado


def fill(page, sel: str | None, value, label: str) -> bool:
    if not sel or value is None or value == "":
        return False
    try:
        loc = page.locator(sel).first
        if loc.count():
            loc.fill(str(value))
            print(f"  ✓ {label}")
            return True
    except Exception as e:
        print(f"  ✗ {label}: {e}")
    return False


def main() -> int:
    ap = argparse.ArgumentParser(description="CRC — Business Manager Cencosud")
    ap.add_argument("json_path", type=Path)
    ap.add_argument("--headed", action="store_true", help="(legacy) Igual que default: navegador visible")
    ap.add_argument("--headless", action="store_true", help="Sin ventana de navegador")
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--continuar", action="store_true", help="Tags OK → ingredientes/pasos/seo")
    ap.add_argument("--no-session", action="store_true")
    args = ap.parse_args()

    path = args.json_path.expanduser().resolve()
    if not path.exists():
        print(f"No existe: {path}", file=sys.stderr)
        return 1

    receta = json.loads(path.read_text(encoding="utf-8"))
    env = load_env(ENV_PATH)
    selectores = load_selectores()
    headed = _resolver_headed(args, env)

    print(f"=== CRC · {CRC_VERSION} ===")
    print(f"receta: {receta.get('titulo')}")
    print(f"modo:   {'continuar' if args.continuar else 'SOLO TAGS'}")
    print(f"browser: {'VISIBLE (Chromium)' if headed else 'headless'}")

    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        print("pip install playwright && playwright install chromium", file=sys.stderr)
        return 1

    with sync_playwright() as p:
        print("Abriendo Chromium…")
        try:
            browser = p.chromium.launch(
                headless=not headed,
                args=["--start-maximized"] if headed else [],
            )
        except Exception as e:
            print(f"✗ No pude abrir Chromium: {e}", file=sys.stderr)
            print("  Prueba: playwright install chromium", file=sys.stderr)
            return 1
        ctx: dict = {"viewport": {"width": 1400, "height": 900}}
        if not args.no_session and SESSION_PATH.exists():
            ctx["storage_state"] = str(SESSION_PATH)
        context = browser.new_context(**ctx)
        page = context.new_page()

        if args.continuar:
            navegar_a_canvas(page, env, selectores, receta)
        else:
            navegar_a_tags_o_canvas(page, env, selectores, receta)

        if not en_zona_trabajo(page) and not en_formulario_tags(page):
            pausa_usuario("Si no cargó la receta/tags, ábrelo en Chromium y pulsa ENTER…")

        if not args.continuar:
            ok = fill_tags(page, selectores, receta.get("categorias") or [])
            context.storage_state(path=str(SESSION_PATH))
            if ok:
                print("\n=== TAGS OK ===")
                print(f'python scripts\\publicar-receta-cencosud.py "{path}" --headed --continuar')
            pausa_usuario("ENTER para cerrar…")
            browser.close()
            return 0 if ok else 3

        # continuar: ingredientes, etc.
        print("[CMS] ingredientes / instrucciones / seo — manual por ahora")
        pausa_usuario("ENTER…")
        browser.close()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
