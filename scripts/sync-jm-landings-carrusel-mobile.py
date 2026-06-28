#!/usr/bin/env python3
"""Sincroniza carrusel mobile con los PNG de referencia-landings-mobile/."""

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CARPETA = ROOT / "index/clientes/joyasmercury/interfaces/referencia-landings-mobile"
MANIFEST = CARPETA / "carrusel.manifest.js"
JSON_FILE = CARPETA / "carrusel.json"
CARPETA_REL = "interfaces/referencia-landings-mobile"

TITULOS = (
    ("inicio", "Inicio"),
    ("esencial", "Esencial"),
    ("gold", "Gold"),
    ("deluxe", "Deluxe"),
    ("carrito", "Carrito"),
    ("ayuda", "Ayuda"),
    ("producto", "Productos"),
)


def titulo_de(archivo: str) -> str:
    lower = archivo.lower()
    for clave, titulo in TITULOS:
        if clave in lower:
            return titulo
    base = Path(archivo).stem
    base = re.sub(r"^\d+[-_]", "", base)
    base = re.sub(r"-mobile$", "", base, flags=re.I)
    base = re.sub(r"-referencia$", "", base, flags=re.I)
    return base.replace("-", " ").replace("_", " ").strip().title() or archivo


def main():
    CARPETA.mkdir(parents=True, exist_ok=True)
    pngs = sorted(CARPETA.glob("*.png"))
    if not pngs:
        raise SystemExit(
            f"No hay PNG en {CARPETA}\n"
            "Genera capturas: python3 scripts/capturar-jm-referencia-landings-mobile.py"
        )

    items = []
    json_items = []
    for p in pngs:
        titulo = titulo_de(p.name)
        items.append(
            f"  {{ carpeta: '{CARPETA_REL}', "
            f"archivo: '{p.name}', titulo: '{titulo}' }}"
        )
        json_items.append({
            "carpeta": CARPETA_REL,
            "archivo": p.name,
            "titulo": titulo,
        })

    version = 1
    if MANIFEST.exists():
        m = re.search(r"JM_LANDINGS_CARRUSEL_MOBILE_VERSION\s*=\s*(\d+)", MANIFEST.read_text())
        if m:
            version = int(m.group(1)) + 1

    items_str = ",\n".join(items)
    body = f"""/**
 * Carrusel Landings referencia · MÓVIL
 * Regenerar: python3 scripts/sync-jm-landings-carrusel-mobile.py
 */
window.JM_LANDINGS_CARRUSEL_MOBILE = [
{items_str}
];

window.JM_LANDINGS_CARRUSEL_MOBILE_VERSION = {version};
"""
    MANIFEST.write_text(body, encoding="utf-8")
    JSON_FILE.write_text(
        json.dumps({"version": version, "items": json_items}, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )
    print(f"Actualizado {MANIFEST.relative_to(ROOT)} · {len(pngs)} PNG · versión {version}")
    for p in pngs:
        print(f"  · {p.name}")


if __name__ == "__main__":
    main()
