#!/usr/bin/env python3
"""Rutas CRC: en la PC puede llamarse implementacion-recetas-jumbo o carga-recetas-cencosud."""
from __future__ import annotations

import os
from pathlib import Path

NOMBRES_PROYECTO = (
    "implementacion-recetas-jumbo",
    "carga-recetas-cencosud",
)
BASES_CLIENTES = (
    "index/clientes/Herramientas",
    "index/clientes/herramientas",
)


def resolver_crc(root: Path) -> Path:
    env = (os.environ.get("CRC_DIR") or "").strip()
    if env:
        return Path(env).expanduser()
    for base in BASES_CLIENTES:
        for nombre in NOMBRES_PROYECTO:
            candidato = root / base / nombre
            if candidato.is_dir():
                return candidato
    return root / BASES_CLIENTES[0] / NOMBRES_PROYECTO[-1]


def resolver_secrets(crc: Path) -> Path:
    for nombre in ("secrets", "secret"):
        candidato = crc / nombre
        if candidato.is_dir():
            return candidato
    return crc / "secrets"


def json_mas_reciente(crc: Path) -> Path | None:
    out = crc / "out"
    if not out.is_dir():
        return None
    jsons = sorted(out.glob("*.json"), key=lambda p: p.stat().st_mtime, reverse=True)
    return jsons[0] if jsons else None
