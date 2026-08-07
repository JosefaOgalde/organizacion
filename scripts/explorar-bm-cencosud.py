#!/usr/bin/env python3
"""
Exploración LOCAL del Business Manager Cencosud (Playwright).

Abre el navegador en TU PC, entra con tu sesión (login manual ADFS o
usuario/clave en secrets/.env) y vuelca la estructura del formulario
(labels, inputs, botones, URLs) para poder completar recetas después.

Uso (en tu máquina, carpeta del repo):

  # 1) Credenciales locales (NUNCA las pegues en el chat ni las subas a Git)
  copy secrets\\env.example → secrets\\.env   (Windows)
  # o: cp …/secrets/env.example …/secrets/.env

  # 2) Instalar una vez
  pip install playwright
  playwright install chromium

  # 3) Explorar (navegador visible)
  python3 scripts/explorar-bm-cencosud.py

Flujo:
  - Abre https://business-manager.ecomm.cencosud.com/
  - Si ADFS pide interacción: inicia sesión TÚ en la ventana
  - Cuando estés dentro, navega hasta «Nueva receta» (o el formulario)
  - Vuelve a la terminal y pulsa ENTER → guarda estructura + screenshot
  - Opcional: --fill-json out/anticuchos….json  intenta rellenar campos ya mapeados

Salidas (locales, gitignored):
  secrets/bm-session.json      — cookies de sesión
  secrets/bm-estructura.json   — dump de campos de la página actual
  secrets/bm-screenshot.png    — captura
"""
from __future__ import annotations

import argparse
import json
import os
import re
import sys
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CRC = ROOT / "index/clientes/Herramientas/carga-recetas-cencosud"
SECRETS = CRC / "secrets"
ENV_PATH = SECRETS / ".env"
SESSION_PATH = SECRETS / "bm-session.json"
ESTRUCTURA_PATH = SECRETS / "bm-estructura.json"
SCREENSHOT_PATH = SECRETS / "bm-screenshot.png"
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
        "CENCOSUD_BM_LOGIN_USER_SEL",
        "CENCOSUD_BM_LOGIN_PASS_SEL",
        "CENCOSUD_BM_LOGIN_SUBMIT_SEL",
    ):
        if os.environ.get(k):
            data[k] = os.environ[k]
    return data


def dump_estructura(page) -> dict:
    """Extrae campos visibles de la página actual (sin datos sensibles de valor)."""
    return page.evaluate(
        """() => {
      const clean = (s) => (s || '').replace(/\\s+/g, ' ').trim().slice(0, 200);
      const abs = (el) => {
        if (!el) return null;
        if (el.id) return '#' + CSS.escape(el.id);
        const name = el.getAttribute('name');
        if (name) return el.tagName.toLowerCase() + '[name="' + name.replace(/"/g, '\\\\"') + '"]';
        const aria = el.getAttribute('aria-label');
        if (aria) return el.tagName.toLowerCase() + '[aria-label="' + aria.replace(/"/g, '\\\\"') + '"]';
        return null;
      };
      const fields = [];
      document.querySelectorAll('input, textarea, select, [contenteditable="true"]').forEach((el, i) => {
        if (el.type === 'hidden' || el.type === 'password') return;
        const id = el.id || '';
        let label = '';
        if (id) {
          const lab = document.querySelector('label[for="' + CSS.escape(id) + '"]');
          if (lab) label = clean(lab.innerText);
        }
        if (!label) {
          const wrap = el.closest('label');
          if (wrap) label = clean(wrap.innerText);
        }
        if (!label) {
          const prev = el.closest('div, td, li, section, form');
          if (prev) {
            const lab2 = prev.querySelector('label, .label, [class*="label"], legend');
            if (lab2) label = clean(lab2.innerText);
          }
        }
        fields.push({
          index: i,
          tag: el.tagName.toLowerCase(),
          type: el.type || (el.getAttribute('contenteditable') ? 'contenteditable' : ''),
          id: id || null,
          name: el.getAttribute('name'),
          placeholder: el.getAttribute('placeholder'),
          ariaLabel: el.getAttribute('aria-label'),
          label,
          selectorSugerido: abs(el),
          disabled: !!el.disabled,
          required: !!el.required
        });
      });
      const buttons = [];
      document.querySelectorAll('button, a[role="button"], input[type="submit"], input[type="button"]').forEach((el, i) => {
        const text = clean(el.innerText || el.value || '');
        if (!text) return;
        buttons.push({
          index: i,
          tag: el.tagName.toLowerCase(),
          text,
          id: el.id || null,
          selectorSugerido: abs(el) || (text ? 'text=' + JSON.stringify(text) : null)
        });
      });
      const links = [];
      document.querySelectorAll('a[href]').forEach((el) => {
        const text = clean(el.innerText);
        const href = el.getAttribute('href') || '';
        if (!text || text.length < 2) return;
        if (/receta|recipe|contenido|content|cms|catalogo|catálogo/i.test(text + ' ' + href)) {
          links.push({ text, href });
        }
      });
      const nav = [];
      document.querySelectorAll('nav a, [role="navigation"] a, aside a, .menu a, [class*="sidebar"] a').forEach((el) => {
        const text = clean(el.innerText);
        if (text) nav.push({ text, href: el.getAttribute('href') });
      });
      return {
        url: location.href,
        title: document.title,
        fields,
        buttons: buttons.slice(0, 80),
        linksReceta: links.slice(0, 40),
        nav: nav.slice(0, 60)
      };
    }"""
    )


def sugerir_selectores(estructura: dict) -> dict:
    """Heurística: empareja labels con claves JSON CRC."""
    mapa = {
        "field_titulo": None,
        "field_descripcion": None,
        "field_porciones": None,
        "field_dificultad": None,
        "field_tiempo": None,
        "field_tags": None,
        "field_ingredientes": None,
        "field_pasos": None,
        "field_meta_titulo": None,
        "field_meta_descripcion": None,
        "btn_guardar_borrador": None,
        "btn_publicar": None,
        "nav_nueva_receta": None,
    }
    rules = [
        ("field_titulo", r"t[ií]tulo(?!\s*meta)|nombre\s*(de\s*)?receta|^title$"),
        ("field_descripcion", r"descripci[oó]n|bajada|intro|resumen|summary"),
        ("field_porciones", r"porcion|rinde|servings|personas"),
        ("field_dificultad", r"dificultad|nivel|difficulty"),
        ("field_tiempo", r"tiempo|duraci[oó]n|minutos|prep"),
        ("field_tags", r"tag|etiqueta|categor|palabra"),
        ("field_ingredientes", r"ingrediente"),
        ("field_pasos", r"paso|instrucci|preparaci[oó]n|c[oó]mo\s+prepar"),
        ("field_meta_titulo", r"meta\s*t[ií]tulo|seo\s*title"),
        ("field_meta_descripcion", r"meta\s*descripci|seo\s*desc"),
    ]
    for field in estructura.get("fields") or []:
        blob = " ".join(
            filter(
                None,
                [
                    field.get("label"),
                    field.get("placeholder"),
                    field.get("ariaLabel"),
                    field.get("name"),
                    field.get("id"),
                ],
            )
        ).lower()
        sel = field.get("selectorSugerido")
        if not sel:
            continue
        for key, pat in rules:
            if mapa[key]:
                continue
            if re.search(pat, blob, re.I):
                mapa[key] = sel
    for btn in estructura.get("buttons") or []:
        t = (btn.get("text") or "").lower()
        sel = btn.get("selectorSugerido")
        if not sel:
            continue
        if not mapa["btn_publicar"] and re.search(r"publicar|publish", t):
            mapa["btn_publicar"] = sel
        if not mapa["btn_guardar_borrador"] and re.search(r"guardar|borrador|save|draft", t):
            mapa["btn_guardar_borrador"] = sel
    for link in (estructura.get("linksReceta") or []) + (estructura.get("nav") or []):
        t = (link.get("text") or "").lower()
        if re.search(r"nueva\s+receta|crear\s+receta|new\s+recipe|agregar\s+receta", t):
            href = link.get("href")
            if href:
                mapa["nav_nueva_receta"] = href
            break
    return mapa


def try_login(page, env: dict) -> None:
    user = env.get("CENCOSUD_BM_USER") or ""
    password = env.get("CENCOSUD_BM_PASSWORD") or ""
    if not user or not password:
        print("Sin USER/PASSWORD en .env → harás login manual en la ventana del navegador.")
        return
    user_sel = env.get("CENCOSUD_BM_LOGIN_USER_SEL") or 'input[type="email"], input[name="username"], input[name="loginfmt"], #userNameInput, input[type="text"]'
    pass_sel = env.get("CENCOSUD_BM_LOGIN_PASS_SEL") or 'input[type="password"], input[name="password"], #passwordInput'
    submit_sel = env.get("CENCOSUD_BM_LOGIN_SUBMIT_SEL") or 'button[type="submit"], input[type="submit"], #idSIButton9'
    try:
        page.wait_for_timeout(1500)
        u = page.locator(user_sel).first
        if u.count() and u.is_visible():
            u.fill(user)
            print("Usuario rellenado (si el formulario lo permite).")
            # a veces hay paso intermedio
            btn = page.locator(submit_sel).first
            if btn.count() and btn.is_visible():
                btn.click()
                page.wait_for_timeout(1500)
        p = page.locator(pass_sel).first
        if p.count() and p.is_visible():
            p.fill(password)
            btn = page.locator(submit_sel).first
            if btn.count() and btn.is_visible():
                btn.click()
            print("Contraseña enviada. Si pide MFA/ADFS, completa en la ventana.")
    except Exception as e:
        print(f"Login automático parcial falló ({e}). Continúa a mano en el navegador.")


def fill_from_receta(page, receta: dict, selectores: dict, dry_run: bool) -> None:
    def fill(key: str, value: str | None) -> None:
        sel = selectores.get(key)
        if not sel or value is None:
            return
        try:
            loc = page.locator(sel).first
            if loc.count():
                loc.fill(str(value))
                print(f"  ✓ {key}")
            else:
                print(f"  ✗ {key} (no encontrado: {sel})")
        except Exception as e:
            print(f"  ✗ {key}: {e}")

    print("Rellenando desde JSON…")
    fill("field_titulo", receta.get("titulo"))
    fill("field_descripcion", receta.get("descripcion"))
    fill("field_porciones", receta.get("porciones"))
    fill("field_dificultad", receta.get("dificultad"))
    fill("field_tiempo", receta.get("tiempoTotal"))
    fill("field_tags", ", ".join(receta.get("categorias") or []))
    seo = receta.get("seo") or {}
    fill("field_meta_titulo", seo.get("metaTitulo"))
    fill("field_meta_descripcion", seo.get("metaDescripcion"))
    ings = receta.get("ingredientes") or []
    if ings:
        texto_ing = "\n".join(
            " ".join(
                filter(
                    None,
                    [
                        str(i.get("cantidad") or "").strip(),
                        str(i.get("unidad") or "").strip(),
                        str(i.get("nombre") or "").strip(),
                    ],
                )
            ).strip()
            for i in ings
        )
        fill("field_ingredientes", texto_ing)
    pasos = receta.get("pasos") or []
    if pasos:
        texto_pas = "\n".join(f"{p.get('orden')}. {p.get('texto')}" for p in pasos)
        fill("field_pasos", texto_pas)

    if dry_run:
        btn = selectores.get("btn_guardar_borrador")
        if btn:
            try:
                page.locator(btn).first.click()
                print("Clic en guardar borrador (dry-run).")
            except Exception as e:
                print(f"No se pudo guardar borrador: {e}")
        else:
            print("Dry-run: sin selector de borrador; campos rellenados, sin publicar.")
    else:
        btn = selectores.get("btn_publicar")
        if btn:
            page.locator(btn).first.click()
            print("Clic en publicar.")
        else:
            print("Sin selector btn_publicar.")


def main() -> int:
    ap = argparse.ArgumentParser(description="Explorar / mapear Business Manager Cencosud en local")
    ap.add_argument("--fill-json", type=Path, help="Tras mapear, rellenar esta receta JSON")
    ap.add_argument("--publish", action="store_true", help="Permitir clic en Publicar (default: solo borrador/dry-run)")
    ap.add_argument("--reuse-session", action="store_true", help="Reutilizar secrets/bm-session.json si existe")
    ap.add_argument("--timeout-ms", type=int, default=300_000, help="Espera máxima login manual")
    args = ap.parse_args()

    SECRETS.mkdir(parents=True, exist_ok=True)
    env = load_env(ENV_PATH)
    base = env.get("CENCOSUD_BM_URL") or "https://business-manager.ecomm.cencosud.com/"
    dry_run = not args.publish

    if not ENV_PATH.exists():
        print(
            f"Crea {ENV_PATH.relative_to(ROOT)} copiando secrets/env.example\n"
            "Pon ahí CENCOSUD_BM_USER y CENCOSUD_BM_PASSWORD (solo en tu PC)."
        )

    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        print("Instala: pip install playwright && playwright install chromium", file=sys.stderr)
        return 1

    print("=== Exploración BM Cencosud (local) ===")
    print(f"URL: {base}")
    print("1) Se abre Chromium.")
    print("2) Inicia sesión (automático si .env tiene user/pass; si no, a mano / MFA).")
    print("3) Navega hasta el formulario de NUEVA RECETA.")
    print("4) Vuelve aquí y pulsa ENTER para capturar la estructura.")
    print()

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        context_kwargs = {"viewport": {"width": 1400, "height": 900}}
        if args.reuse_session and SESSION_PATH.exists():
            context_kwargs["storage_state"] = str(SESSION_PATH)
            print(f"Reusando sesión: {SESSION_PATH}")
        context = browser.new_context(**context_kwargs)
        page = context.new_page()
        page.goto(base, wait_until="domcontentloaded")
        try_login(page, env)

        print(
            "\n>>> Cuando veas el formulario de receta (o el menú interno del BM),\n"
            "    pulsa ENTER en esta terminal para volcar la estructura…"
        )
        try:
            input()
        except EOFError:
            print("Sin TTY: esperando 60s para que completes login/navegación…")
            page.wait_for_timeout(60_000)

        estructura = dump_estructura(page)
        estructura["capturadoEn"] = datetime.now(timezone.utc).isoformat()
        ESTRUCTURA_PATH.write_text(json.dumps(estructura, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        page.screenshot(path=str(SCREENSHOT_PATH), full_page=True)
        context.storage_state(path=str(SESSION_PATH))

        sugeridos = sugerir_selectores(estructura)
        # fusionar con mapa previo si existe
        if MAPA_SELECTORES_PATH.exists():
            prev = json.loads(MAPA_SELECTORES_PATH.read_text(encoding="utf-8"))
            for k, v in sugeridos.items():
                if v and not prev.get(k):
                    prev[k] = v
                elif k not in prev:
                    prev[k] = v
            sugeridos = prev
        MAPA_SELECTORES_PATH.write_text(json.dumps(sugeridos, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

        print(f"\nGuardado:")
        print(f"  estructura: {ESTRUCTURA_PATH.relative_to(ROOT)}")
        print(f"  selectores: {MAPA_SELECTORES_PATH.relative_to(ROOT)}")
        print(f"  screenshot: {SCREENSHOT_PATH.relative_to(ROOT)}")
        print(f"  sesión:     {SESSION_PATH.relative_to(ROOT)}")
        print(f"\nCampos detectados: {len(estructura.get('fields') or [])}")
        print(f"Botones: {len(estructura.get('buttons') or [])}")
        print("Selectores sugeridos:")
        for k, v in sugeridos.items():
            print(f"  {k}: {v}")

        if args.fill_json:
            path = args.fill_json.expanduser().resolve()
            if not path.exists():
                print(f"No existe JSON: {path}", file=sys.stderr)
                browser.close()
                return 1
            receta = json.loads(path.read_text(encoding="utf-8"))
            fill_from_receta(page, receta, sugeridos, dry_run=dry_run)
            print("\nRevisa la ventana del BM. Si faltó algún campo, edita secrets/bm-selectores.json y reintenta.")
            print("Pulsa ENTER para cerrar el navegador…")
            try:
                input()
            except EOFError:
                page.wait_for_timeout(10_000)

        browser.close()

    print(
        "\nSiguiente: revisa bm-estructura.json y ajusta bm-selectores.json.\n"
        "Luego: python3 scripts/publicar-receta-cencosud.py out/….json --headed"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
