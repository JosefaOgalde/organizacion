#!/usr/bin/env python3
"""
Parsea un Word (.docx) o texto de receta → JSON intermedio CRC.
Uso:
  python3 scripts/parse-receta-word.py index/clientes/Herramientas/carga-recetas-cencosud/inbox/receta.docx
  python3 scripts/parse-receta-word.py path/a/receta.txt
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


def seccion(texto: str, nombres: list[str]) -> tuple[str | None, str]:
    """Devuelve (contenido de sección, texto restante) si encuentra un encabezado."""
    pattern = r"(?im)^(?:\s*(?:" + "|".join(re.escape(n) for n in nombres) + r")\s*:?\s*)$"
    m = re.search(pattern, texto)
    if not m:
        return None, texto
    start = m.end()
    # siguiente encabezado conocido
    headers = (
        r"ingredientes?",
        r"pasos?",
        r"preparaci[oó]n",
        r"instrucciones?",
        r"descripci[oó]n",
        r"categor[ií]as?",
        r"ocasiones?",
        r"dificultad",
        r"porciones?",
        r"tiempo(?:\s+de)?\s+(?:preparaci[oó]n|cocci[oó]n|total)",
        r"t[ií]tulo",
    )
    nxt = re.search(r"(?im)^(?:\s*(?:" + "|".join(headers) + r")\s*:?\s*)$", texto[start:])
    end = start + nxt.start() if nxt else len(texto)
    return texto[start:end].strip(), texto


def meta_linea(texto: str, labels: list[str]) -> str | None:
    for lab in labels:
        m = re.search(rf"(?im)^\s*{lab}\s*:\s*(.+)\s*$", texto)
        if m:
            return m.group(1).strip()
    return None


def parse_ingredientes(bloque: str) -> list[dict]:
    items = []
    for raw in bloque.splitlines():
        line = raw.strip().lstrip("-•*").strip()
        if not line:
            continue
        m = re.match(
            r"^(?P<cant>\d+[.,]?\d*)\s*(?P<unidad>kg|g|gr|ml|l|lt|cdas?|cdtas?|tazas?|unidades?|u\.?)?\s+(?P<nombre>.+)$",
            line,
            re.I,
        )
        if m:
            items.append(
                {
                    "nombre": m.group("nombre").strip(),
                    "cantidad": m.group("cant"),
                    "unidad": (m.group("unidad") or None),
                    "skuCencosud": None,
                    "notas": None,
                }
            )
        else:
            items.append(
                {
                    "nombre": line,
                    "cantidad": None,
                    "unidad": None,
                    "skuCencosud": None,
                    "notas": None,
                }
            )
    return items


def parse_pasos(bloque: str) -> list[dict]:
    pasos = []
    for raw in bloque.splitlines():
        line = raw.strip()
        if not line:
            continue
        line = re.sub(r"^\d+[\).\:\-]\s*", "", line)
        line = line.lstrip("-•*").strip()
        if not line:
            continue
        pasos.append({"orden": len(pasos) + 1, "texto": line})
    return pasos


def parse_lista_csv(valor: str | None) -> list[str]:
    if not valor:
        return []
    return [p.strip() for p in re.split(r"[,;/|]", valor) if p.strip()]


def construir_receta(texto: str, fuente: str) -> dict:
    lines = [ln.strip() for ln in texto.splitlines() if ln.strip()]
    titulo = meta_linea(texto, ["título", "titulo", "title"]) or (lines[0] if lines else "Sin título")
    if lines and lines[0].lower().startswith(("título:", "titulo:", "title:")):
        # quitar línea de título del cuerpo si estaba etiquetada
        pass

    desc = meta_linea(texto, ["descripción", "descripcion", "description", "bajada", "intro"])
    if not desc:
        # párrafo tras el título hasta el primer encabezado de sección
        body = "\n".join(lines[1:]) if lines else ""
        ing_m = re.search(r"(?im)^(ingredientes?|pasos?|preparaci[oó]n)\s*:?\s*$", body)
        bloque = body[: ing_m.start()] if ing_m else body
        # saltar líneas meta tipo Porciones:
        paras = []
        for ln in bloque.splitlines():
            if re.match(
                r"(?i)^(porciones?|dificultad|categor|ocasi|tiempo)\b",
                ln.strip(),
            ):
                continue
            if re.match(r"(?i)^(título|titulo|title|descripci)\s*:", ln.strip()):
                continue
            paras.append(ln.strip())
        desc = " ".join(paras).strip() or ""

    ing_bloque, _ = seccion(texto, ["Ingredientes", "INGREDIENTES", "ingredients"])
    # también "Ingredientes:" en la misma línea
    if not ing_bloque:
        m = re.search(
            r"(?is)ingredientes?\s*:\s*\n(.*?)(?=\n\s*(?:pasos?|preparaci[oó]n|instrucciones?)\s*:?\s*\n|\Z)",
            texto,
        )
        ing_bloque = m.group(1).strip() if m else ""

    pas_bloque, _ = seccion(texto, ["Pasos", "PASOS", "Preparación", "Preparacion", "Instrucciones"])
    if not pas_bloque:
        m = re.search(
            r"(?is)(?:pasos?|preparaci[oó]n|instrucciones?)\s*:\s*\n(.*)\Z",
            texto,
        )
        pas_bloque = m.group(1).strip() if m else ""

    ingredientes = parse_ingredientes(ing_bloque or "")
    pasos = parse_pasos(pas_bloque or "")

    porciones = meta_linea(texto, ["porciones", "rinde", "servings"])
    t_prep = meta_linea(texto, ["tiempo de preparación", "tiempo de preparacion", "preparación", "preparacion", "prep"])
    t_coc = meta_linea(texto, ["tiempo de cocción", "tiempo de coccion", "cocción", "coccion"])
    t_tot = meta_linea(texto, ["tiempo total", "total"])
    dificultad = meta_linea(texto, ["dificultad", "nivel"])
    if dificultad:
        dificultad = dificultad.lower().strip()

    categorias = parse_lista_csv(meta_linea(texto, ["categorías", "categorias", "categoría", "categoria"]))
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

    estado = "listo-para-cargar" if not faltantes else "borrador"
    # SKUs casi siempre faltan del Word; no bloquear "casi listo" solo por SKU
    faltantes_bloqueantes = [f for f in faltantes if f != "ingredientes.skuCencosud"]
    if not faltantes_bloqueantes and faltantes == ["ingredientes.skuCencosud"]:
        estado = "listo-para-cargar"

    sid = slugify(titulo)
    return {
        "id": sid,
        "fuenteWord": fuente,
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
    out = OUT_DIR / f"{receta['id']}.json"
    out.write_text(json.dumps(receta, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    # también guardar texto crudo para depurar
    raw_out = OUT_DIR / f"{receta['id']}.raw.txt"
    raw_out.write_text(texto + "\n", encoding="utf-8")

    print(f"OK → {out.relative_to(ROOT)}")
    print(f"estado: {receta['estado']}")
    if receta["camposFaltantes"]:
        print("camposFaltantes:", ", ".join(receta["camposFaltantes"]))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
