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

import json
import re
import sys
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


def normalizar_dificultad(valor: str | None) -> str | None:
    if not valor:
        return None
    normalizada = valor.strip().lower().translate(str.maketrans("áéíóúü", "aeiouu"))
    validas = {"muy facil", "facil", "media", "dificil", "absurdamente dificil"}
    return normalizada if normalizada in validas else None


def parse_barra_info(texto: str) -> dict:
    """Ej: '35 min | Fácil | 4 porciones'"""
    out: dict = {}
    # region agent log
    with open("/opt/cursor/logs/debug.log", "a", encoding="utf-8") as _debug_log:
        _debug_log.write(json.dumps({"hypothesisId": "D", "location": "scripts/parse-receta-word.py:parse_barra_info:entry", "message": "entrada barra info", "data": {"textoLength": len(texto), "pipeCount": texto.count("|")}, "timestamp": int(datetime.now(timezone.utc).timestamp() * 1000)}, ensure_ascii=False) + "\n")
    # endregion
    m = re.search(
        r"(?im)^\s*(\d+\s*(?:min|mins|minutos?|h|hs|horas?)(?:\s*\d+\s*min)?)\s*\|\s*([^|]+?)\s*\|\s*(\d+)\s*porciones?\s*$",
        texto,
    )
    if not m:
        m = re.search(
            r"(?im)(\d+\s*min)\s*\|\s*([^|]+?)\s*\|\s*(\d+)\s*porciones?",
            texto,
        )
    # region agent log
    with open("/opt/cursor/logs/debug.log", "a", encoding="utf-8") as _debug_log:
        _debug_log.write(json.dumps({"hypothesisId": "D", "location": "scripts/parse-receta-word.py:parse_barra_info:match", "message": "resultado regex barra", "data": {"matched": bool(m), "rawDifficulty": m.group(2).strip() if m else None}, "timestamp": int(datetime.now(timezone.utc).timestamp() * 1000)}, ensure_ascii=False) + "\n")
    # endregion
    if m:
        out["tiempoTotal"] = m.group(1).strip()
        out["dificultad"] = normalizar_dificultad(m.group(2))
        out["porciones"] = m.group(3).strip()
    # region agent log
    with open("/opt/cursor/logs/debug.log", "a", encoding="utf-8") as _debug_log:
        _debug_log.write(json.dumps({"hypothesisId": "D", "location": "scripts/parse-receta-word.py:parse_barra_info:exit", "message": "salida barra normalizada", "data": {"difficulty": out.get("dificultad"), "schemaCompatible": out.get("dificultad") in {"muy facil", "facil", "media", "dificil", "absurdamente dificil", None}}, "timestamp": int(datetime.now(timezone.utc).timestamp() * 1000)}, ensure_ascii=False) + "\n")
    # endregion
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
        m = re.match(
            r"^(?P<cant>\d+[.,]?\d*)\s*(?P<unidad>kg|g|gr|ml|l|lt|cdas?|cdtas?|cucharaditas?|cucharadas?|tazas?|unidades?|u\.?)?\s*(?:de\s+)?(?P<nombre>.+)$",
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
    # region agent log
    with open("/opt/cursor/logs/debug.log", "a", encoding="utf-8") as _debug_log:
        _debug_log.write(json.dumps({"hypothesisId": "A,B,C", "location": "scripts/parse-receta-word.py:parse_pasos_jumbo:entry", "message": "entrada pasos", "data": {"lineCount": len(bloque.splitlines())}, "timestamp": int(datetime.now(timezone.utc).timestamp() * 1000)}, ensure_ascii=False) + "\n")
    # endregion
    for line_index, raw in enumerate(bloque.splitlines(), start=1):
        line = raw.strip()
        if not line:
            continue
        # region agent log
        with open("/opt/cursor/logs/debug.log", "a", encoding="utf-8") as _debug_log:
            _debug_log.write(json.dumps({"hypothesisId": "A,B", "location": "scripts/parse-receta-word.py:parse_pasos_jumbo:line", "message": "clasificacion previa de linea", "data": {"index": line_index, "line": line[:160], "enTipsAntes": en_tips, "tipPrefix": bool(re.match(r"(?i)^tips?\b", line)), "numbered": bool(re.match(r"^\d+[\).\:\-]\s*", line))}, "timestamp": int(datetime.now(timezone.utc).timestamp() * 1000)}, ensure_ascii=False) + "\n")
        # endregion
        if re.match(r"(?i)^tips?\s*:?\s*$", line):
            en_tips = True
            # region agent log
            with open("/opt/cursor/logs/debug.log", "a", encoding="utf-8") as _debug_log:
                _tip_match = re.match(r"(?i)^tips?\b", line)
                _debug_log.write(json.dumps({"hypothesisId": "A,C", "location": "scripts/parse-receta-word.py:parse_pasos_jumbo:tip-branch", "message": "rama de encabezado tip", "data": {"index": line_index, "matchedPrefix": _tip_match.group(0) if _tip_match else None, "inlineRemainder": line[_tip_match.end():].lstrip(" :.-") if _tip_match else None, "enTipsDespues": en_tips}, "timestamp": int(datetime.now(timezone.utc).timestamp() * 1000)}, ensure_ascii=False) + "\n")
            # endregion
            continue
        tip_inline = re.match(r"(?i)^tips?\s*:\s*(.+)$", line)
        if tip_inline:
            tips.append(tip_inline.group(1).strip())
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
    # region agent log
    with open("/opt/cursor/logs/debug.log", "a", encoding="utf-8") as _debug_log:
        _debug_log.write(json.dumps({"hypothesisId": "B,C", "location": "scripts/parse-receta-word.py:parse_pasos_jumbo:exit", "message": "salida pasos y tips", "data": {"pasos": pasos, "tips": tips, "enTipsFinal": en_tips}, "timestamp": int(datetime.now(timezone.utc).timestamp() * 1000)}, ensure_ascii=False) + "\n")
    # endregion
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
    meta_desc = valor_despues_label(lines, ["meta descripción", "meta descripcion"])

    # Título editorial: primera línea que no sea meta/foto/tags/barra
    titulo = None
    for ln in lines:
        low = ln.lower()
        if low.startswith("meta ") or low in ("meta título:", "meta titulo:", "meta descripción:", "meta descripcion:"):
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
    # region agent log
    with open("/opt/cursor/logs/debug.log", "a", encoding="utf-8") as _debug_log:
        _debug_log.write(json.dumps({"hypothesisId": "E", "location": "scripts/parse-receta-word.py:construir_receta_jumbo:readiness", "message": "evaluacion de campos faltantes", "data": {"difficulty": barra.get("dificultad"), "difficultyTruthy": bool(barra.get("dificultad")), "difficultyListedMissing": "dificultad" in faltantes, "estado": estado}, "timestamp": int(datetime.now(timezone.utc).timestamp() * 1000)}, ensure_ascii=False) + "\n")
    # endregion

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
    dificultad = meta_linea(texto, ["dificultad", "nivel"])
    dificultad = normalizar_dificultad(dificultad)
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


def main() -> int:
    if len(sys.argv) < 2:
        print("Uso: python3 scripts/parse-receta-word.py <archivo.docx|.txt>", file=sys.stderr)
        return 2
    src = Path(sys.argv[1]).expanduser().resolve()
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
    # limpiar parseo fallido previo meta-titulo.*
    for stale in OUT_DIR.glob("meta-titulo.*"):
        stale.unlink(missing_ok=True)

    out = OUT_DIR / f"{receta['id']}.json"
    out.write_text(json.dumps(receta, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    raw_out = OUT_DIR / f"{receta['id']}.raw.txt"
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
