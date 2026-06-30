#!/usr/bin/env python3
"""Genera casco Sakura minimalista — referencia imagen usuario.
   Ejes: +X hocico | -X nuca | +Z arriba | Y lateral
"""
import numpy as np
import trimesh

OUT = "/workspace/index/clientes/Sakura/prototipo-casco/cad/fase-2/modular/casco_sakura_referencia.stl"

# Medidas gatita (mm)
A, B, C = 60, 50, 30          # semiejes cráneo
HOLGURA, PARED = 3, 2
EAR_SEP = 30
EAR_SLOT_W, EAR_SLOT_H = 32, 48  # ovalos oreja (visual ref)


def ellipsoid(rx, ry, rz, subdiv=4):
    m = trimesh.creation.icosphere(subdivisions=subdiv)
    m.apply_scale([rx, ry, rz])
    return m


def pill(rx, ry, rz, t=None):
    m = trimesh.creation.capsule(radius=rx, height=ry * 2, count=[16, 16])
    m.apply_scale([1, rz / (ry * 2), 1])
    if t is not None:
        m.apply_transform(t)
    return m


def main():
    # --- cáscara base (elipsoide hueco) ---
    outer = ellipsoid(A + HOLGURA + PARED, B + HOLGURA + PARED, C + HOLGURA + PARED)
    inner = ellipsoid(A + HOLGURA, B + HOLGURA, C + HOLGURA)
    shell = trimesh.boolean.difference([outer, inner], engine="manifold")

    # --- solapas laterales (mejilla/mandíbula) ---
    for ys in (-1, 1):
        flap = trimesh.creation.box(extents=[85, 22, 50])
        flap.apply_translation([5, ys * 48, -12])
        shell = trimesh.boolean.union([shell, flap], engine="manifold")

    # --- extensión nuca posterior ---
    nape = trimesh.creation.box(extents=[35, 75, 45])
    nape.apply_translation([-52, 0, 8])
    shell = trimesh.boolean.union([shell, nape], engine="manifold")

    # --- apertura facial amplia (arco frontal) ---
    face_main = trimesh.creation.box(extents=[55, 95, 55])
    face_main.apply_translation([48, 0, -8])
    face_top = trimesh.creation.box(extents=[40, 80, 30])
    face_top.apply_translation([38, 0, 22])
    shell = trimesh.boolean.difference([shell, face_main, face_top], engine="manifold")

    # --- abertura inferior (cuello) ---
    neck = trimesh.creation.box(extents=[110, 85, 35])
    neck.apply_translation([-5, 0, -48])
    shell = trimesh.boolean.difference([shell, neck], engine="manifold")

    # --- ranuras oreja (óvalos superiores laterales) ---
    for ys in (-1, 1):
        ear = trimesh.creation.cylinder(radius=EAR_SLOT_W / 2, height=EAR_SLOT_H, sections=48)
        ear.apply_scale([1, 1.15, 1])
        R = trimesh.transformations.rotation_matrix(np.pi / 2, [1, 0, 0])
        ear.apply_transform(R)
        ear.apply_translation([2, ys * (EAR_SEP / 2 + 18), 28])
        shell = trimesh.boolean.difference([shell, ear], engine="manifold")

    # --- ranuras collar (pastilla vertical en solapas) ---
    for ys in (-1, 1):
        slot = pill(3.5, 14, 3.5)
        R = trimesh.transformations.rotation_matrix(np.pi / 2, [1, 0, 0])
        slot.apply_transform(R)
        slot.apply_translation([-8, ys * 46, -32])
        shell = trimesh.boolean.difference([shell, slot], engine="manifold")

    # --- ventilación dorsal ---
    for x in (-15, -28, -40):
        for y in (-22, 0, 22):
            v = trimesh.creation.cylinder(radius=2.5, height=20, sections=16)
            R = trimesh.transformations.rotation_matrix(np.pi / 2, [1, 0, 0])
            v.apply_transform(R)
            v.apply_translation([x, y, 38])
            shell = trimesh.boolean.difference([shell, v], engine="manifold")

    shell.merge_vertices()
    shell.fix_normals()

    print(f"watertight: {shell.is_watertight}")
    print(f"bounds: {shell.bounds}")
    print(f"size mm: {(shell.bounds[1] - shell.bounds[0]).round(1)}")
    if shell.is_watertight:
        vol = abs(shell.volume)
        print(f"volume mm3: {vol:.0f}  mass PETG g: {vol * 1.24 / 1000:.1f}")

    shell.export(OUT)
    print(f"exported: {OUT}")


if __name__ == "__main__":
    main()
