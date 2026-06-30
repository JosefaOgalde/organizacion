#!/usr/bin/env python3
"""Casco Sakura — réplica STL según imagen referencia (v2).
   Cúpula lisa · solapas aviador · arco frontal · óvalos lágrima · ranuras collar.
   Ejes: +X hocico | -X nuca | +Z arriba | Y lateral
"""
import numpy as np
import trimesh
from pymeshfix import MeshFix

DIR = "/workspace/index/clientes/Sakura/prototipo-casco/cad/fase-2/modular"
OUT_RAW = f"{DIR}/casco_sakura_imagen_v2.stl"
OUT_CURA = f"{DIR}/casco_sakura_imagen_v2_cura.stl"
OUT_ROOT = "/workspace/sakura-casco-cura.stl"

WALL = 2.5  # espesor uniforme mm


def ellipsoid(rx, ry, rz, subdiv=5):
    m = trimesh.creation.icosphere(subdivisions=subdiv)
    m.apply_scale([rx, ry, rz])
    return m


def shell_ellipsoid(rx, ry, rz):
    outer = ellipsoid(rx, ry, rz)
    inner = ellipsoid(max(rx - WALL, 1), max(ry - WALL, 1), max(rz - WALL, 1))
    return trimesh.boolean.difference([outer, inner], engine="manifold")


def rot(axis, angle):
    return trimesh.transformations.rotation_matrix(angle, axis)


def flap_piece(y_sign):
    """Solapa lateral estilo aviador con borde inferior redondeado."""
    outer = trimesh.creation.box(extents=[72, 26, 52])
    outer.apply_translation([0, y_sign * 52, -18])
    bot = trimesh.creation.icosphere(subdivisions=4, radius=14)
    bot.apply_translation([0, y_sign * 52, -42])
    solid = trimesh.boolean.union([outer, bot], engine="manifold")
    inner = trimesh.creation.box(extents=[72 - 2 * WALL, 26 - 2 * WALL, 48])
    inner.apply_translation([0, y_sign * 52, -16])
    return trimesh.boolean.difference([solid, inner], engine="manifold")


def teardrop_hole(y_sign):
    """Óvalo/lágrima en cúpula — inclinado hacia el centro arriba."""
    t = trimesh.creation.cylinder(radius=15, height=50, sections=48)
    t.apply_scale([1.0, 0.72, 1.35])
    t.apply_transform(rot([0, 0, 1], np.radians(y_sign * 14)))
    t.apply_transform(rot([1, 0, 0], np.radians(72)))
    t.apply_translation([6, y_sign * 24, 26])
    return t


def pill_slot(y_sign):
    """Ranura collar pastilla vertical en solapa."""
    p = trimesh.creation.capsule(radius=3.2, height=22, count=[20, 20])
    p.apply_transform(rot([1, 0, 0], np.pi / 2))
    p.apply_translation([-6, y_sign * 50, -36])
    return p


def main():
    # --- cúpula dorsal (elipsoide achatado) ---
    body = shell_ellipsoid(66, 56, 36)

    # --- unir solapas laterales ---
    for ys in (-1, 1):
        body = trimesh.boolean.union([body, flap_piece(ys)], engine="manifold")

    # --- extensión nuca suave ---
    nape_o = trimesh.creation.box(extents=[38, 78, 40])
    nape_o.apply_translation([-54, 0, 6])
    nape_i = trimesh.creation.box(extents=[38 - 2 * WALL, 78 - 2 * WALL, 36])
    nape_i.apply_translation([-54, 0, 8])
    nape = trimesh.boolean.difference([nape_o, nape_i], engine="manifold")
    body = trimesh.boolean.union([body, nape], engine="manifold")

    # --- apertura facial arqueada (gran arco frontal) ---
    arch = trimesh.creation.icosphere(subdivisions=4, radius=46)
    arch.apply_scale([1.15, 1.25, 0.85])
    arch.apply_translation([52, 0, 2])
    face_box = trimesh.creation.box(extents=[50, 98, 58])
    face_box.apply_translation([46, 0, -14])
    body = trimesh.boolean.difference([body, arch, face_box], engine="manifold")

    # --- apertura cuello inferior ---
    neck = trimesh.creation.box(extents=[112, 88, 38])
    neck.apply_translation([-8, 0, -50])
    body = trimesh.boolean.difference([body, neck], engine="manifold")

    # --- óvalos lágrima superiores (orejas) ---
    for ys in (-1, 1):
        body = trimesh.boolean.difference([body, teardrop_hole(ys)], engine="manifold")

    # --- ranuras collar ---
    for ys in (-1, 1):
        body = trimesh.boolean.difference([body, pill_slot(ys)], engine="manifold")

    body.merge_vertices()
    body.export(OUT_RAW)
    print(f"raw: {OUT_RAW} watertight={body.is_watertight}")
    print(f"size mm: {(body.bounds[1]-body.bounds[0]).round(1)}")

    # reparar para Cura
    mf = MeshFix(body.vertices, body.faces)
    mf.repair()
    fixed = trimesh.Trimesh(vertices=mf.points, faces=mf.faces)
    fixed.export(OUT_CURA)
    fixed.export(OUT_ROOT)
    also = f"{DIR}/../../sakura-casco-cura.stl"
    fixed.export("/workspace/index/clientes/Sakura/prototipo-casco/sakura-casco-cura.stl")
    print(f"cura: {OUT_CURA} watertight={fixed.is_watertight}")
    if fixed.is_watertight:
        print(f"mass PETG est. g: {abs(fixed.volume)*1.24/1000:.1f}")


if __name__ == "__main__":
    main()
