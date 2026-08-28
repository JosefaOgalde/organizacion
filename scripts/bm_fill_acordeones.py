#!/usr/bin/env python3
"""
Rellena todos los campos del documento de receta en Business Manager.

Uso (CMD, carpeta del repo, sesión BM ya abierta una vez):

  python scripts\\bm_fill_acordeones.py
  python scripts\\bm_fill_acordeones.py out\\mi-receta.json

Dry-run por defecto (no publica). Para publicar: --publish
"""
from __future__ import annotations

import importlib.util
import os
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PUBLICAR = ROOT / "scripts/publicar-receta-cencosud.py"


def _cargar_publicador():
    spec = importlib.util.spec_from_file_location("publicar_receta_cencosud", PUBLICAR)
    modulo = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(modulo)
    return modulo


def main() -> int:
    args = [a for a in sys.argv[1:] if a != "--publish"]
    publicar = "--publish" in sys.argv[1:]
    argv = ["publicar-receta-cencosud.py"]
    jsons = [a for a in args if not a.startswith("-")]
    flags = [a for a in args if a.startswith("-")]
    if jsons:
        argv.append(jsons[0])
    argv.append("--headed")
    if not publicar and "--dry-run" not in flags:
        argv.append("--dry-run")
    argv.extend(flags)

    modulo = _cargar_publicador()
    sys.argv = argv
    dry_run_anterior = os.environ.get("CENCOSUD_BM_DRY_RUN")
    if publicar:
        # La opción explícita del wrapper debe prevalecer sobre el default
        # seguro (`true`) y sobre el valor conservador guardado en .env.
        os.environ["CENCOSUD_BM_DRY_RUN"] = "false"
    try:
        return modulo.main()
    finally:
        if publicar:
            if dry_run_anterior is None:
                os.environ.pop("CENCOSUD_BM_DRY_RUN", None)
            else:
                os.environ["CENCOSUD_BM_DRY_RUN"] = dry_run_anterior


if __name__ == "__main__":
    raise SystemExit(main())
