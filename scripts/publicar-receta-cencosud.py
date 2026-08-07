#!/usr/bin/env python3
"""
Publica (o rellena en borrador) una receta JSON en Business Manager Cencosud.

Fase actual: esqueleto. Los selectores se completan tras mapear el formulario
(ver MAPA-CAMPOS-BM.md). Sin selectores reales NO hace clic en Publicar.

Uso:
  python3 scripts/publicar-receta-cencosud.py \\
    index/clientes/Herramientas/carga-recetas-cencosud/out/mi-receta.json

Credenciales: index/clientes/Herramientas/carga-recetas-cencosud/secrets/.env
"""
from __future__ import annotations

import argparse
import json
import os
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CRC = ROOT / "index/clientes/Herramientas/carga-recetas-cencosud"
ENV_PATH = CRC / "secrets" / ".env"

# Selectores — completar en sesión de mapeo BM (dejar None hasta entonces).
SELECTORS = {
    "login_user": None,
    "login_password": None,
    "login_submit": None,
    "nav_nueva_receta": None,
    "field_titulo": None,
    "field_descripcion": None,
    "field_porciones": None,
    "field_dificultad": None,
    "field_ingredientes": None,
    "field_pasos": None,
    "btn_guardar_borrador": None,
    "btn_publicar": None,
}


def load_env(path: Path) -> dict[str, str]:
    data: dict[str, str] = {}
    if not path.exists():
        return data
    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        k, v = line.split("=", 1)
        data[k.strip()] = v.strip().strip('"').strip("'")
    return data


def main() -> int:
    ap = argparse.ArgumentParser(description="Cargar receta JSON en Business Manager Cencosud")
    ap.add_argument("json_path", type=Path, help="Ruta al JSON en out/")
    ap.add_argument("--dry-run", action="store_true", help="No publicar; solo validar y mostrar plan")
    ap.add_argument("--headed", action="store_true", help="Navegador visible")
    args = ap.parse_args()

    path = args.json_path.expanduser().resolve()
    if not path.exists():
        print(f"No existe JSON: {path}", file=sys.stderr)
        return 1

    receta = json.loads(path.read_text(encoding="utf-8"))
    env = load_env(ENV_PATH)
    # también permitir variables de entorno del shell
    for k in (
        "CENCOSUD_BM_USER",
        "CENCOSUD_BM_PASSWORD",
        "CENCOSUD_BM_URL",
        "CENCOSUD_BM_BANDERA",
        "CENCOSUD_BM_HEADED",
        "CENCOSUD_BM_DRY_RUN",
    ):
        if k in os.environ and os.environ[k]:
            env[k] = os.environ[k]

    user = env.get("CENCOSUD_BM_USER", "")
    password = env.get("CENCOSUD_BM_PASSWORD", "")
    base_url = env.get("CENCOSUD_BM_URL", "https://business-manager.ecomm.cencosud.com/")
    dry = args.dry_run or env.get("CENCOSUD_BM_DRY_RUN", "true").lower() in ("1", "true", "yes")
    headed = args.headed or env.get("CENCOSUD_BM_HEADED", "true").lower() in ("1", "true", "yes")

    print("=== Plan de carga CRC ===")
    print(f"archivo:   {path}")
    print(f"titulo:    {receta.get('titulo')}")
    print(f"estado:    {receta.get('estado')}")
    print(f"faltantes: {receta.get('camposFaltantes')}")
    print(f"destino:   {base_url}")
    print(f"dry_run:   {dry}")
    print(f"headed:    {headed}")
    print(f"user set:  {'sí' if user else 'NO — copiar secrets/env.example → secrets/.env'}")

    missing_sel = [k for k, v in SELECTORS.items() if v is None]
    if missing_sel:
        print("\nSelectores BM aún no mapeados:")
        for k in missing_sel:
            print(f"  - {k}")
        print(
            "\nSiguiente paso: con sesión abierta, completar SELECTORS en este script "
            "y la tabla en MAPA-CAMPOS-BM.md. Hasta entonces no se lanza el navegador."
        )
        # Validación local siempre útil
        if receta.get("estado") not in ("listo-para-cargar", "cargado", "publicado"):
            print(
                f"\nAVISO: estado={receta.get('estado')!r}. "
                "Completa camposFaltantes con @herramientas antes de publicar."
            )
        return 0

    if not user or not password:
        print("Faltan CENCOSUD_BM_USER / CENCOSUD_BM_PASSWORD en secrets/.env", file=sys.stderr)
        return 1

    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        print(
            "Instala Playwright: pip install playwright && playwright install chromium",
            file=sys.stderr,
        )
        return 1

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=not headed)
        page = browser.new_page()
        page.goto(base_url)
        # Login ADFS — selectores a completar
        page.fill(SELECTORS["login_user"], user)
        page.fill(SELECTORS["login_password"], password)
        page.click(SELECTORS["login_submit"])
        page.wait_for_load_state("networkidle")

        page.click(SELECTORS["nav_nueva_receta"])
        page.fill(SELECTORS["field_titulo"], receta["titulo"])
        page.fill(SELECTORS["field_descripcion"], receta.get("descripcion") or "")
        if receta.get("porciones") and SELECTORS["field_porciones"]:
            page.fill(SELECTORS["field_porciones"], str(receta["porciones"]))

        # ingredientes / pasos: adaptar a controles reales (textarea vs filas)
        if SELECTORS["field_ingredientes"]:
            texto_ing = "\n".join(
                f"{i.get('cantidad') or ''} {i.get('unidad') or ''} {i['nombre']}".strip()
                for i in receta.get("ingredientes") or []
            )
            page.fill(SELECTORS["field_ingredientes"], texto_ing)
        if SELECTORS["field_pasos"]:
            texto_pas = "\n".join(f"{p['orden']}. {p['texto']}" for p in receta.get("pasos") or [])
            page.fill(SELECTORS["field_pasos"], texto_pas)

        if dry:
            if SELECTORS["btn_guardar_borrador"]:
                page.click(SELECTORS["btn_guardar_borrador"])
            print("Dry-run: guardado borrador (sin publicar).")
        else:
            page.click(SELECTORS["btn_publicar"])
            print("Publicado (según flujo BM).")

        receta["estado"] = "cargado" if dry else "publicado"
        receta["publicacion"]["publicadoEn"] = None
        path.write_text(json.dumps(receta, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        browser.close()

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
