#!/usr/bin/env python3
"""
Reduce un STL para Tinkercad.

Límites reales de Tinkercad:
  - tamaño de archivo ≤ 25 MB
  - malla ≤ 300.000 triángulos

Por defecto apunta a ~20 MB y ≤ 280.000 caras (margen de seguridad).

Uso:
  python scripts/reducir-stl-tinkercad.py "ruta/al/casco.stl"
  python scripts/reducir-stl-tinkercad.py "ruta/al/casco.stl" --max-mb 20 --max-faces 280000

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


def simplify_to_faces(mesh: trimesh.Trimesh, target_faces: int) -> trimesh.Trimesh:
    target = max(500, int(target_faces))
    n = len(mesh.faces)
    if target >= n:
        return mesh
    ratio = target / n
    try:
        return mesh.simplify_quadric_decimation(face_count=target)
    except TypeError:
        try:
            return mesh.simplify_quadric_decimation(percent=ratio)
        except TypeError:
            return mesh.simplify_quadric_decimation(ratio)
    except Exception as exc:
        print(f"  aviso simplify: {exc}")
        try:
            return mesh.simplify_quadric_decimation(percent=ratio)
        except Exception:
            raise


def meets_limits(path: Path, faces: int, max_mb: float, max_faces: int) -> bool:
    return faces <= max_faces and size_mb(path) <= max_mb


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Reduce STL para Tinkercad (<25 MB y <300k triángulos)"
    )
    parser.add_argument("stl", type=Path, help="Ruta al archivo .stl")
    parser.add_argument(
        "--max-mb",
        type=float,
        default=20.0,
        help="Peso máximo deseado en MB (default 20; Tinkercad admite 25)",
    )
    parser.add_argument(
        "--max-faces",
        type=int,
        default=280_000,
        help="Máximo de triángulos/caras (default 280000; Tinkercad admite 300000)",
    )
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
    print(
        f"Objetivo: ≤ {args.max_mb:.1f} MB y ≤ {args.max_faces:,} triángulos "
        f"(Tinkercad: 25 MB / 300.000)"
    )

    mesh = trimesh.load(src, force="mesh")
    if not isinstance(mesh, trimesh.Trimesh):
        mesh = mesh.dump(concatenate=True)

    original_faces = len(mesh.faces)
    print(f"Caras originales: {original_faces:,}")

    # Objetivos de caras: primero el tope, luego pasos más agresivos
    # por si el archivo sigue pesando mucho en MB.
    face_targets: list[int] = []
    if original_faces > args.max_faces:
        face_targets.append(args.max_faces)
    else:
        # Ya está bajo el tope de caras; igual exportamos y medimos MB.
        face_targets.append(original_faces)

    for factor in (0.75, 0.55, 0.40, 0.28, 0.18, 0.12, 0.08):
        t = max(500, int(args.max_faces * factor))
        if t < face_targets[-1]:
            face_targets.append(t)

    current = mesh
    last_faces = original_faces
    for target in face_targets:
        if target < last_faces:
            print(f"  simplificando a ~{target:,} caras…")
            current = simplify_to_faces(mesh, target)
        current.export(out)
        faces = len(current.faces)
        mb = size_mb(out)
        last_faces = faces
        ok_faces = "OK" if faces <= args.max_faces else "ALTO"
        ok_mb = "OK" if mb <= args.max_mb else "ALTO"
        print(f"  → {faces:,} caras ({ok_faces}) · {mb:.1f} MB ({ok_mb})")
        if meets_limits(out, faces, args.max_mb, args.max_faces):
            print(f"OK: {out}")
            print(
                f"   {faces:,} triángulos · {mb:.1f} MB — listo para Tinkercad"
            )
            return 0

    print(
        f"Quedó en {last_faces:,} caras / {size_mb(out):.1f} MB. "
        "Probá --max-faces 200000 --max-mb 18 o Meshmixer."
    )
    return 2


if __name__ == "__main__":
    raise SystemExit(main())
