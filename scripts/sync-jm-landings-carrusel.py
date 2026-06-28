#!/usr/bin/env python3
"""Sincroniza carrusel.manifest.js con los PNG de referencia-landings/."""

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CARPETA = ROOT / "index/clientes/JoyasMercury/interfaces/referencia-landings"
MANIFEST = CARPETA / "carrusel.manifest.js"

TITULOS = (
    ("inicio", "Inicio"),
    ("esencial", "Esencial"),
    ("gold", "Gold"),
    ("deluxe", "Deluxe"),
)


def titulo_de(archivo: str) -> str:
    lower = archivo.lower()
    for clave, titulo in TITULOS:
        if clave in lower:
            return titulo
    base = Path(archivo).stem
    base = re.sub(r"^\d+[-_]", "", base)
    return base.replace("-", " ").replace("_", " ").strip().title() or archivo


def main():
    pngs = sorted(CARPETA.glob("*.png"))
    if not pngs:
        raise SystemExit(f"No hay PNG en {CARPETA}")

    items = []
    for p in pngs:
        items.append(
            f"  {{ carpeta: 'interfaces/referencia-landings', "
            f"archivo: '{p.name}', titulo: '{titulo_de(p.name)}' }}"
        )

    version = 1
    if MANIFEST.exists():
        m = re.search(r"JM_LANDINGS_CARRUSEL_VERSION\s*=\s*(\d+)", MANIFEST.read_text())
        if m:
            version = int(m.group(1)) + 1

    body = f"""/**
 * Carrusel Landings referencia · editar al agregar/reemplazar PNGs en esta carpeta.
 * Regenerar con: python3 scripts/sync-jm-landings-carrusel.py
 */
window.JM_LANDINGS_CARRUSEL = [
{",\\n".join(items)}
];

/** Súbelo al reemplazar PNGs para forzar recarga en el navegador */
window.JM_LANDINGS_CARRUSEL_VERSION = {version};
"""
    MANIFEST.write_text(body, encoding="utf-8")
    print(f"Actualizado {MANIFEST.relative_to(ROOT)} · {len(pngs)} PNG · versión {version}")
    for p in pngs:
        print(f"  · {p.name}")


if __name__ == "__main__":
    main()
