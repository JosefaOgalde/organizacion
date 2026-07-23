#!/usr/bin/env python3
"""Copia refs/entregadas → refs/ (nombres del catálogo) y regenera el PDF.

Preserva el archivo tal cual (misma extensión / mismos bytes). No recorta ni filtra.
"""
from __future__ import annotations

import json
import re
import shutil
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
SRC = ROOT / "refs" / "entregadas"
REFS = ROOT / "refs"

# imagen N (carpeta entregadas, sin extensión) → stem del catálogo
MAP = {
    "01-coffee": "05-coffee",
    "02-tamagotchi-gato": "04-tamagotchi-gato",
    "03-mac-classic": "07-mac-classic",
    "04-frutilla-pastillas": "19-frutilla-pastillas",
    "05-tamagotchi-pastillas": "23-tamagotchi-pastillas",
    "06-joystick": "06-joystick",
    "07-nickelodeon": "08-nickelodeon",
    "08-retro-arcade": "12-retro-arcade",
    "09-onepiece-sombrero": "13-onepiece-sombrero",
    "10-telefono-superpoderosas": "18-telefono-superpoderosas",
    "11-huella-porta-foto": "17-huella-porta-foto",
    "12-crash-boxes": "09-crash-boxes",
    "13-mario-bloques": "03-mario-bloques",
}


def find_src(stem: str) -> Path | None:
    for ext in (".jpg", ".jpeg", ".png", ".webp", ".JPG", ".JPEG", ".PNG", ".WEBP"):
        p = SRC / f"{stem}{ext}"
        if p.is_file() and p.stat().st_size > 1000:
            return p
    return None


def update_productos_js(stem_to_file: dict[str, str]) -> None:
    path = ROOT / "productos.js"
    text = path.read_text(encoding="utf-8")
    for stem, filename in stem_to_file.items():
        text = re.sub(
            rf"(ref:\s*'refs/){re.escape(stem)}\.(?:jpg|jpeg|png|webp)(')",
            rf"\g<1>{filename}\2",
            text,
            flags=re.I,
        )
    path.write_text(text, encoding="utf-8")


def update_generator(stem_to_file: dict[str, str]) -> None:
    path = ROOT / "generar-pdf-llaveros.py"
    text = path.read_text(encoding="utf-8")
    for stem, filename in stem_to_file.items():
        text = re.sub(
            rf'("file":\s*"){re.escape(stem)}\.(?:jpg|jpeg|png|webp)(")',
            rf"\g<1>{filename}\2",
            text,
            flags=re.I,
        )
    path.write_text(text, encoding="utf-8")


def main() -> int:
    SRC.mkdir(parents=True, exist_ok=True)
    missing = []
    copied = []
    stem_to_file: dict[str, str] = {}

    for src_stem, dest_stem in MAP.items():
        src = find_src(src_stem)
        if not src:
            missing.append(src_stem)
            continue
        ext = src.suffix.lower()
        if ext == ".jpeg":
            ext = ".jpg"
        dest_name = f"{dest_stem}{ext}"
        dest = REFS / dest_name
        # borrar otras extensiones viejas del mismo stem
        for old in REFS.glob(f"{dest_stem}.*"):
            if old.name != dest_name:
                old.unlink()
        shutil.copy2(src, dest)  # bytes tal cual
        stem_to_file[dest_stem] = dest_name
        copied.append(f"{src.name} → {dest_name}")

    print(f"Copiadas: {len(copied)} / {len(MAP)}")
    for line in copied:
        print(" ", line)
    if missing:
        print("Faltan en refs/entregadas/:")
        for m in missing:
            print(f"  {m}.jpg (o .png)")
        return 1

    update_productos_js(stem_to_file)
    update_generator(stem_to_file)
    print("productos.js + generar-pdf actualizados")

    gen = ROOT / "generar-pdf-llaveros.py"
    print("Regenerando PDF…")
    subprocess.check_call([sys.executable, str(gen)], cwd=str(ROOT))
    print("PDF:", ROOT / "export" / "catalogo-llaveros.pdf")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
