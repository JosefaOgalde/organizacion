#!/usr/bin/env python3
"""
Reduce el peso de un STL para poder importarlo en Tinkercad (límite 25 MB).

Uso:
  python scripts/reducir-stl-tinkercad.py "ruta/al/casco.stl"
  python scripts/reducir-stl-tinkercad.py "ruta/al/casco.stl" --max-mb 20

Salida: mismo nombre con sufijo -tinkercad.stl
"""
from __future__ import annotations

import argparse
import sys
from pathlib import Path

try:
    import trimesh
except ImportError:
    print("Falta trimesh. Instalá con: pip install trimesh numpy fast-simplification")
    sys.exit(1)


def size_mb(path: Path) -> float:
    return path.stat().st_size / (1024 * 1024)


def reduce_mesh(mesh: trimesh.Trimesh, face_ratio: float) -> trimesh.Trimesh:
    target = max(500, int(len(mesh.faces) * face_ratio))
    if target >= len(mesh.faces):
        return mesh
    try:
        simplified = mesh.simplify_quadric_decimation(face_count=target)
    except Exception:
        # Fallback: algunas versiones usan ratio
        simplified = mesh.simplify_quadric_decimation(percent=face_ratio)
    return simplified


def main() -> int:
    parser = argparse.ArgumentParser(description="Reduce STL para Tinkercad (<25 MB)")
    parser.add_argument("stl", type=Path, help="Ruta al archivo .stl")
    parser.add_argument("--max-mb", type=float, default=20.0, help="Peso máximo deseado (MB)")
    parser.add_argument(
        "-o",
        "--output",
        type=Path,
        default=None,
        help="Ruta de salida (default: nombre-tinkercad.stl)",
    )
    args = parser.parse_args()

    src = args.stl.expanduser().resolve()
    if not src.exists():
        print(f"No existe: {src}")
        return 1
    if src.suffix.lower() != ".stl":
        print("El archivo debe ser .stl")
        return 1

    out = args.output
    if out is None:
        out = src.with_name(src.stem + "-tinkercad.stl")
    else:
        out = out.expanduser().resolve()

    print(f"Entrada: {src} ({size_mb(src):.1f} MB)")
    mesh = trimesh.load(src, force="mesh")
    if not isinstance(mesh, trimesh.Trimesh):
        mesh = mesh.dump(concatenate=True)

    print(f"Caras originales: {len(mesh.faces):,}")

    # Intentos progresivos hasta quedar bajo el límite
    ratios = [0.35, 0.2, 0.12, 0.08, 0.05, 0.03]
    current = mesh
    for ratio in ratios:
        current = reduce_mesh(mesh, ratio)
        # Exportar temporal para medir peso real en binario
        current.export(out)
        mb = size_mb(out)
        print(f"  ratio={ratio:.2f} → {len(current.faces):,} caras → {mb:.1f} MB")
        if mb <= args.max_mb:
            print(f"OK: {out} ({mb:.1f} MB) — listo para Tinkercad")
            return 0

    print(
        f"Quedó en {size_mb(out):.1f} MB (sigue alto). "
        "Probá de nuevo con --max-mb 18 o simplificá más en Meshmixer."
    )
    return 2


if __name__ == "__main__":
    raise SystemExit(main())
