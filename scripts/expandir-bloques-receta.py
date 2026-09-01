#!/usr/bin/env python3
"""
Convierte JSON de 5 bloques BM → receta completa CRC (out/<id>.json).

Los 5 bloques coinciden con el lienzo del Gestor Jumbo:
  1. cabecera · 2. tags · 3. ingredientes · 4. instrucciones · 5. seo

Uso:
  python3 scripts/expandir-bloques-receta.py bloques/mi-receta.json
  python3 scripts/expandir-bloques-receta.py bloques/mi-receta.json --stdout
"""
from __future__ import annotations

import argparse
import json
import re
import sys
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def _crc_rutas():
    import importlib.util

    path = Path(__file__).resolve().parent / "crc_rutas.py"
    spec = importlib.util.spec_from_file_location("crc_rutas_exp", path)
    modulo = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(modulo)
    return modulo


_RUTAS = _crc_rutas()
CRC = _RUTAS.resolver_crc(ROOT)
OUT_DIR = CRC / "out"
BLOQUES_DIR = CRC / "bloques"

DIFICULTADES = {"muy facil", "facil", "media", "dificil", "absurdamente dificil"}


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


def es_formato_bloques(doc: dict) -> bool:
    bloques = doc.get("bloques")
    if not isinstance(bloques, dict):
        return False
    return any(k in bloques for k in ("cabecera", "tags", "ingredientes", "instrucciones", "seo"))


def _lista_tags(tags_bloque) -> list[str]:
    if isinstance(tags_bloque, list):
        return [str(t).strip() for t in tags_bloque if str(t).strip()]
    if isinstance(tags_bloque, dict):
        raw = tags_bloque.get("etiquetas") or tags_bloque.get("tags") or tags_bloque.get("categorias") or []
        if isinstance(raw, str):
            return [p.strip() for p in re.split(r"[,;/|]", raw) if p.strip()]
        return [str(t).strip() for t in raw if str(t).strip()]
    if isinstance(tags_bloque, str):
        return [p.strip() for p in re.split(r"[,;/|]", tags_bloque) if p.strip()]
    return []


def _lista_ingredientes(ing_bloque) -> list[dict]:
    if isinstance(ing_bloque, list):
        items = ing_bloque
    elif isinstance(ing_bloque, dict):
        items = ing_bloque.get("items") or ing_bloque.get("ingredientes") or []
    else:
        items = []
    out: list[dict] = []
    for item in items:
        if isinstance(item, str):
            nombre = item.strip()
            if nombre:
                out.append({"nombre": nombre, "cantidad": None, "unidad": None, "skuCencosud": None, "notas": None})
        elif isinstance(item, dict):
            nombre = (item.get("nombre") or item.get("linea") or "").strip()
            if nombre:
                out.append(
                    {
                        "nombre": nombre,
                        "cantidad": item.get("cantidad"),
                        "unidad": item.get("unidad"),
                        "skuCencosud": item.get("skuCencosud"),
                        "notas": item.get("notas"),
                    }
                )
    return out


def _lista_pasos(inst_bloque) -> tuple[list[dict], str]:
    pregunta = ""
    raw_pasos: list = []
    if isinstance(inst_bloque, dict):
        pregunta = (inst_bloque.get("pregunta") or inst_bloque.get("preguntaPreparacion") or "").strip()
        raw_pasos = inst_bloque.get("pasos") or inst_bloque.get("items") or []
    elif isinstance(inst_bloque, list):
        raw_pasos = inst_bloque
    pasos: list[dict] = []
    for i, item in enumerate(raw_pasos, 1):
        if isinstance(item, str):
            texto = item.strip()
            if texto:
                pasos.append({"orden": i, "texto": texto})
        elif isinstance(item, dict):
            texto = (item.get("texto") or item.get("descripcion") or "").strip()
            if texto:
                orden = item.get("orden") or i
                pasos.append({"orden": int(orden), "texto": texto})
    return pasos, pregunta


def _lista_consejos(seo_bloque: dict) -> tuple[str, list[str]]:
    titulo = (seo_bloque.get("consejosTitulo") or seo_bloque.get("tipsTitulo") or seo_bloque.get("htmlTitulo") or "").strip()
    raw = seo_bloque.get("consejos") or seo_bloque.get("tips") or []
    consejos = [str(c).strip() for c in raw if str(c).strip()]
    return titulo, consejos


def expandir_bloques(doc: dict, *, fuente: str = "") -> dict:
    if not es_formato_bloques(doc):
        raise ValueError("El JSON no tiene la clave bloques con cabecera/tags/ingredientes/instrucciones/seo")

    bloques = doc["bloques"]
    cab = bloques.get("cabecera") or {}
    seo_b = bloques.get("seo") or {}

    titulo = (cab.get("titulo") or doc.get("titulo") or "").strip()
    descripcion = (cab.get("descripcion") or "").strip()
    porciones = cab.get("porciones")
    tiempo_total = (cab.get("tiempoTotal") or cab.get("tiempo") or "").strip() or None
    dificultad = (cab.get("dificultad") or "").strip().lower() or None
    if dificultad and dificultad not in DIFICULTADES:
        dificultad = re.sub(r"\s+", " ", dificultad.replace("á", "a").replace("é", "e").replace("í", "i").replace("ó", "o").replace("ú", "u"))
    alt = (cab.get("textoAlt") or cab.get("alt") or cab.get("altImagen") or "").strip()
    foto_url = (cab.get("fotoUrl") or cab.get("urlFoto") or "").strip()

    categorias = _lista_tags(bloques.get("tags"))
    ingredientes = _lista_ingredientes(bloques.get("ingredientes"))
    pasos, pregunta = _lista_pasos(bloques.get("instrucciones"))
    tips_titulo, tips = _lista_consejos(seo_b)

    meta_titulo = (seo_b.get("metaTitulo") or titulo or "").strip()
    meta_desc = (seo_b.get("metaDescripcion") or descripcion or "").strip()

    sid = (doc.get("id") or slugify(titulo)).strip() or slugify(titulo)
    if not pregunta and titulo:
        plato = titulo[0].lower() + titulo[1:] if len(titulo) > 1 else titulo.lower()
        pregunta = f"¿Cómo preparar {plato}?"

    faltantes: list[str] = []
    if not titulo:
        faltantes.append("titulo")
    if not descripcion:
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

    imagenes = []
    if alt or foto_url:
        imagenes.append(
            {
                "rutaLocal": "",
                "urlFuente": foto_url,
                "alt": alt,
                "rol": "portada",
                "nota": "Subir en bloque Cabecera si no hay rutaLocal",
            }
        )

    return {
        "id": sid,
        "fuenteWord": fuente or doc.get("fuenteWord") or f"bloques/{sid}.json",
        "formatoOrigen": "bloques-json",
        "titulo": titulo,
        "descripcion": descripcion,
        "porciones": porciones,
        "tiempoPreparacion": cab.get("tiempoPreparacion"),
        "tiempoCoccion": cab.get("tiempoCoccion"),
        "tiempoTotal": tiempo_total,
        "dificultad": dificultad,
        "categorias": categorias,
        "ocasiones": [],
        "ingredientes": ingredientes,
        "pasos": pasos,
        "preguntaPreparacion": pregunta,
        "tips": tips,
        "tipsTitulo": tips_titulo,
        "imagenes": imagenes,
        "seo": {
            "metaTitulo": meta_titulo,
            "metaDescripcion": meta_desc,
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
        "bloques": bloques,
    }


def main() -> int:
    ap = argparse.ArgumentParser(description="Expande JSON de 5 bloques BM → receta CRC completa")
    ap.add_argument("archivo", type=Path, help="JSON en bloques/ o ruta libre")
    ap.add_argument("--stdout", action="store_true", help="Imprime JSON en stdout en vez de escribir out/")
    ap.add_argument("--force", action="store_true", help="Sobrescribe out/<id>.json si existe")
    args = ap.parse_args()

    src = args.archivo.expanduser().resolve()
    if not src.exists():
        print(f"No existe: {src}", file=sys.stderr)
        return 1

    doc = json.loads(src.read_text(encoding="utf-8"))
    try:
        rel = str(src.relative_to(ROOT))
    except ValueError:
        rel = str(src)

    try:
        receta = expandir_bloques(doc, fuente=rel)
    except ValueError as e:
        print(str(e), file=sys.stderr)
        return 2

    payload = json.dumps(receta, ensure_ascii=False, indent=2) + "\n"
    if args.stdout:
        sys.stdout.write(payload)
        return 0

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    out = OUT_DIR / f"{receta['id']}.json"
    if out.exists() and not args.force:
        print(f"Ya existe {out.name}. Usa --force para reemplazar.", file=sys.stderr)
        return 3

    out.write_text(payload, encoding="utf-8")
    print(f"OK → {out.relative_to(ROOT)}")
    print(f"titulo: {receta.get('titulo')}")
    print(f"estado: {receta['estado']}")
    if receta["camposFaltantes"]:
        print("camposFaltantes:", ", ".join(receta["camposFaltantes"]))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
