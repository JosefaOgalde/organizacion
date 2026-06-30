#!/usr/bin/env python3
"""Casco Sakura v3 — UNA sola pieza continua, tal cual imagen referencia.
   Sin nuca extra, sin ventilación, sin módulos añadidos.
   Solo: cúpula+solapas (hull único) + recortes (arco, 2 lágrimas, 2 ranuras collar).
"""
import numpy as np
import trimesh

DIR = "/workspace/index/clientes/Sakura/prototipo-casco/cad/fase-2/modular"
OUT = f"{DIR}/casco_sakura_imagen_v3.stl"
OUT_CURA = "/workspace/sakura-casco-cura.stl"
WALL = 2.5


def ellipsoid(rx, ry, rz, subdiv=5):
    m = trimesh.creation.icosphere(subdivisions=subdiv)
    m.apply_scale([rx, ry, rz])
    return m


def cuerpo_solido(s=1.0):
    """Un solo volumen: cúpula + solapas fusionadas (hull por unión suave)."""
    dome = ellipsoid(64 * s, 54 * s, 34 * s)
    dome.apply_translation([0, 0, 8 * s])
    parts = [dome]
    for ys in (-1, 1):
        flap = ellipsoid(26 * s, 24 * s, 30 * s)
        flap.apply_translation([2 * s, ys * 44 * s, -26 * s])
        parts.append(flap)
    return trimesh.boolean.union(parts, engine="manifold")


def cascara():
    outer = cuerpo_solido(1.0)
    k = (64 - WALL) / 64
    inner = cuerpo_solido(k)
    return trimesh.boolean.difference([outer, inner], engine="manifold")


def arco_facial():
    s = trimesh.creation.icosphere(subdivisions=4, radius=44)
    s.apply_scale([1.1, 1.2, 0.8])
    s.apply_translation([48, 0, 0])
    b = trimesh.creation.box(extents=[42, 96, 52])
    b.apply_translation([44, 0, -16])
    return [s, b]


def lagrima_frente(y_sign):
    """Dos óvalos lágrima en parte superior frontal (como imagen)."""
    t = trimesh.creation.cylinder(radius=14, height=46, sections=48)
    t.apply_scale([1.0, 0.68, 1.3])
    t.apply_transform(trimesh.transformations.rotation_matrix(np.radians(y_sign * 16), [0, 0, 1]))
    t.apply_transform(trimesh.transformations.rotation_matrix(np.radians(58), [1, 0, 0]))
    t.apply_translation([18, y_sign * 22, 22])
    return t


def ranura_collar(y_sign):
    t = trimesh.creation.capsule(radius=3.0, height=20, count=[20, 20])
    t.apply_transform(trimesh.transformations.rotation_matrix(np.pi / 2, [1, 0, 0]))
    t.apply_translation([0, y_sign * 44, -34])
    return t


def main():
    body = cascara()

    for cut in arco_facial():
        body = trimesh.boolean.difference([body, cut], engine="manifold")

    # base abierta (cuello)
    neck = trimesh.creation.box(extents=[100, 86, 36])
    neck.apply_translation([-6, 0, -48])
    body = trimesh.boolean.difference([body, neck], engine="manifold")

    for ys in (-1, 1):
        body = trimesh.boolean.difference([body, lagrima_frente(ys)], engine="manifold")
        body = trimesh.boolean.difference([body, ranura_collar(ys)], engine="manifold")

    body.merge_vertices()
    body.export(OUT)
    body.export(OUT_CURA)
    body.export(f"/workspace/index/clientes/Sakura/prototipo-casco/sakura-casco-cura.stl")

    print(f"exported: {OUT}")
    print(f"watertight: {body.is_watertight}")
    print(f"size mm: {(body.bounds[1]-body.bounds[0]).round(1)}")


if __name__ == "__main__":
    main()
