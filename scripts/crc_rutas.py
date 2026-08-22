#!/usr/bin/env python3
"""Rutas CRC: en la PC puede llamarse implementacion-recetas-jumbo o carga-recetas-cencosud."""
from __future__ import annotations

import os
import zipfile
from pathlib import Path

EXT_RASTER_BM = {".png", ".jpg", ".jpeg", ".gif", ".webp", ".bmp"}

NOMBRES_PROYECTO = (
    "implementacion-recetas-jumbo",
    "carga-recetas-cencosud",
)
BASES_CLIENTES = (
    "index/clientes/Herramientas",
    "index/clientes/herramientas",
)
BM_HOME = "https://business-manager.ecomm.cencosud.com/"
BM_CMS_RECETAS = (
    "https://business-manager.ecomm.cencosud.com/cms/projects/"
    "6597f023fdc664839ccd2a37/view-manager"
)


def url_inicio_bm(env: dict | None = None) -> str:
    """Gestor de contenido de recetas Jumbo (no el home ni la lista de proyectos)."""
    raw = ((env or {}).get("CENCOSUD_BM_URL") or "").strip()
    if not raw or raw.rstrip("/") == BM_HOME.rstrip("/"):
        return BM_CMS_RECETAS
    cleaned = raw.rstrip("/")
    # «Proyectos en JUMBO» (/cms/projects) no es el lienzo de la receta.
    if cleaned.endswith("/cms/projects"):
        return BM_CMS_RECETAS
    if "/cms/projects/" in cleaned and "view-manager" not in cleaned:
        return cleaned + "/view-manager"
    return cleaned


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


def ext_por_magic(data: bytes) -> str | None:
    """Extensión raster según cabecera, aunque el zip del Word diga .bin/.emf."""
    if not data or len(data) < 12:
        return None
    if data[:3] == b"\xff\xd8\xff":
        return ".jpg"
    if data[:8] == b"\x89PNG\r\n\x1a\n":
        return ".png"
    if data[:6] in (b"GIF87a", b"GIF89a"):
        return ".gif"
    if data[:2] == b"BM":
        return ".bmp"
    if data[:4] == b"RIFF" and data[8:12] == b"WEBP":
        return ".webp"
    return None


def extraer_imagenes_docx(
    path: Path, dest_dir: Path, omitidas: list[str] | None = None
) -> list[Path]:
    """Saca word/media/* del .docx. Usa magic bytes, no solo la extensión del zip."""
    dest_dir.mkdir(parents=True, exist_ok=True)
    guardadas: list[Path] = []
    try:
        with zipfile.ZipFile(path) as zf:
            medias = [n for n in zf.namelist() if n.startswith("word/media/")]
            for i, name in enumerate(medias, 1):
                data = zf.read(name)
                ext = ext_por_magic(data) or Path(name).suffix.lower()
                if ext not in EXT_RASTER_BM:
                    if omitidas is not None:
                        omitidas.append(f"{name} ({ext or 'sin-tipo'})")
                    continue
                out = dest_dir / f"portada-{i}{ext}"
                out.write_bytes(data)
                guardadas.append(out)
    except Exception:
        return []
    return guardadas


def carpetas_busqueda_foto(root: Path, crc: Path) -> list[Path]:
    home = Path.home()
    return [
        crc / "out",
        crc / "out" / "media",
        crc / "inbox",
        root / "inbox",
        home / "Downloads",
        home / "Descargas",
        home / "Desktop",
        home / "Escritorio",
    ]


def nombre_archivo_fuente(fuente: str) -> str:
    """Nombre del Word aunque fuenteWord venga con barras de Windows."""
    limpio = (fuente or "").replace("\\", "/").rstrip("/")
    return Path(limpio).name


def candidatos_docx_fuente(receta: dict, root: Path, crc: Path) -> list[Path]:
    """Word de la receta: fuenteWord, Downloads y carpeta CRC."""
    vistos: list[Path] = []
    nombres: list[str] = []
    fuente = (receta.get("fuenteWord") or "").strip()
    if fuente:
        nombre = nombre_archivo_fuente(fuente)
        if nombre:
            nombres.append(nombre)
        crudo = Path(fuente)
        if crudo.is_absolute():
            vistos.append(crudo)
        else:
            vistos.append(root / crudo)
        if len(fuente) > 2 and fuente[1] == ":":
            vistos.append(Path(fuente))
    rid = (receta.get("id") or "").strip()
    if rid:
        nombres.append(f"{rid}.docx")
    for carpeta in carpetas_busqueda_foto(root, crc):
        for nombre in nombres:
            if nombre:
                vistos.append(carpeta / nombre)
    unicos: list[Path] = []
    seen: set[str] = set()
    for p in vistos:
        clave = str(p)
        if clave in seen:
            continue
        seen.add(clave)
        unicos.append(p)
    return unicos
