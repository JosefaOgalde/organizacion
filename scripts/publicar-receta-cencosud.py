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

El BM Jumbo es CMS por componentes: este script espera a que abras la ficha,
luego abre cada lápiz solo (Cabecera, tags, ingredientes, instrucciones, SEO)
y guarda cada editor.
"""
from __future__ import annotations

import argparse
import importlib.util
import json
import os
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CRC = ROOT / "index/clientes/Herramientas/carga-recetas-cencosud"
SECRETS = CRC / "secrets"
ENV_PATH = SECRETS / ".env"
SESSION_PATH = SECRETS / "bm-session.json"
MAPA_SELECTORES_PATH = SECRETS / "bm-selectores.json"
CAMPOS_REQUERIDOS_PUBLICACION = ("titulo", "descripcion", "ingredientes", "pasos")
CAMPOS_FALTANTES_NO_BLOQUEANTES = {"ingredientes.skuCencosud"}
EXPLORAR_PATH = ROOT / "scripts/explorar-bm-cencosud.py"


def _cargar_explorar():
    spec = importlib.util.spec_from_file_location("explorar_bm_cencosud", EXPLORAR_PATH)
    modulo = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(modulo)
    return modulo


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
        "CENCOSUD_BM_VIEW_MANAGER_URL",
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


def errores_prepublicacion(receta: dict) -> list[str]:
    errores = []
    if receta.get("estado") != "listo-para-cargar":
        errores.append(f"estado={receta.get('estado')!s} (se requiere listo-para-cargar)")

    campos_faltantes = [
        str(campo)
        for campo in receta.get("camposFaltantes") or []
        if str(campo).strip() and str(campo) not in CAMPOS_FALTANTES_NO_BLOQUEANTES
    ]
    if campos_faltantes:
        errores.append("camposFaltantes=" + ", ".join(campos_faltantes))

    vacios = [campo for campo in CAMPOS_REQUERIDOS_PUBLICACION if not receta.get(campo)]
    if vacios:
        errores.append("campos requeridos vacíos=" + ", ".join(vacios))
    return errores


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


def refrescar_lapices_desde_pagina(explorar, page, selectores: dict) -> list[dict]:
    comps = explorar.listar_componentes_cms(page)
    clave_a_lapiz = {c["clave"]: c["lapiz_key"] for c in explorar.COMPONENTES_CMS}
    for c in comps:
        key = clave_a_lapiz.get(c.get("clave"))
        if key and c.get("lapizSelector"):
            selectores[key] = c["lapizSelector"]
    return comps


def intentar_buscar_vista(page, titulo: str) -> None:
    """En el Administrador de vistas, escribe el título en «Busca alguna vista»."""
    if not titulo:
        return
    for sel in (
        'input[placeholder*="Busca alguna vista" i]',
        'input[placeholder*="Busca" i]',
        'input[type="search"]',
        'input[aria-label*="Busca" i]',
    ):
        try:
            loc = page.locator(sel).first
            if loc.count() and loc.is_visible():
                loc.fill(titulo)
                print(f"Búsqueda prellenada: {titulo!r}")
                # Intentar Aplicar filtros
                for btn_sel in (
                    "button:has-text('Aplicar filtros')",
                    "button:has-text('Aplicar')",
                ):
                    btn = page.locator(btn_sel).first
                    if btn.count() and btn.is_visible():
                        btn.click()
                        page.wait_for_timeout(1200)
                        print("Clic en Aplicar filtros.")
                        return
                try:
                    loc.press("Enter")
                    page.wait_for_timeout(800)
                except Exception:
                    pass
                return
        except Exception:
            continue


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
    explorar_previo = _cargar_explorar()
    # Preferir PNG local (Downloads); Drive no lo acepta el BM
    ruta_local = explorar_previo.enriquecer_ruta_local_imagen(receta)
    url_foto = explorar_previo.enriquecer_imagen_desde_word(receta)
    if ruta_local or url_foto:
        try:
            path.write_text(json.dumps(receta, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
            print(f"JSON actualizado con imagen → {path.name}")
            if ruta_local:
                print(f"  rutaLocal: {ruta_local}")
        except Exception:
            pass
    base_url = env.get("CENCOSUD_BM_URL", "https://business-manager.ecomm.cencosud.com/")
    view_manager_url = env.get("CENCOSUD_BM_VIEW_MANAGER_URL") or (
        "https://business-manager.ecomm.cencosud.com/cms/projects/6597f023fdc664839ccd2a37/view-manager"
    )
    dry = args.dry_run or env.get("CENCOSUD_BM_DRY_RUN", "true").lower() in ("1", "true", "yes")
    headed = args.headed or env.get("CENCOSUD_BM_HEADED", "true").lower() in ("1", "true", "yes")
    errores_preflight = [] if dry else errores_prepublicacion(receta)

    print("=== Carga CRC → BM ===")
    print(f"receta:  {receta.get('titulo')}")
    print(f"estado:  {receta.get('estado')}")
    print(f"dry_run: {dry} · headed: {headed}")
    if errores_preflight:
        print("Publicación bloqueada antes de abrir el navegador:", file=sys.stderr)
        for error in errores_preflight:
            print(f"  - {error}", file=sys.stderr)
        return 3

    utiles = {k: v for k, v in selectores.items() if v}
    if len(utiles) < 2:
        print(
            "\nAún no hay selectores útiles en secrets/bm-selectores.json.\n"
            "En TU PC corre primero:\n"
            "  python scripts\\explorar-bm-cencosud.py --reuse-session\n"
            "Abre la receta en el CMS (bloques Cabecera/tags/…) y pulsa ENTER.",
            file=sys.stderr,
        )
        return 2

    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        print("Instala: pip install playwright && playwright install chromium", file=sys.stderr)
        return 1

    explorar = explorar_previo
    resultado = 0

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=not headed)
        ctx_kwargs = {"viewport": {"width": 1400, "height": 900}}
        if not args.no_session and SESSION_PATH.exists():
            ctx_kwargs["storage_state"] = str(SESSION_PATH)
            print(f"Sesión: {SESSION_PATH}")
        context = browser.new_context(**ctx_kwargs)
        page = context.new_page()
        # Flujo acordado: aterrizar en Administrador de vistas para buscar la receta a mano
        page.goto(view_manager_url, wait_until="domcontentloaded")
        print(f"Administrador de vistas: {view_manager_url}")
        page.wait_for_timeout(1500)
        intentar_buscar_vista(page, str(receta.get("titulo") or ""))

        print(
            "\n>>> Se abre una ventana NUEVA en el Administrador de vistas.\n"
            "    En ESA misma ventana (no en otra pestaña):\n"
            "    1) Busca la receta (ej. Salmón) y ábrela.\n"
            "    2) Entra al editor hasta ver Cabecera / tags / listas / SEO.\n"
            "    3) Quédate ahí y pulsa ENTER aquí para rellenar.\n"
            "    El script NO debe sacarte con «Volver»; si pasa, avísame.\n"
        )

        comps: list = []
        for intento in range(1, 4):
            try:
                input()
            except EOFError:
                print("Sin TTY: esperando 45s…")
                page.wait_for_timeout(45_000)

            comps = refrescar_lapices_desde_pagina(explorar, page, selectores)
            print(f"Componentes detectados ahora: {len(comps)} (intento {intento}/3)")
            for c in comps:
                print(f"  · {c.get('clave')}: {c.get('texto')!r} lapiz={c.get('lapizSelector')}")

            if len(comps) >= 2:
                break

            # Diagnóstico para entender el DOM real del BM
            try:
                diag = {
                    "url": page.url,
                    "title": page.title(),
                    "frames": [{"url": f.url, "name": f.name} for f in page.frames],
                    "hints": page.evaluate(
                        """() => {
                      const clean = (s) => (s || '').replace(/\\s+/g, ' ').trim();
                      const texts = [];
                      document.querySelectorAll('div, span, p, li, h1, h2, h3, strong').forEach((el) => {
                        const t = clean(el.innerText);
                        if (t && t.length < 40 && /cabecera|tags|ingrediente|instruccion|seo|header/i.test(t)) {
                          texts.push(t);
                        }
                      });
                      return [...new Set(texts)].slice(0, 40);
                    }"""
                    ),
                }
                # hints por frame
                frame_hints = []
                for fr in page.frames:
                    try:
                        ht = fr.evaluate(
                            """() => {
                          const clean = (s) => (s || '').replace(/\\s+/g, ' ').trim();
                          const texts = [];
                          document.querySelectorAll('div, span, p, li, strong, h1, h2, h3').forEach((el) => {
                            const t = clean(el.innerText);
                            if (t && t.length < 40 && /cabecera|tags|ingrediente|instruccion|seo|header/i.test(t)) {
                              texts.push(t);
                            }
                          });
                          return [...new Set(texts)].slice(0, 30);
                        }"""
                        )
                        if ht:
                            frame_hints.append({"url": fr.url, "hints": ht})
                    except Exception:
                        pass
                diag["frameHints"] = frame_hints
                diag_path = SECRETS / "bm-diagnostico-cms.json"
                diag_path.write_text(json.dumps(diag, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
                page.screenshot(path=str(SECRETS / "bm-diagnostico-cms.png"), full_page=True)
                print(f"Diagnóstico guardado en {diag_path.relative_to(ROOT)}")
                if diag.get("hints"):
                    print("Textos cortos sospechosos en página:", diag["hints"][:15])
                for fh in frame_hints:
                    print(f"  frame {fh['url'][:60]}… → {fh['hints'][:10]}")
            except Exception as e:
                print(f"No se pudo escribir diagnóstico: {e}")

            if intento < 3:
                print(
                    "\nAún no veo Cabecera/tags/listas. Deja la ficha de componentes visible\n"
                    "y pulsa ENTER otra vez (sin cerrar el navegador)…"
                )

        if len(comps) < 2:
            print(
                "\nNo veo los bloques del CMS tras 3 intentos. No se rellenó nada.\n"
                "Revisa secrets/bm-diagnostico-cms.png y bm-diagnostico-cms.json\n"
                "y dime qué ves en la pantalla (o mándame esa captura).",
                file=sys.stderr,
            )
            resultado = 5
            if headed:
                print("\nEl navegador sigue abierto. ENTER para cerrar…")
                try:
                    input()
                except EOFError:
                    page.wait_for_timeout(10_000)
            browser.close()
            return resultado

        # Persistir lápices detectados para el próximo run
        MAPA_SELECTORES_PATH.write_text(
            json.dumps(selectores, ensure_ascii=False, indent=2) + "\n",
            encoding="utf-8",
        )

        print("Rellenando (abriendo lápices del CMS automáticamente)…")
        carga_ok = explorar.fill_from_receta(page, receta, selectores, dry_run=dry)
        if not carga_ok:
            resultado = 4
            print(
                "\nLa carga NO se completó. Revisa selectores o vuelve a explorar "
                "con la ficha abierta:\n"
                "  python scripts\\explorar-bm-cencosud.py --reuse-session",
                file=sys.stderr,
            )
        elif dry:
            print("Dry-run OK: revisa en el BM que los campos quedaron guardados.")
        else:
            receta["estado"] = "cargado"

        path.write_text(json.dumps(receta, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        context.storage_state(path=str(SESSION_PATH))

        if headed:
            print("\nRevisa el BM. ENTER para cerrar…")
            try:
                input()
            except EOFError:
                page.wait_for_timeout(15_000)
        browser.close()

    return resultado


if __name__ == "__main__":
    raise SystemExit(main())
