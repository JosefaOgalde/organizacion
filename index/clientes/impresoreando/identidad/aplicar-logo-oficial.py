#!/usr/bin/env python3
"""Copia identidad/entregado/logo-oficial.* → logo-impresoreando.png (bytes tal cual si es PNG)."""
from __future__ import annotations

import shutil
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
SRC_DIR = ROOT / "entregado"
DEST = ROOT / "logo-impresoreando.png"
CLARO = ROOT / "logo-impresoreando-claro.png"


def find_src() -> Path | None:
    for name in ("logo-oficial.png", "logo-oficial.jpg", "logo-oficial.jpeg", "logo-oficial.webp"):
        p = SRC_DIR / name
        if p.is_file() and p.stat().st_size > 1000:
            return p
    return None


def main() -> int:
    SRC_DIR.mkdir(parents=True, exist_ok=True)
    src = find_src()
    if not src:
        print("Falta entregado/logo-oficial.png (o .jpg)")
        return 1

    # Backup del anterior
    if DEST.exists():
        shutil.copy2(DEST, ROOT / "logo-impresoreando-anterior.png")

    if src.suffix.lower() == ".png":
        shutil.copy2(src, DEST)  # tal cual
    else:
        from PIL import Image

        im = Image.open(src)
        if im.mode in ("RGBA", "P"):
            # conservar alpha si existe
            if im.mode != "RGBA":
                im = im.convert("RGBA")
            im.save(DEST, "PNG", optimize=True)
        else:
            im.convert("RGB").save(DEST, "PNG", optimize=True)

    shutil.copy2(DEST, CLARO)
    print(f"OK: {src.name} → {DEST.name} ({DEST.stat().st_size} bytes)")
    print("Bump cache: abrí el panel con Ctrl+F5")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
