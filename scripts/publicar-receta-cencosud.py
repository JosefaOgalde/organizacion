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

El BM Jumbo es CMS por componentes: este script abre cada lápiz solo
(Cabecera, tags, ingredientes, instrucciones, SEO) antes de rellenar.
"""
from __future__ import annotations

import argparse
import importlib.util
import json
import os
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
EXPLORAR_PATH = ROOT / "scripts/explorar-bm-cencosud.py"


def _crc_rutas():
    path = Path(__file__).resolve().parent / "crc_rutas.py"
    spec = importlib.util.spec_from_file_location("crc_rutas_pub", path)
    modulo = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(modulo)
    return modulo


_RUTAS = _crc_rutas()
CRC = _RUTAS.resolver_crc(ROOT)
SECRETS = _RUTAS.resolver_secrets(CRC)
ENV_PATH = SECRETS / ".env"
SESSION_PATH = SECRETS / "bm-session.json"
MAPA_SELECTORES_PATH = SECRETS / "bm-selectores.json"
CAMPOS_REQUERIDOS_PUBLICACION = ("titulo", "descripcion", "ingredientes", "pasos")
CAMPOS_FALTANTES_NO_BLOQUEANTES = {"ingredientes.skuCencosud"}


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
    ap.add_argument("json_path", nargs="?", type=Path, help="Ruta al JSON en out/ (si omites, usa el más reciente)")
    ap.add_argument("--dry-run", action="store_true", help="No publicar; intentar guardar borrador")
    ap.add_argument("--headed", action="store_true", help="Navegador visible (recomendado)")
    ap.add_argument("--no-session", action="store_true", help="No reutilizar bm-session.json")
    args = ap.parse_args()
    # region agent log
    open("/opt/cursor/logs/debug.log", "a", encoding="utf-8").write(json.dumps({"hypothesisId": "D", "location": "scripts/publicar-receta-cencosud.py:135", "message": "main recibió argumentos", "data": {"explicitPath": args.json_path is not None, "cliDryRun": args.dry_run, "headed": args.headed, "noSession": args.no_session}, "timestamp": __import__("time").time_ns() // 1_000_000}) + "\n")
    # endregion

    if args.json_path:
        path = args.json_path.expanduser().resolve()
    else:
        path = _RUTAS.json_mas_reciente(CRC)
        if path:
            print(f"JSON más reciente: {path}")
        else:
            print(
                "No hay JSON en out/. Primero:\n"
                "  python scripts\\parse-receta-word.py inbox\\TU-RECETA.docx",
                file=sys.stderr,
            )
            return 1
    if not path.exists():
        print(f"No existe JSON: {path}", file=sys.stderr)
        return 1

    payload_fuente = path.read_text(encoding="utf-8")
    receta = json.loads(payload_fuente)
    # region agent log
    open("/opt/cursor/logs/debug.log", "a", encoding="utf-8").write(json.dumps({"hypothesisId": "A", "location": "scripts/publicar-receta-cencosud.py:157", "message": "fuente JSON cargada", "data": {"sourcePath": str(path), "sourceBytes": len(payload_fuente.encode("utf-8")), "topLevelKeys": sorted(receta.keys()), "hasBloquesKey": "bloques" in receta}, "timestamp": __import__("time").time_ns() // 1_000_000}) + "\n")
    # endregion
    try:
        from expandir_bloques_receta import es_formato_bloques, expandir_bloques
    except ImportError:
        import importlib.util

        exp_path = ROOT / "scripts" / "expandir-bloques-receta.py"
        spec = importlib.util.spec_from_file_location("expandir_bloques_receta", exp_path)
        mod = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(mod)
        es_formato_bloques = mod.es_formato_bloques
        expandir_bloques = mod.expandir_bloques
    formato_bloques = es_formato_bloques(receta)
    # region agent log
    open("/opt/cursor/logs/debug.log", "a", encoding="utf-8").write(json.dumps({"hypothesisId": "A", "location": "scripts/publicar-receta-cencosud.py:173", "message": "decisión de expansión", "data": {"detectedBlocks": formato_bloques, "bloquesType": type(receta.get("bloques")).__name__, "bloquesKeys": sorted(receta.get("bloques", {}).keys()) if isinstance(receta.get("bloques"), dict) else []}, "timestamp": __import__("time").time_ns() // 1_000_000}) + "\n")
    # endregion
    if formato_bloques:
        try:
            rel = str(path.relative_to(ROOT))
        except ValueError:
            rel = str(path)
        receta = expandir_bloques(receta, fuente=rel)
        # region agent log
        open("/opt/cursor/logs/debug.log", "a", encoding="utf-8").write(json.dumps({"hypothesisId": "A", "location": "scripts/publicar-receta-cencosud.py:182", "message": "expansión terminada en memoria", "data": {"sourcePath": str(path), "expandedTopLevelKeys": sorted(receta.keys()), "expandedHasBloques": "bloques" in receta, "expandedEstado": receta.get("estado")}, "timestamp": __import__("time").time_ns() // 1_000_000}) + "\n")
        # endregion
        print("Formato: 5 bloques → receta expandida")
    env = load_env(ENV_PATH)
    selectores = load_selectores()
    base_url = _RUTAS.url_inicio_bm(env)
    dry = args.dry_run or env.get("CENCOSUD_BM_DRY_RUN", "true").lower() in ("1", "true", "yes")
    headed = args.headed or env.get("CENCOSUD_BM_HEADED", "true").lower() in ("1", "true", "yes")
    errores_preflight = [] if dry else errores_prepublicacion(receta)
    # region agent log
    open("/opt/cursor/logs/debug.log", "a", encoding="utf-8").write(json.dumps({"hypothesisId": "C,D", "location": "scripts/publicar-receta-cencosud.py:195", "message": "gates previos al navegador", "data": {"cliDryRun": args.dry_run, "envDryRun": env.get("CENCOSUD_BM_DRY_RUN"), "effectiveDryRun": dry, "usableSelectors": len({k: v for k, v in selectores.items() if v}), "preflightErrorCount": len(errores_preflight)}, "timestamp": __import__("time").time_ns() // 1_000_000}) + "\n")
    # endregion

    print("=== Carga CRC → BM ===")
    print(f"carpeta: {CRC}")
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
            "  python3 scripts/explorar-bm-cencosud.py --reuse-session\n"
            "Inicia sesión, abre la receta en el CMS y pulsa ENTER\n"
            "(el script abre los lápices solo).",
            file=sys.stderr,
        )
        return 2

    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        print("Instala: pip install playwright && playwright install chromium", file=sys.stderr)
        return 1

    explorar = _cargar_explorar()

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=not headed)
        ctx_kwargs = {"viewport": {"width": 1400, "height": 900}}
        if not args.no_session and SESSION_PATH.exists():
            ctx_kwargs["storage_state"] = str(SESSION_PATH)
            print(f"Sesión: {SESSION_PATH}")
        context = browser.new_context(**ctx_kwargs)
        page = context.new_page()
        page.goto(base_url, wait_until="domcontentloaded")

        # La receta ya existe: la abre la usuaria. No clicar nav_nueva_receta
        # (un href o el texto «Cabecera» de la paleta saca a /cms/projects).

        if headed and sys.stdin.isatty():
            print(explorar.MENSAJE_ENTER_FICHA)
            try:
                input()
            except EOFError:
                page.wait_for_timeout(5_000)
        url_ficha = explorar.esperar_ficha_en_lienzo(page, headed=headed)

        print("Rellenando (solo lápices del lienzo; no toco la paleta)…")
        carga_ok = explorar.fill_from_receta(
            page, receta, selectores, dry_run=dry, url_ficha=url_ficha
        )
        # region agent log
        open("/opt/cursor/logs/debug.log", "a", encoding="utf-8").write(json.dumps({"hypothesisId": "B", "location": "scripts/publicar-receta-cencosud.py:257", "message": "relleno BM simulado terminó", "data": {"effectiveDryRun": dry, "cargaOk": carga_ok, "estadoBeforeMutation": receta.get("estado")}, "timestamp": __import__("time").time_ns() // 1_000_000}) + "\n")
        # endregion
        resultado = 0
        if dry:
            if carga_ok:
                receta["estado"] = "cargado"
        else:
            if not carga_ok:
                resultado = 4
            else:
                receta["estado"] = "cargado"

        payload_guardado = json.dumps(receta, ensure_ascii=False, indent=2) + "\n"
        # region agent log
        open("/opt/cursor/logs/debug.log", "a", encoding="utf-8").write(json.dumps({"hypothesisId": "A,B", "location": "scripts/publicar-receta-cencosud.py:271", "message": "inmediatamente antes de escribir sobre path", "data": {"writePath": str(path), "payloadChanged": payload_guardado != payload_fuente, "sourceHadBloques": formato_bloques, "outputTopLevelKeys": sorted(receta.keys()), "effectiveDryRun": dry, "cargaOk": carga_ok, "resultado": resultado, "finalEstado": receta.get("estado")}, "timestamp": __import__("time").time_ns() // 1_000_000}) + "\n")
        # endregion
        path.write_text(payload_guardado, encoding="utf-8")
        # region agent log
        open("/opt/cursor/logs/debug.log", "a", encoding="utf-8").write(json.dumps({"hypothesisId": "A,B", "location": "scripts/publicar-receta-cencosud.py:276", "message": "escritura sobre path completada", "data": {"writePath": str(path), "readBackMatchesExpanded": path.read_text(encoding="utf-8") == payload_guardado, "writtenBytes": len(payload_guardado.encode("utf-8")), "sourceOverwritten": payload_guardado != payload_fuente}, "timestamp": __import__("time").time_ns() // 1_000_000}) + "\n")
        # endregion
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
