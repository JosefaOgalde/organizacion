#!/usr/bin/env python3
"""Rutas CRC: en la PC puede llamarse implementacion-recetas-jumbo o carga-recetas-cencosud."""
from __future__ import annotations

import os
import re
import urllib.error
import urllib.request
import xml.etree.ElementTree as ET
import zipfile
from pathlib import Path
from urllib.parse import urlparse, parse_qs

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


W_NS = "http://schemas.openxmlformats.org/wordprocessingml/2006/main"
R_NS = "http://schemas.openxmlformats.org/officeDocument/2006/relationships"
REL_PKG = "http://schemas.openxmlformats.org/package/2006/relationships"
REL_HYPERLINK = (
    "http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink"
)
REL_IMAGE = "http://schemas.openxmlformats.org/officeDocument/2006/relationships/image"


def url_http(url: str) -> bool:
    return (url or "").strip().lower().startswith(("http://", "https://"))


def url_descarga_directa(url: str) -> str:
    """Reescribe Drive/Dropbox a un GET que suela devolver el archivo."""
    u = (url or "").strip()
    if not u:
        return u
    m = re.search(r"drive\.google\.com/file/d/([^/]+)", u)
    if m:
        return f"https://drive.google.com/uc?export=download&id={m.group(1)}"
    parsed = urlparse(u)
    if "drive.google.com" in parsed.netloc:
        ids = parse_qs(parsed.query).get("id") or []
        if ids:
            return f"https://drive.google.com/uc?export=download&id={ids[0]}"
    if "dropbox.com" in parsed.netloc:
        if "dl=0" in u:
            return u.replace("dl=0", "dl=1")
        sep = "&" if parsed.query else "?"
        return u + sep + "dl=1"
    return u


def elegir_enlace_foto(enlaces: list[dict]) -> dict | None:
    """El enlace celeste «Foto» del Word Jumbo; si no, la primera URL de imagen."""
    if not enlaces:
        return None
    for e in enlaces:
        if re.search(r"foto", (e.get("texto") or ""), re.I):
            return e
    for e in enlaces:
        path = urlparse(e.get("url") or "").path.lower()
        if any(path.endswith(ext) for ext in EXT_RASTER_BM):
            return e
    return enlaces[0]


def extraer_enlaces_docx(path: Path) -> list[dict]:
    """URLs del .docx: w:hyperlink (texto Foto), campos HYPERLINK e imágenes externas."""
    try:
        with zipfile.ZipFile(path) as zf:
            doc = ET.fromstring(zf.read("word/document.xml"))
            rels_map: dict[str, dict[str, str]] = {}
            rels_name = "word/_rels/document.xml.rels"
            if rels_name in zf.namelist():
                rels = ET.fromstring(zf.read(rels_name))
                for rel in rels:
                    rid = rel.get("Id")
                    if not rid:
                        continue
                    rels_map[rid] = {
                        "target": rel.get("Target") or "",
                        "type": rel.get("Type") or "",
                        "mode": (rel.get("TargetMode") or "").lower(),
                    }
    except Exception:
        return []

    enlaces: list[dict] = []
    w = f"{{{W_NS}}}"
    r = f"{{{R_NS}}}"
    for h in doc.findall(f".//{w}hyperlink"):
        rid = h.get(f"{r}id")
        textos = [t.text for t in h.findall(f".//{w}t") if t.text]
        texto = "".join(textos).strip()
        url = (rels_map.get(rid or "") or {}).get("target") or ""
        if url_http(url):
            enlaces.append({"texto": texto, "url": url, "origen": "hyperlink"})
    for instr in doc.findall(f".//{w}instrText"):
        raw = instr.text or ""
        m = re.search(r'HYPERLINK\s+"([^"]+)"', raw, re.I)
        if m and url_http(m.group(1)):
            enlaces.append({"texto": "", "url": m.group(1).strip(), "origen": "campo"})
    for info in rels_map.values():
        url = info.get("target") or ""
        tipo = info.get("type") or ""
        if not url_http(url):
            continue
        if REL_HYPERLINK in tipo or (
            REL_IMAGE in tipo and info.get("mode") == "external"
        ):
            if not any(e["url"] == url for e in enlaces):
                enlaces.append({"texto": "", "url": url, "origen": "rel-externo"})
    return enlaces


def _primera_og_image(html: bytes) -> str | None:
    text = html.decode("utf-8", errors="ignore")
    m = re.search(
        r'<meta[^>]+property=["\']og:image["\'][^>]+content=["\']([^"\']+)',
        text,
        re.I,
    )
    if m:
        return m.group(1).strip()
    m = re.search(
        r'<meta[^>]+content=["\']([^"\']+)["\'][^>]+property=["\']og:image["\']',
        text,
        re.I,
    )
    return m.group(1).strip() if m else None


def descargar_imagen_url(
    url: str, dest_dir: Path, stem: str = "portada-enlace", *, _desde_html: bool = False
) -> Path | None:
    if not url_http(url):
        return None
    dest_dir.mkdir(parents=True, exist_ok=True)
    directa = url_descarga_directa(url)
    req = urllib.request.Request(
        directa,
        headers={
            "User-Agent": (
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
            ),
            "Accept": "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=45) as resp:
            data = resp.read()
            ctype = ""
            headers = getattr(resp, "headers", None)
            if headers is not None and hasattr(headers, "get_content_type"):
                ctype = headers.get_content_type() or ""
    except (urllib.error.URLError, TimeoutError, OSError, ValueError):
        return None
    ext = ext_por_magic(data)
    if not ext and ctype.startswith("image/"):
        ext = {
            "image/jpeg": ".jpg",
            "image/jpg": ".jpg",
            "image/png": ".png",
            "image/gif": ".gif",
            "image/webp": ".webp",
            "image/bmp": ".bmp",
        }.get(ctype)
    if ext in EXT_RASTER_BM:
        out = dest_dir / f"{stem}{ext}"
        out.write_bytes(data)
        return out
    if not _desde_html and (
        (ctype or "").startswith("text/html") or data.lstrip()[:15].lower().startswith(b"<!doctype html")
        or data.lstrip()[:6].lower().startswith(b"<html")
    ):
        og = _primera_og_image(data)
        if og and og != url:
            return descargar_imagen_url(og, dest_dir, stem, _desde_html=True)
    return None


def asegurar_foto_desde_enlace(
    docx: Path | None, dest_dir: Path, receta: dict | None = None
) -> tuple[Path | None, str | None]:
    """Baja el enlace Foto del Word (o urlFuente del JSON). Devuelve (archivo, url)."""
    candidatos: list[str] = []
    if receta:
        for im in receta.get("imagenes") or []:
            u = (im.get("urlFuente") or im.get("url") or "").strip()
            if u:
                candidatos.append(u)
    if docx and docx.exists():
        enlace = elegir_enlace_foto(extraer_enlaces_docx(docx))
        if enlace and enlace.get("url"):
            candidatos.insert(0, enlace["url"])
    vistos: set[str] = set()
    ultima: str | None = None
    for url in candidatos:
        if url in vistos or not url_http(url):
            continue
        vistos.add(url)
        ultima = url
        path = descargar_imagen_url(url, dest_dir)
        if path:
            return path, url
    return None, ultima
