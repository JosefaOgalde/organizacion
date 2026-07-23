#!/usr/bin/env python3
"""Copia refs/entregadas → refs/ (nombres del catálogo) y regenera el PDF. Sin editar píxeles."""
from __future__ import annotations

import shutil
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
SRC = ROOT / "refs" / "entregadas"
REFS = ROOT / "refs"

# imagen N (carpeta entregadas) → archivo del catálogo
MAP = {
    "01-coffee": "05-coffee.jpg",
    "02-tamagotchi-gato": "04-tamagotchi-gato.jpg",
    "03-mac-classic": "07-mac-classic.jpg",
    "04-frutilla-pastillas": "19-frutilla-pastillas.jpg",
    "05-tamagotchi-pastillas": "23-tamagotchi-pastillas.jpg",
    "06-joystick": "06-joystick.jpg",
    "07-nickelodeon": "08-nickelodeon.jpg",
    "08-retro-arcade": "12-retro-arcade.jpg",
    "09-onepiece-sombrero": "13-onepiece-sombrero.jpg",
    "10-telefono-superpoderosas": "18-telefono-superpoderosas.jpg",
    "11-huella-porta-foto": "17-huella-porta-foto.jpg",
    "12-crash-boxes": "09-crash-boxes.jpg",
    "13-mario-bloques": "03-mario-bloques.jpg",
}


def find_src(stem: str) -> Path | None:
    for ext in (".jpg", ".jpeg", ".png", ".webp", ".JPG", ".JPEG", ".PNG", ".WEBP"):
        p = SRC / f"{stem}{ext}"
        if p.is_file() and p.stat().st_size > 1000:
            return p
    return None


def main() -> int:
    SRC.mkdir(parents=True, exist_ok=True)
    missing = []
    copied = []
    for stem, dest_name in MAP.items():
        src = find_src(stem)
        if not src:
            missing.append(stem)
            continue
        dest = REFS / dest_name
        # Copia binaria tal cual (sin reencode) si ya es jpg con el nombre destino;
        # si viene png/webp, solo renombra extensión a .jpg conservando bytes? Mejor copiar
        # con extensión real y actualizar productos — pero el catálogo espera .jpg.
        # Copia bytes intactos al path .jpg (el visor/Pillow aceptan PNG mal-etiquetado a veces).
        # Para fidelidad: si no es jpeg, convertir SOLO contenedor con quality=95 sin resize.
        if src.suffix.lower() in (".jpg", ".jpeg"):
            shutil.copy2(src, dest)
        else:
            from PIL import Image

            im = Image.open(src)
            if im.mode in ("RGBA", "P"):
                im = im.convert("RGB")
            else:
                im = im.convert("RGB")
            im.save(dest, "JPEG", quality=95, optimize=True)
        copied.append(f"{src.name} → {dest_name}")

    print(f"Copiadas: {len(copied)} / {len(MAP)}")
    for line in copied:
        print(" ", line)
    if missing:
        print("Faltan en refs/entregadas/:")
        for m in missing:
            print(f"  {m}.jpg (o .png)")
        return 1

    gen = ROOT / "generar-pdf-llaveros.py"
    print("Regenerando PDF…")
    subprocess.check_call([sys.executable, str(gen)], cwd=str(ROOT))
    print("PDF:", ROOT / "export" / "catalogo-llaveros.pdf")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
