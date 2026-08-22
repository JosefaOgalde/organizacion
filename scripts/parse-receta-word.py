#!/usr/bin/env python3
"""
Parsea un Word (.docx) o texto de receta → JSON intermedio CRC.

Soporta:
  - Formato Jumbo (Meta título / Meta descripción / "35 min | Fácil | 4 porciones" / Tags / Paso a paso)
  - Formato simple etiquetado (Título:, Ingredientes:, Pasos:)

Uso:
  python3 scripts/parse-receta-word.py index/clientes/Herramientas/carga-recetas-cencosud/inbox/receta.docx
"""
from __future__ import annotations

import argparse
import json
import re
import sys
import unicodedata
import zipfile
import xml.etree.ElementTree as ET
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CRC = ROOT / "index/clientes/Herramientas/carga-recetas-cencosud"
OUT_DIR = CRC / "out"

W_NS = {"w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main"}


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
    return (
        unicodedata.normalize("NFKD", s)
        .encode("ascii", "ignore")
        .decode("ascii")
    )


def normalizar_dificultad(valor: str | None) -> str | None:
    """El schema usa el enum sin tildes: 'facil', 'media', 'dificil'…"""
    if not valor:
        return None
    limpio = re.sub(r"\s+", " ", sin_tildes(str(valor)).lower()).strip()
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


def parse_ingredientes(bloque: str) -> list[dict]:
    items = []
    stop = re.compile(
        r"(?i)^(¿?c[oó]mo preparar|paso a paso|tips?\b|preparaci[oó]n\b)",
    )
    for raw in bloque.splitlines():
        line = raw.strip().lstrip("-•*").strip()
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
                    "skuCencosud": None,
                    "notas": None,
                }
            )
    return items


def null_str():
    return None


def parse_pasos_jumbo(bloque: str) -> tuple[list[dict], list[str]]:
    """Separa pasos reales de tips."""
    pasos: list[dict] = []
    tips: list[str] = []
    en_tips = False
    for raw in bloque.splitlines():
        line = raw.strip()
        if not line:
            continue
        encabezado = re.match(r"(?i)^(tips?|consejos?)\b\s*(?P<sep>[:\-–])?\s*(?P<resto>.*)$", line)
        if encabezado:
            en_tips = True
            # «Tips: deja reposar» trae el consejo en la misma línea;
            # «Tips para unos anticuchos perfectos» es solo el título de la sección.
            resto = (encabezado.group("resto") or "").strip()
            if resto and encabezado.group("sep"):
                tips.append(resto.lstrip("-•* ").strip())
            continue
        if en_tips:
            tips.append(line.lstrip("-•* ").strip())
            continue
        line = re.sub(r"^\d+[\).\:\-]\s*", "", line)
        line = line.lstrip("-•*").strip()
        if not line:
            continue
        if re.match(r"(?i)^paso a paso\s*:?\s*$", line):
            continue
        if re.match(r"(?i)^¿?c[oó]mo preparar", line):
            continue
        pasos.append({"orden": len(pasos) + 1, "texto": line})
    return pasos, tips


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

    barra = parse_barra_info(texto)
    tags_line = meta_linea(texto, ["tags", "etiquetas"]) or valor_despues_label(lines, ["tags", "etiquetas"])
    categorias = parse_lista_csv(tags_line)

    # Ingredientes: desde "Ingredientes" hasta "¿Cómo preparar" / "Paso a paso"
    ing_bloque = ""
    m_ing = re.search(
        r"(?is)^\s*ingredientes?\s*:?\s*\n(.*?)(?=\n\s*(?:¿?c[oó]mo preparar|paso a paso)\b)",
        texto,
        re.M,
    )
    if m_ing:
        ing_bloque = m_ing.group(1).strip()
    ingredientes = parse_ingredientes(ing_bloque)

    # Pasos
    m_pas = re.search(
        r"(?is)(?:paso a paso\s*:?\s*\n|¿?c[oó]mo preparar[^\n]*\n(?:paso a paso\s*:?\s*\n)?)(.*)\Z",
        texto,
    )
    pas_bloque = m_pas.group(1).strip() if m_pas else ""
    # si quedó el encabezado "Paso a paso" dentro, limpiar
    pas_bloque = re.sub(r"(?im)^paso a paso\s*:?\s*\n?", "", pas_bloque).strip()
    pasos, tips = parse_pasos_jumbo(pas_bloque)

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
    if alt:
        imagenes.append(
            {
                "rutaLocal": "",
                "alt": alt,
                "rol": "portada",
                "nota": "Foto referenciada en Word; adjuntar archivo al cargar en BM",
            }
        )

    return {
        "id": sid,
        "fuenteWord": fuente,
        "formatoOrigen": "jumbo-word",
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
        "tips": tips,
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
    pasos, tips = parse_pasos_jumbo(pas_bloque)

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
        description="Parsea una receta Word o texto a JSON intermedio CRC.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""Ejemplos:
  python3 scripts/parse-receta-word.py inbox/receta.docx
  python3 scripts/parse-receta-word.py inbox/receta.docx --force

La segunda forma es destructiva: --force reemplaza conjuntamente el JSON y el raw existentes.
""",
    )


def main() -> int:
    parser = crear_parser_argumentos()
    parser.add_argument("archivo", help="Archivo fuente .docx o .txt")
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

    if src.suffix.lower() == ".docx":
        texto = texto_desde_docx(src)
    else:
        texto = src.read_text(encoding="utf-8")

    try:
        rel = str(src.relative_to(ROOT))
    except ValueError:
        rel = str(src)

    receta = construir_receta(texto, rel)
    OUT_DIR.mkdir(parents=True, exist_ok=True)

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
            "python3 scripts/parse-receta-word.py <archivo.docx|.txt> --force",
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
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
