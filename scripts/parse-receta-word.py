#!/usr/bin/env python3
"""
Parsea un Word (.docx), PDF Jumbo o texto de receta → JSON intermedio CRC.

Soporta:
  - Formato Jumbo (Meta título / Meta descripción / "35 min | Fácil | 4 porciones" / Tags / Paso a paso)
  - PDF exportado desde el Word Jumbo (Maremoto.pdf y equivalentes)
  - Formato simple etiquetado (Título:, Ingredientes:, Pasos:)

Uso:
  python3 scripts/parse-receta-word.py index/clientes/Herramientas/carga-recetas-cencosud/inbox/receta.docx
  python3 scripts/parse-receta-word.py index/clientes/Herramientas/carga-recetas-cencosud/inbox/Maremoto.pdf
"""
from __future__ import annotations

import argparse
import json
import re
import shutil
import sys
import unicodedata
import zipfile
import zlib
import xml.etree.ElementTree as ET
from datetime import datetime, timezone
from pathlib import Path
import importlib.util

ROOT = Path(__file__).resolve().parents[1]


def _crc_rutas():
    path = Path(__file__).resolve().parent / "crc_rutas.py"
    spec = importlib.util.spec_from_file_location("crc_rutas_parse", path)
    modulo = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(modulo)
    return modulo


_RUTAS = _crc_rutas()
CRC = _RUTAS.resolver_crc(ROOT)
OUT_DIR = CRC / "out"

W_NS = {"w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main"}


def extraer_imagenes_docx(
    path: Path, dest_dir: Path, omitidas: list[str] | None = None
) -> list[Path]:
    return _RUTAS.extraer_imagenes_docx(path, dest_dir, omitidas)


def extraer_enlaces_docx(path: Path) -> list[dict]:
    return _RUTAS.extraer_enlaces_docx(path)


def hipervinculos_producto_docx(path: Path) -> list[dict]:
    """Enlaces Jumbo del .docx (texto ancla + url), sin el de «Foto» a Drive."""
    out: list[dict] = []
    vistos: set[tuple[str, str]] = set()
    for raw in extraer_enlaces_docx(path):
        texto = str(raw.get("texto") or "").strip()
        url = str(raw.get("url") or "").strip()
        if not texto or not url:
            continue
        if "jumbo.cl" not in url.lower():
            continue
        if texto.lower() in {"foto", "imagen", "portada"}:
            continue
        clave = (texto.lower(), url)
        if clave in vistos:
            continue
        vistos.add(clave)
        out.append({"texto": texto, "url": url})
    return out


def aplicar_hipervinculos_a_pasos(receta: dict, hipervinculos: list[dict]) -> None:
    """Pega anclas del Word en cada paso cuyo texto contiene la palabra enlazada."""
    if not hipervinculos:
        return
    catalogo = list(receta.get("enlacesProductos") or [])
    for hv in hipervinculos:
        url = hv["url"]
        ya = False
        for item in catalogo:
            if isinstance(item, dict) and item.get("url") == url and item.get("texto") == hv["texto"]:
                ya = True
                break
            if isinstance(item, str) and item == url:
                ya = True
                break
        if not ya:
            catalogo.append({"texto": hv["texto"], "url": url})
    receta["enlacesProductos"] = catalogo

    for paso in receta.get("pasos") or []:
        cuerpo = str(paso.get("texto") or "")
        if not cuerpo:
            continue
        cuerpo_l = cuerpo.lower()
        ya = list(paso.get("enlaces") or [])
        vistos = {
            (str(e.get("texto") or "").lower(), str(e.get("url") or ""))
            for e in ya
        }
        for hv in hipervinculos:
            palabra = hv["texto"]
            url = hv["url"]
            if palabra.lower() not in cuerpo_l:
                continue
            clave = (palabra.lower(), url)
            if clave in vistos:
                continue
            ya.append({"texto": palabra, "url": url})
            vistos.add(clave)
        if ya:
            paso["enlaces"] = sorted(
                ya, key=lambda e: len(str(e.get("texto") or "")), reverse=True
            )


def adjuntar_foto_portada(receta: dict, src: Path, media_dir: Path) -> None:
    """Prioriza el enlace celeste «Foto» del Word; si no, word/media embebido."""
    alt = ""
    for im in receta.get("imagenes") or []:
        if im.get("alt"):
            alt = im["alt"]
            break
    enlace = _RUTAS.elegir_enlace_foto(extraer_enlaces_docx(src))
    url = (enlace or {}).get("url") or ""
    guardada = None
    if url:
        print(f"enlace Foto: {url}")
        guardada = _RUTAS.descargar_imagen_url(url, media_dir)
        if guardada:
            print(f"imagenes: 1 (enlace Foto → {guardada.name})")
    if not guardada:
        omitidas: list[str] = []
        embebidas = extraer_imagenes_docx(src, media_dir, omitidas)
        if embebidas:
            guardada = embebidas[0]
            print(f"imagenes: {len(embebidas)}")
        elif omitidas:
            print("word/media omitidas:", ", ".join(omitidas))
    if guardada:
        try:
            rel = str(guardada.relative_to(ROOT))
        except ValueError:
            rel = str(guardada)
        receta["imagenes"] = [
            {
                "rutaLocal": rel,
                "urlFuente": url,
                "alt": alt,
                "rol": "portada",
                "textoEnlace": (enlace or {}).get("texto") or "",
            }
        ]
        return
    if url:
        receta["imagenes"] = [
            {
                "rutaLocal": "",
                "urlFuente": url,
                "alt": alt,
                "rol": "portada",
                "textoEnlace": (enlace or {}).get("texto") or "Foto",
                "nota": "Enlace Foto del Word; no se pudo descargar aún",
            }
        ]
        print("imagenes: 0 (enlace Foto pendiente de descarga)")


def adjuntar_foto_local(receta: dict, src: Path, media_dir: Path) -> None:
    """Copia Maremoto.png (u otra portada) desde Descargas / inbox / ruta del PDF."""
    nombres: list[str] = []
    rutas: list[Path] = []
    for im in receta.get("imagenes") or []:
        for k in ("rutaOrigen", "rutaLocal"):
            crudo = (im.get(k) or "").strip().strip('"').strip("'")
            if not crudo or crudo.lower().startswith("http"):
                continue
            p = Path(crudo)
            nombres.append(p.name)
            rutas.append(p)
            rutas.append(Path(crudo.replace("\\", "/")))
    nombres.append(f"{src.stem}.png")
    nombres.append(f"{src.stem}.jpg")
    nombres.append(f"{src.stem}.jpeg")
    nombres.append(f"{src.stem}.webp")
    for carpeta in _RUTAS.carpetas_busqueda_foto(ROOT, CRC):
        for nombre in nombres:
            if nombre:
                rutas.append(carpeta / nombre)
    rutas.append(src.with_suffix(".png"))
    vistos: set[str] = set()
    for cand in rutas:
        clave = str(cand)
        if clave in vistos:
            continue
        vistos.add(clave)
        if not cand.is_file():
            continue
        media_dir.mkdir(parents=True, exist_ok=True)
        dest = media_dir / cand.name
        if cand.resolve() != dest.resolve():
            shutil.copy2(cand, dest)
        try:
            rel = str(dest.relative_to(ROOT))
        except ValueError:
            rel = str(dest)
        alt = ""
        for im in receta.get("imagenes") or []:
            if im.get("alt"):
                alt = im["alt"]
                break
        receta["imagenes"] = [
            {
                "rutaLocal": rel,
                "rutaOrigen": str(cand),
                "urlFuente": "",
                "alt": alt,
                "rol": "portada",
                "nota": f"Copiada desde {cand.name}",
            }
        ]
        print(f"imagenes: 1 (local → {dest.name})")
        return
    print("imagenes: 0 (Foto local no encontrada en inbox/Descargas)")


def texto_desde_docx(path: Path) -> str:
    with zipfile.ZipFile(path) as zf:
        xml = zf.read("word/document.xml")
    root = ET.fromstring(xml)
    lines: list[str] = []
    for p in root.findall(".//w:p", W_NS):
        parts = []
        for t in p.findall(".//w:t", W_NS):
            if t.text:
                parts.append(t.text)
        line = "".join(parts).strip()
        if line:
            lines.append(line)
    return "\n".join(lines)


def _iter_pdf_streams(data: bytes):
    i = 0
    while True:
        s = data.find(b"stream", i)
        if s < 0:
            break
        dict_start = data.rfind(b"<<", 0, s)
        hdr = data[dict_start:s] if dict_start >= 0 else b""
        p = s + 6
        if data[p : p + 2] == b"\r\n":
            p += 2
        elif p < len(data) and data[p : p + 1] in (b"\n", b"\r"):
            p += 1
        e = data.find(b"endstream", p)
        blob = data[p:e] if e >= 0 else data[p:]
        decoded = blob
        if b"/FlateDecode" in hdr:
            try:
                decoded = zlib.decompress(blob.strip(b"\r\n"))
            except Exception:
                try:
                    decoded = zlib.decompress(blob)
                except Exception:
                    decoded = blob
        yield hdr, decoded
        i = e + 9 if e >= 0 else s + 6


def _utf16be_hex(h: str) -> str:
    b = bytes.fromhex(h)
    if b.startswith(b"\xfe\xff"):
        b = b[2:]
    if not b:
        return ""
    return b.decode("utf-16-be", errors="replace")


def _parse_tounicode_cmap(text: str) -> dict[int, str]:
    mapping: dict[int, str] = {}
    for m in re.finditer(r"beginbfchar(.*?)endbfchar", text, re.S):
        for src, dst in re.findall(r"<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>", m.group(1)):
            mapping[int(src, 16)] = _utf16be_hex(dst)
    for m in re.finditer(r"beginbfrange(.*?)endbfrange", text, re.S):
        body = m.group(1)
        for a, b, dst in re.findall(
            r"<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>", body
        ):
            start, end = int(a, 16), int(b, 16)
            base = bytes.fromhex(dst)
            if base.startswith(b"\xfe\xff"):
                base = base[2:]
            width = len(base)
            val = int.from_bytes(base, "big")
            for i, cid in enumerate(range(start, end + 1)):
                mapping[cid] = (val + i).to_bytes(width, "big").decode(
                    "utf-16-be", errors="replace"
                )
        for a, _b, arr in re.findall(
            r"<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>\s*\[([^\]]+)\]", body
        ):
            dests = re.findall(r"<([0-9A-Fa-f]+)>", arr)
            start = int(a, 16)
            for i, dst in enumerate(dests):
                mapping[start + i] = _utf16be_hex(dst)
    return mapping


def _etiquetas_pdf(decoded: bytes, cmap: dict[int, str]) -> list[tuple[str | None, str]]:
    text = decoded.decode("latin-1", errors="replace")
    token_re = re.compile(
        r"/([A-Za-z][A-Za-z0-9]*)\s*(<<(?:[^<>]|<[^>]*>)*>>)?\s*BDC"
        r"|EMC"
        r"|<([0-9A-Fa-f]+)>\s*Tj"
    )
    paras: list[tuple[str | None, str]] = []
    buf: list[str] = []
    tag: str | None = None

    def flush() -> None:
        nonlocal buf, tag
        if not buf:
            return
        s = "".join(buf).replace("\u200b", "").strip()
        if s:
            paras.append((tag, s))
        buf = []

    for m in token_re.finditer(text):
        if m.group(1):
            flush()
            tag = m.group(1)
        elif m.group(0).startswith("EMC"):
            flush()
            tag = None
        elif m.group(3):
            ch = cmap.get(int(m.group(3), 16), "")
            if ch:
                buf.append(ch)
    flush()
    return paras


def unir_fragmentos_pdf(parts: list[str]) -> str:
    if not parts:
        return ""
    out: list[str] = []
    for p in parts:
        p = re.sub(r"\s+", " ", p).strip()
        if not p:
            continue
        if not out:
            out.append(p)
            continue
        prev = out[-1]
        if p.startswith((")", ",", ".", ";", ":", "/", "?")) or prev.endswith(
            ("(", "/", "-", ":")
        ):
            out[-1] = prev + p
        else:
            out.append(p)
    return re.sub(r"\s+", " ", " ".join(out)).strip()


def reconstruir_texto_pdf(paras: list[tuple[str | None, str]]) -> str:
    lines: list[str] = []
    span_buf: list[str] = []
    pending_bullet = False
    split_pasos = re.compile(
        r"(?<=[.!?])\s+(?=[A-ZÁÉÍÓÚÜÑ¿][^:]{1,60}:\s)"
    )

    def flush_spans() -> None:
        nonlocal span_buf
        if not span_buf:
            return
        text = unir_fragmentos_pdf(span_buf)
        span_buf = []
        if not text:
            return
        for chunk in split_pasos.split(text):
            chunk = chunk.strip()
            if chunk:
                lines.append(chunk)

    for tag, s in paras:
        if tag == "Span":
            span_buf.append(s)
            continue
        flush_spans()
        raw = re.sub(r"\s+", " ", s).strip()
        if not raw or re.match(r"(?i)^--\s*\d+\s+of\s+\d+\s*--$", raw):
            continue
        if tag == "LI" and raw in {"●", "•", "-", "*"}:
            pending_bullet = True
            continue
        if pending_bullet:
            lines.append(f"● {raw}")
            pending_bullet = False
            continue
        lines.append(raw)
    flush_spans()
    return "\n".join(lines).strip() + "\n"


def extraer_uris_pdf(data: bytes) -> list[str]:
    """URLs de anotaciones /URI del PDF Jumbo (a veces no van en el texto ToUnicode)."""
    vistos: list[str] = []
    for m in re.finditer(rb"/URI\s*\(([^)]+)\)", data or b""):
        url = m.group(1).decode("latin-1", errors="replace").strip().rstrip(".,;:\"'")
        if url.startswith("http") and url not in vistos:
            vistos.append(url)
    if not vistos:
        for m in re.finditer(rb"https?://[^\s\)>\]\(]+", data or b""):
            url = m.group(0).decode("latin-1", errors="replace").rstrip(".,;:\"'")
            if url not in vistos:
                vistos.append(url)
    return vistos


def rellenar_urls_vacias(texto: str, urls: list[str]) -> str:
    """Completa placeholders «(url:)» vacíos con las URIs del PDF, en orden."""
    if not texto or not urls:
        return texto
    idx = 0

    def _repl(_m: re.Match) -> str:
        nonlocal idx
        if idx >= len(urls):
            return _m.group(0)
        u = urls[idx]
        idx += 1
        return f"(url:{u})"

    return re.sub(r"\(\s*url:\s*\)", _repl, texto, flags=re.I)


def texto_desde_pdf(path: Path) -> str:
    """Extrae texto de un PDF Jumbo (ToUnicode + bloques BDC/EMC) sin dependencias."""
    data = path.read_bytes()
    if not data.startswith(b"%PDF"):
        raise ValueError(f"No es un PDF: {path}")
    cmaps: list[str] = []
    contents: list[bytes] = []
    for _hdr, decoded in _iter_pdf_streams(data):
        if b"begincmap" in decoded:
            cmaps.append(decoded.decode("latin-1", errors="replace"))
        elif b"Tj" in decoded and b"/CIDInit" not in decoded and b"glyf" not in decoded[:80]:
            contents.append(decoded)
    cmap: dict[int, str] = {}
    for cmap_txt in cmaps:
        cmap.update(_parse_tounicode_cmap(cmap_txt))
    paras: list[tuple[str | None, str]] = []
    for decoded in contents:
        paras.extend(_etiquetas_pdf(decoded, cmap))
    if paras:
        texto = reconstruir_texto_pdf(paras)
    else:
        chars: list[str] = []
        for decoded in contents:
            for h in re.findall(rb"<([0-9A-Fa-f]+)>\s*Tj", decoded):
                chars.append(cmap.get(int(h, 16), ""))
        blob = "".join(chars)
        blob = re.sub(
            r"(?<!^)(?=(?:Meta t[íi]tulo:|Meta descripci[oó]n:|Texto alt:|Tags:|"
            r"Ingredientes:|¿C[oó]mo preparar|Foto:|As[íi] queda))",
            "\n",
            blob,
        )
        texto = (blob.strip() + "\n") if blob.strip() else ""
    return rellenar_urls_vacias(texto, extraer_uris_pdf(data))


def slugify(s: str) -> str:
    s = s.lower().strip()
    s = re.sub(r"[áàäâ]", "a", s)
    s = re.sub(r"[éèëê]", "e", s)
    s = re.sub(r"[íìïî]", "i", s)
    s = re.sub(r"[óòöô]", "o", s)
    s = re.sub(r"[úùüû]", "u", s)
    s = re.sub(r"ñ", "n", s)
    s = re.sub(r"[^a-z0-9]+", "-", s).strip("-")
    return s[:80] or "receta"


def sin_tildes(s: str) -> str:
    return unicodedata.normalize("NFKD", str(s)).encode("ascii", "ignore").decode("ascii")


def normalizar_dificultad(valor: str | None) -> str | None:
    """El schema y el desplegable del BM usan el enum sin tildes: facil, media…"""
    if not valor:
        return None
    limpio = re.sub(r"\s+", " ", sin_tildes(valor).lower()).strip()
    return limpio or None


def valor_despues_label(lines: list[str], labels: list[str]) -> str | None:
    """Si la línea es 'Label:' toma el resto o la línea siguiente."""
    labs = [l.lower() for l in labels]
    for i, ln in enumerate(lines):
        low = ln.lower().strip()
        for lab in labs:
            if low == lab or low == lab + ":":
                if i + 1 < len(lines):
                    return lines[i + 1].strip()
                return None
            if low.startswith(lab + ":"):
                rest = ln.split(":", 1)[1].strip()
                if rest:
                    return rest
                if i + 1 < len(lines):
                    return lines[i + 1].strip()
    return None


def meta_linea(texto: str, labels: list[str]) -> str | None:
    for lab in labels:
        m = re.search(rf"(?im)^\s*{lab}\s*:\s*(.+)\s*$", texto)
        if m:
            return m.group(1).strip()
    return None


def parse_barra_info(texto: str) -> dict:
    """Ej: '35 min | Fácil | 4 porciones'"""
    out: dict = {}
    m = re.search(
        r"(?im)^\s*(\d+\s*(?:min|mins|minutos?|h|hs|horas?)(?:\s*\d+\s*min)?)\s*\|\s*([^|]+?)\s*\|\s*(\d+)\s*porciones?\s*$",
        texto,
    )
    if not m:
        m = re.search(
            r"(?im)(\d+\s*min)\s*\|\s*([^|]+?)\s*\|\s*(\d+)\s*porciones?",
            texto,
        )
    if m:
        out["tiempoTotal"] = m.group(1).strip()
        out["dificultad"] = normalizar_dificultad(m.group(2))
        out["porciones"] = m.group(3).strip()
    return out


def sin_vineta(line: str) -> str:
    return re.sub(r"^[\s\-–•*●·▪◦]+", "", line or "").strip()


def extraer_urls(texto: str) -> list[str]:
    vistos: list[str] = []
    for url in re.findall(r"https?://[^\s)\]>]+", texto or ""):
        url = url.rstrip(".,;:\"'")
        if url not in vistos:
            vistos.append(url)
    return vistos


def extraer_enlaces_inline(texto: str) -> list[dict]:
    """Jumbo: «vino (url:…) pipeño» o «yoghurt natural (url:…)» → anclas cortas BM."""
    out: list[dict] = []
    stop = {
        "el", "la", "los", "las", "un", "una", "de", "del", "con", "y", "o", "a", "en", "al",
        "lo", "le", "se", "su", "sus", "mi", "tu", "toda", "todo", "todas", "todos",
        "bate", "cubre", "agrega", "suma", "mezcla", "vierte", "incorpora",
    }
    pat = re.compile(
        r"(?:([A-Za-zÁÉÍÓÚáéíóúÑñüÜ][\wÁÉÍÓÚáéíóúÑñüÜ\-]*)\s+)?"
        r"([A-Za-zÁÉÍÓÚáéíóúÑñüÜ][\wÁÉÍÓÚáéíóúÑñüÜ\-]*)"
        r"\s*\(\s*url:\s*(https?://[^\s)]+)\s*\)\s*"
        r"([^\n.,;:!?]*)",
        re.I,
    )
    vistos: set[tuple[str, str]] = set()
    for m in pat.finditer(texto or ""):
        prev = (m.group(1) or "").strip()
        palabra = (m.group(2) or "").strip()
        url = m.group(3).rstrip(".,;:\"'")
        despues = (m.group(4) or "").strip()
        if not palabra or not url:
            continue
        candidatos: list[str] = []
        if prev and prev.lower() not in stop:
            candidatos.append(f"{prev} {palabra}")
            candidatos.append(prev)
        candidatos.append(palabra)
        cont = re.match(
            r"^(?:(de\s+[\wÁÉÍÓÚáéíóúÑñüÜ\-]+)|([\wÁÉÍÓÚáéíóúÑñüÜ\-]+))",
            despues,
            re.I,
        )
        if cont and not prev:
            cola = (cont.group(1) or cont.group(2) or "").strip()
            if cola:
                candidatos.insert(0, f"{palabra} {cola}")
        for ancla in candidatos:
            clave = (ancla.lower(), url)
            if not ancla or clave in vistos:
                continue
            vistos.add(clave)
            out.append({"texto": ancla, "url": url})
    return out


def limpiar_urls_en_texto(texto: str) -> str:
    """Quita '(url: https://…)' del Word/PDF exportado; deja la prosa editorial."""
    s = re.sub(r"\(\s*url:\s*https?://[^\s)]+\s*\)", " ", texto or "", flags=re.I)
    s = re.sub(r"\(\s*url:\s*\)", " ", s, flags=re.I)
    s = re.sub(r"https?://[^\s)\]>]+", " ", s)
    # Restos tipo «sal ( )» cuando el PDF trae url vacía.
    s = re.sub(r"\(\s*\)", " ", s)
    s = re.sub(r"\s+([,.;:!?])", r"\1", s)
    return re.sub(r"\s+", " ", s).strip()


def _es_pregunta_preparacion(line: str) -> bool:
    return bool(
        re.match(r"(?i)^¿?c[oó]mo\s+(preparar|hacer|armar|cocinar)\b", line or "")
    )


def parse_ingredientes(bloque: str) -> list[dict]:
    items = []
    stop = re.compile(
        r"(?i)^(¿?c[oó]mo\s+(preparar|hacer|armar|cocinar)|paso a paso|tips?\b|"
        r"as[íi]\s+queda\b|peque[ñn]os\s+detalles\b|preparaci[oó]n\b)",
    )
    for raw in bloque.splitlines():
        line = sin_vineta(raw)
        if not line or stop.match(line):
            if stop.match(line or ""):
                break
            continue
        if line.lower() in ("ingredientes", "ingredientes:"):
            continue
        # No usar "l" suelto como unidad: rompería "1 limón" → unidad=l, nombre=imón.
        m = re.match(
            r"^(?P<cant>\d+[.,]?\d*)\s*(?P<unidad>kg|g|gr|ml|lt|litros?|cdas?|cdtas?|cucharaditas?|cucharadas?|tazas?|unidades?|u\.?)?\s*(?:de\s+)?(?P<nombre>.+)$",
            line,
            re.I,
        )
        if m:
            nombre = m.group("nombre").strip()
            unidad = m.group("unidad")
            if unidad:
                unidad = unidad.lower()
                if unidad == "gr":
                    unidad = "g"
            items.append(
                {
                    "nombre": nombre,
                    "cantidad": m.group("cant"),
                    "unidad": unidad,
                    "linea": line,
                    "skuCencosud": None,
                    "notas": None,
                }
            )
        else:
            items.append(
                {
                    "nombre": line,
                    "cantidad": None,
                    "unidad": null_str(),
                    "linea": line,
                    "skuCencosud": None,
                    "notas": None,
                }
            )
    return items


def null_str():
    return None


def _linea_parece_nuevo_paso(line: str) -> bool:
    """True si «Acción: cuerpo…» (título corto + dos puntos)."""
    return bool(re.match(r"^[^:\n]{2,80}:\s+\S", line or ""))


def parse_pasos_jumbo(bloque: str) -> tuple[list[dict], list[str], str]:
    """Separa pasos reales de tips. El encabezado «Consejos para…» / «Así queda…» queda en tips_titulo."""
    pasos: list[dict] = []
    tips: list[str] = []
    tips_titulo = ""
    en_tips = False
    encabezado_re = re.compile(
        r"(?i)^(?P<title>tips?|consejos?|as[íi]\s+queda\b.*|para que\b.*|"
        r"para (?:un|una)\b.*|peque[ñn]os\s+detalles\b.*)"
        r"\s*(?P<sep>[:\-–])?\s*(?P<resto>.*)$"
    )
    for raw in bloque.splitlines():
        line = raw.strip()
        if not line:
            continue
        encabezado = encabezado_re.match(line)
        es_seccion_tips = bool(
            re.match(r"(?i)^(tips?|consejos?)\b", line)
            or re.match(r"(?i)^as[íi]\s+queda\b", line)
            or re.match(r"(?i)^para que\b", line)
            or re.match(r"(?i)^para (?:un|una)\b", line)
            or re.match(r"(?i)^peque[ñn]os\s+detalles\b", line)
        )
        if encabezado and es_seccion_tips:
            en_tips = True
            resto = (encabezado.group("resto") or "").strip()
            if resto and encabezado.group("sep"):
                tips.append(sin_vineta(resto))
            else:
                tips_titulo = line.strip()
            continue
        if en_tips:
            tips.append(sin_vineta(line))
            continue
        line = re.sub(r"^\d+[\).\:\-]\s*", "", line)
        line = sin_vineta(line)
        if not line:
            continue
        if re.match(r"(?i)^paso a paso\s*:?\s*$", line):
            continue
        if _es_pregunta_preparacion(line):
            continue
        enlaces = extraer_enlaces_inline(line)
        line = limpiar_urls_en_texto(line)
        if not line:
            continue
        # Continuación de párrafo partido por el PDF (sin «Título:»).
        if pasos and not _linea_parece_nuevo_paso(line):
            prev = pasos[-1]
            prev["texto"] = f"{prev['texto']} {line}".strip()
            if enlaces:
                ya = prev.setdefault("enlaces", [])
                vistos = {(e.get("texto"), e.get("url")) for e in ya}
                for e in enlaces:
                    clave = (e.get("texto"), e.get("url"))
                    if clave not in vistos:
                        ya.append(e)
                        vistos.add(clave)
                prev["enlaces"] = sorted(
                    ya, key=lambda e: len(str(e.get("texto") or "")), reverse=True
                )
            continue
        paso: dict = {"orden": len(pasos) + 1, "texto": line}
        if enlaces:
            # Anclas largas primero para el HTML del BM.
            paso["enlaces"] = sorted(
                enlaces, key=lambda e: len(str(e.get("texto") or "")), reverse=True
            )
        pasos.append(paso)
    return pasos, tips, tips_titulo


def parse_lista_csv(valor: str | None) -> list[str]:
    if not valor:
        return []
    return [p.strip() for p in re.split(r"[,;/|]", valor) if p.strip()]


def es_formato_jumbo(lines: list[str]) -> bool:
    head = "\n".join(lines[:8]).lower()
    return "meta título" in head or "meta titulo" in head or "meta descripción" in head or "meta descripcion" in head


def construir_receta_jumbo(lines: list[str], texto: str, fuente: str) -> dict:
    meta_titulo = valor_despues_label(lines, ["meta título", "meta titulo"])
    # Jumbo a veces escribe solo "descripción:" (sin prefijo meta).
    meta_desc = valor_despues_label(
        lines,
        ["meta descripción", "meta descripcion", "descripción", "descripcion"],
    )

    # Título editorial: primera línea que no sea meta/foto/tags/barra
    titulo = None
    skip_next_desc_value = False
    for ln in lines:
        low = ln.lower().strip()
        if skip_next_desc_value:
            skip_next_desc_value = False
            continue
        if low.startswith("meta ") or low in (
            "meta título:",
            "meta titulo:",
            "meta descripción:",
            "meta descripcion:",
            "descripción:",
            "descripcion:",
            "descripción",
            "descripcion",
        ):
            # Si el valor de descripción va en la línea siguiente, saltarla también.
            if low in ("descripción:", "descripcion:", "descripción", "descripcion") or low.startswith(
                "meta descripción"
            ) or low.startswith("meta descripcion"):
                if ":" in ln and not ln.split(":", 1)[1].strip():
                    skip_next_desc_value = True
                elif low in ("descripción", "descripcion"):
                    skip_next_desc_value = True
            continue
        if low.startswith("texto alt:") or low.startswith("([foto])") or low == "[foto]":
            continue
        if low.startswith("foto:"):
            continue
        if low.startswith("tags:"):
            continue
        if re.match(r"(?i)^\d+\s*min\s*\|", ln):
            continue
        if meta_titulo and ln.strip() == meta_titulo.strip():
            continue
        if meta_desc and ln.strip() == meta_desc.strip():
            continue
        # título limpio (sin "| Recetas Jumbo")
        if "|" in ln and "recetas jumbo" in low:
            continue
        if re.match(r"(?i)^ingredientes\s*:?\s*$", ln):
            break
        titulo = ln.strip()
        break

    if not titulo and meta_titulo:
        titulo = re.sub(r"\s*\|\s*Recetas Jumbo\s*$", "", meta_titulo, flags=re.I).strip()

    desc = meta_desc or ""
    alt = valor_despues_label(lines, ["texto alt"]) or meta_linea(texto, ["texto alt", "alt"])
    foto_origen = valor_despues_label(lines, ["foto"]) or meta_linea(texto, ["foto"])
    if foto_origen:
        foto_origen = foto_origen.strip().strip('"').strip("'")
    pregunta = None
    m_preg = re.search(
        r"(?im)^(¿?c[oó]mo\s+(?:preparar|hacer|armar|cocinar)[^\n]+)",
        texto,
    )
    if m_preg:
        pregunta = m_preg.group(1).strip()
    enlaces = extraer_urls(texto)

    barra = parse_barra_info(texto)
    tags_line = meta_linea(texto, ["tags", "etiquetas"]) or valor_despues_label(lines, ["tags", "etiquetas"])
    categorias = parse_lista_csv(tags_line)

    # Ingredientes: desde "Ingredientes" hasta "¿Cómo preparar/hacer" / "Paso a paso"
    ing_bloque = ""
    m_ing = re.search(
        r"(?is)^\s*ingredientes?\s*:?\s*\n(.*?)(?=\n\s*(?:¿?c[oó]mo\s+(?:preparar|hacer|armar|cocinar)|paso a paso)\b)",
        texto,
        re.M,
    )
    if m_ing:
        ing_bloque = m_ing.group(1).strip()
    ingredientes = parse_ingredientes(ing_bloque)

    # Pasos (anclar al inicio de línea: la meta desc también dice «cómo preparar…»)
    m_pas = re.search(
        r"(?is)(?:^|\n)\s*(?:paso a paso\s*:?\s*\n|"
        r"¿?c[oó]mo\s+(?:preparar|hacer|armar|cocinar)[^\n]*\n"
        r"(?:paso a paso\s*:?\s*\n)?)(.*)\Z",
        texto,
    )
    pas_bloque = m_pas.group(1).strip() if m_pas else ""
    # si quedó el encabezado "Paso a paso" dentro, limpiar
    pas_bloque = re.sub(r"(?im)^paso a paso\s*:?\s*\n?", "", pas_bloque).strip()
    pasos, tips, tips_titulo = parse_pasos_jumbo(pas_bloque)

    faltantes: list[str] = []
    if not titulo:
        faltantes.append("titulo")
    if not desc:
        faltantes.append("descripcion")
    if not ingredientes:
        faltantes.append("ingredientes")
    if not pasos:
        faltantes.append("pasos")
    if not barra.get("porciones"):
        faltantes.append("porciones")
    if not barra.get("dificultad"):
        faltantes.append("dificultad")
    if not categorias:
        faltantes.append("categorias")
    if any(i.get("skuCencosud") is None for i in ingredientes):
        faltantes.append("ingredientes.skuCencosud")

    faltantes_bloqueantes = [f for f in faltantes if f != "ingredientes.skuCencosud"]
    estado = "listo-para-cargar" if not faltantes_bloqueantes else "borrador"

    sid = slugify(titulo or "receta")
    seo_titulo = meta_titulo or titulo
    seo_desc = meta_desc or desc

    imagenes = []
    if alt or foto_origen:
        nota = "Foto referenciada en Word/PDF; adjuntar archivo al cargar en BM"
        if foto_origen and not foto_origen.lower().startswith("http"):
            nota = f"Foto local: {foto_origen}. En tu PC se busca en Descargas / inbox."
        imagenes.append(
            {
                "rutaLocal": "",
                "rutaOrigen": foto_origen or "",
                "urlFuente": foto_origen if (foto_origen or "").lower().startswith("http") else "",
                "alt": alt or "",
                "rol": "portada",
                "nota": nota,
            }
        )

    formato = "jumbo-pdf" if str(fuente).lower().endswith(".pdf") else "jumbo-word"

    return {
        "id": sid,
        "fuenteWord": fuente,
        "formatoOrigen": formato,
        "titulo": titulo,
        "descripcion": desc,
        "porciones": barra.get("porciones"),
        "tiempoPreparacion": None,
        "tiempoCoccion": None,
        "tiempoTotal": barra.get("tiempoTotal"),
        "dificultad": barra.get("dificultad"),
        "categorias": categorias,
        "ocasiones": [],
        "ingredientes": ingredientes,
        "pasos": pasos,
        "preguntaPreparacion": pregunta,
        "enlacesProductos": enlaces,
        "tips": tips,
        "tipsTitulo": tips_titulo,
        "imagenes": imagenes,
        "seo": {
            "metaTitulo": seo_titulo,
            "metaDescripcion": seo_desc,
            "slugSugerido": sid,
        },
        "camposFaltantes": faltantes,
        "estado": estado,
        "publicacion": {
            "destino": "business-manager.ecomm.cencosud.com",
            "bandera": "jumbo",
            "urlPublica": None,
            "publicadoEn": None,
            "notas": None,
        },
        "parseadoEn": datetime.now(timezone.utc).isoformat(),
    }


def construir_receta_simple(texto: str, lines: list[str], fuente: str) -> dict:
    titulo = meta_linea(texto, ["título", "titulo", "title"]) or (lines[0] if lines else "Sin título")
    desc = meta_linea(texto, ["descripción", "descripcion", "description", "bajada", "intro"]) or ""

    m_ing = re.search(
        r"(?is)ingredientes?\s*:\s*\n(.*?)(?=\n\s*(?:pasos?|preparaci[oó]n|instrucciones?|paso a paso)\s*:?\s*\n|\Z)",
        texto,
    )
    ing_bloque = m_ing.group(1).strip() if m_ing else ""
    m_pas = re.search(
        r"(?is)(?:pasos?|preparaci[oó]n|instrucciones?|paso a paso)\s*:\s*\n(.*)\Z",
        texto,
    )
    pas_bloque = m_pas.group(1).strip() if m_pas else ""
    ingredientes = parse_ingredientes(ing_bloque)
    pasos, tips, tips_titulo = parse_pasos_jumbo(pas_bloque)

    porciones = meta_linea(texto, ["porciones", "rinde", "servings"])
    t_prep = meta_linea(
        texto,
        ["tiempo de preparación", "tiempo de preparacion", "preparación", "preparacion", "prep"],
    )
    t_coc = meta_linea(texto, ["tiempo de cocción", "tiempo de coccion", "cocción", "coccion"])
    t_tot = meta_linea(texto, ["tiempo total", "total"])
    dificultad = normalizar_dificultad(meta_linea(texto, ["dificultad", "nivel"]))
    categorias = parse_lista_csv(meta_linea(texto, ["categorías", "categorias", "categoría", "categoria", "tags"]))
    ocasiones = parse_lista_csv(meta_linea(texto, ["ocasiones", "ocasión", "ocasion"]))

    faltantes: list[str] = []
    if not titulo or titulo == "Sin título":
        faltantes.append("titulo")
    if not desc:
        faltantes.append("descripcion")
    if not ingredientes:
        faltantes.append("ingredientes")
    if not pasos:
        faltantes.append("pasos")
    if not porciones:
        faltantes.append("porciones")
    if not dificultad:
        faltantes.append("dificultad")
    if not categorias:
        faltantes.append("categorias")
    if any(i.get("skuCencosud") is None for i in ingredientes):
        faltantes.append("ingredientes.skuCencosud")

    faltantes_bloqueantes = [f for f in faltantes if f != "ingredientes.skuCencosud"]
    estado = "listo-para-cargar" if not faltantes_bloqueantes else "borrador"
    sid = slugify(titulo)

    return {
        "id": sid,
        "fuenteWord": fuente,
        "formatoOrigen": "simple",
        "titulo": titulo,
        "descripcion": desc,
        "porciones": porciones,
        "tiempoPreparacion": t_prep,
        "tiempoCoccion": t_coc,
        "tiempoTotal": t_tot,
        "dificultad": dificultad,
        "categorias": categorias,
        "ocasiones": ocasiones,
        "ingredientes": ingredientes,
        "pasos": pasos,
        "tips": tips,
        "tipsTitulo": tips_titulo,
        "imagenes": [],
        "seo": {
            "metaTitulo": titulo,
            "metaDescripcion": (desc[:155] + "…") if len(desc) > 156 else desc,
            "slugSugerido": sid,
        },
        "camposFaltantes": faltantes,
        "estado": estado,
        "publicacion": {
            "destino": "business-manager.ecomm.cencosud.com",
            "bandera": "jumbo",
            "urlPublica": None,
            "publicadoEn": None,
            "notas": None,
        },
        "parseadoEn": datetime.now(timezone.utc).isoformat(),
    }


def construir_receta(texto: str, fuente: str) -> dict:
    lines = [ln.strip() for ln in texto.splitlines() if ln.strip()]
    if es_formato_jumbo(lines):
        return construir_receta_jumbo(lines, texto, fuente)
    return construir_receta_simple(texto, lines, fuente)


def crear_parser_argumentos() -> argparse.ArgumentParser:
    return argparse.ArgumentParser(
        description="Parsea una receta Word, PDF Jumbo o texto a JSON intermedio CRC.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""Ejemplos:
  python3 scripts/parse-receta-word.py inbox/receta.docx
  python3 scripts/parse-receta-word.py inbox/Maremoto.pdf
  python3 scripts/parse-receta-word.py inbox/receta.docx --force

La forma con --force es destructiva: reemplaza conjuntamente el JSON y el raw existentes.

Scraping BM (en TU PC, con login):
  python3 scripts/explorar-bm-cencosud.py --reuse-session
  python3 scripts/publicar-receta-cencosud.py out/maremoto.json --headed --dry-run
""",
    )


def main() -> int:
    parser = crear_parser_argumentos()
    parser.add_argument("archivo", help="Archivo fuente .docx, .pdf o .txt")
    parser.add_argument(
        "--force",
        action="store_true",
        help="DESTRUCTIVO: reemplaza conjuntamente <slug>.json y <slug>.raw.txt si alguno existe",
    )
    args = parser.parse_args()
    src = Path(args.archivo).expanduser().resolve()
    if not src.exists():
        print(f"No existe: {src}", file=sys.stderr)
        return 1

    suf = src.suffix.lower()
    if suf == ".docx":
        texto = texto_desde_docx(src)
    elif suf == ".pdf":
        texto = texto_desde_pdf(src)
        if not texto.strip():
            print(f"No se pudo leer texto del PDF: {src}", file=sys.stderr)
            return 1
    else:
        texto = src.read_text(encoding="utf-8")

    try:
        rel = str(src.relative_to(ROOT))
    except ValueError:
        rel = str(src)

    receta = construir_receta(texto, rel)
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    media_dir = OUT_DIR / "media" / receta["id"]
    if suf == ".docx":
        aplicar_hipervinculos_a_pasos(receta, hipervinculos_producto_docx(src))
        adjuntar_foto_portada(receta, src, media_dir)
    elif suf == ".pdf":
        adjuntar_foto_local(receta, src, media_dir)

    out = OUT_DIR / f"{receta['id']}.json"
    raw_out = OUT_DIR / f"{receta['id']}.raw.txt"
    existing_outputs = [path for path in (out, raw_out) if path.exists()]
    if existing_outputs and not args.force:
        print(
            "Error: ya existe al menos una salida para esta receta: "
            + ", ".join(path.name for path in existing_outputs),
            file=sys.stderr,
        )
        print(
            "No se escribió ningún archivo; JSON y raw se protegen como una unidad.",
            file=sys.stderr,
        )
        print(
            "Para reemplazar ambos de forma destructiva: "
            "python3 scripts/parse-receta-word.py <archivo.docx|.pdf|.txt> --force",
            file=sys.stderr,
        )
        return 3

    out.write_text(json.dumps(receta, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    raw_out.write_text(texto + "\n", encoding="utf-8")

    print(f"OK → {out.relative_to(ROOT)}")
    print(f"titulo: {receta.get('titulo')}")
    print(f"estado: {receta['estado']}")
    if receta["camposFaltantes"]:
        print("camposFaltantes:", ", ".join(receta["camposFaltantes"]))
    print(f"ingredientes: {len(receta.get('ingredientes') or [])} · pasos: {len(receta.get('pasos') or [])}")
    print("Siguiente (en tu PC):")
    print("  python scripts\\explorar-bm-cencosud.py --reuse-session")
    print(f"  python scripts\\publicar-receta-cencosud.py {out.relative_to(ROOT)} --headed --dry-run")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
