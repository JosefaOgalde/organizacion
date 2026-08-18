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
        resultados = {}
        resultados["titulo"] = fill(page, selectores.get("field_titulo"), receta.get("titulo"), "titulo")
        resultados["descripcion"] = fill(
            page, selectores.get("field_descripcion"), receta.get("descripcion"), "descripcion"
        )
        resultados["porciones"] = fill(
            page, selectores.get("field_porciones"), receta.get("porciones"), "porciones"
        )
        resultados["dificultad"] = fill(
            page, selectores.get("field_dificultad"), receta.get("dificultad"), "dificultad"
        )
        resultados["tiempo"] = fill(
            page, selectores.get("field_tiempo"), receta.get("tiempoTotal"), "tiempo"
        )
        resultados["tags"] = fill(
            page,
            selectores.get("field_tags"),
            ", ".join(receta.get("categorias") or []),
            "tags",
        )
        seo = receta.get("seo") or {}
        resultados["meta_titulo"] = fill(
            page, selectores.get("field_meta_titulo"), seo.get("metaTitulo"), "meta_titulo"
        )
        resultados["meta_descripcion"] = fill(
            page, selectores.get("field_meta_descripcion"), seo.get("metaDescripcion"), "meta_descripcion"
        )

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
            resultados["ingredientes"] = fill(
                page, selectores.get("field_ingredientes"), texto_ing, "ingredientes"
            )

        pasos = receta.get("pasos") or []
        if pasos:
            texto_pas = "\n".join(f"{p.get('orden')}. {p.get('texto')}" for p in pasos)
            resultados["pasos"] = fill(page, selectores.get("field_pasos"), texto_pas, "pasos")

        resultado = 0
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
            fallos_requeridos = [
                campo for campo in CAMPOS_REQUERIDOS_PUBLICACION if not resultados.get(campo, False)
            ]
            if fallos_requeridos:
                print(
                    "Publicación abortada: falló el rellenado de campos requeridos: "
                    + ", ".join(fallos_requeridos),
                    file=sys.stderr,
                )
                resultado = 4
            else:
                btn = selectores.get("btn_publicar")
                if not btn:
                    print("Sin btn_publicar en bm-selectores.json", file=sys.stderr)
                    resultado = 4
                else:
                    page.locator(btn).first.click()
                    print("Solicitud de publicación enviada; confirma el resultado en BM.")
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
