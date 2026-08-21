#!/usr/bin/env python3
"""
Lote de iconos mesh MKOF — misma receta que caras / mundo / lupa / brujula:
plexus verde neon sobre negro, bucle 16s armar/desarmar, 798x570.

Solo videos. No HTML.

  python3 scripts/render-mkof-iconos-banner.py --preview --icon diana-objetivo
  python3 scripts/render-mkof-iconos-banner.py --icons diana-objetivo,caballo-ajedrez
  python3 scripts/render-mkof-iconos-banner.py
"""
from __future__ import annotations

import argparse
import math
import os
import random
import subprocess
import sys

from PIL import Image, ImageDraw

W, H = 798, 570
FPS = 25
DURATION = 16.0
NFRAMES = int(FPS * DURATION)
CX, CY = W / 2.0, H / 2.0 - 6

LINE, LINE_FAR = (70, 200, 55), (28, 95, 26)
NODE, NODE_DIM, GLOW = (163, 255, 96), (55, 130, 42), (35, 85, 22)

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
OUT_DIR = os.path.join(ROOT, "index/clientes/mkof/sitio-web/assets/banner-verde")


class G:
    def __init__(self):
        self.pts: list[tuple[float, float]] = []
        self.kinds: list[str] = []

    def add(self, p, kind="rim"):
        self.pts.append((float(p[0]), float(p[1])))
        self.kinds.append(kind)

    def many(self, pts, kind="rim"):
        for p in pts:
            self.add(p, kind)


def along(a, b, u):
    return (a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u)


def densify_line(a, b, step):
    dist = math.hypot(b[0] - a[0], b[1] - a[1])
    steps = max(1, int(dist / step))
    return [along(a, b, k / steps) for k in range(steps)]


def densify_closed(poly, step):
    out = []
    n = len(poly)
    for i in range(n):
        out.extend(densify_line(poly[i], poly[(i + 1) % n], step))
    return out


def polar(cx, cy, ang, r):
    return (cx + math.cos(ang) * r, cy + math.sin(ang) * r)


def circle(g, cx, cy, r, n=40, kind="rim"):
    for i in range(n):
        g.add(polar(cx, cy, 2 * math.pi * i / n, r), kind)


def polyline(g, pts, step=8, kind="rim"):
    for i in range(len(pts) - 1):
        g.many(densify_line(pts[i], pts[i + 1], step), kind)


def poly(g, pts, step=8, kind="rim"):
    g.many(densify_closed(pts, step), kind)


def rect(g, x, y, w, h, step=8, kind="rim"):
    poly(g, [(x, y), (x + w, y), (x + w, y + h), (x, y + h)], step, kind)


def arrow(g, a, b, head=22, kind="needle"):
    polyline(g, [a, b], 8, kind)
    ang = math.atan2(b[1] - a[1], b[0] - a[0])
    for da in (2.55, -2.55):
        p = (b[0] + math.cos(ang + da) * head, b[1] + math.sin(ang + da) * head)
        polyline(g, [b, p], 7, kind)


def star5(g, cx, cy, r_out, r_in, kind="core"):
    pts = []
    for i in range(10):
        r = r_out if i % 2 == 0 else r_in
        pts.append(polar(cx, cy, -math.pi / 2 + i * math.pi / 5, r))
    poly(g, pts, 6, kind)


def person(g, x, y, s=1.0, kind="rim"):
    circle(g, x, y - 28 * s, 14 * s, 12, kind)
    poly(
        g,
        [
            (x - 22 * s, y + 38 * s),
            (x - 16 * s, y - 4 * s),
            (x + 16 * s, y - 4 * s),
            (x + 22 * s, y + 38 * s),
        ],
        7,
        kind,
    )


def floaters(g, n=8, r0=230, r1=280):
    for _ in range(n):
        a = random.uniform(-0.5, math.pi + 0.5)
        r = random.uniform(r0, r1)
        g.add((CX + math.cos(a) * r, CY + math.sin(a) * r * 0.78), "float")


def hub(g, x=None, y=None):
    g.add((CX if x is None else x, CY if y is None else y), "hub")


def dedup(pts, kinds, min_d):
    final, fk = [], []
    for p, k in zip(pts, kinds):
        md = min_d.get(k, 48)
        if k == "hub" or all((p[0] - q[0]) ** 2 + (p[1] - q[1]) ** 2 > md for q in final):
            final.append(p)
            fk.append(k)
    return final, fk


MIN_D = {
    "rim": 38,
    "tick": 28,
    "core": 26,
    "needle": 22,
    "pivot": 16,
    "hub": 0,
    "float": 55,
}


# ---------- siluetas ----------
def ico_diana():
    g = G()
    circle(g, CX, CY, 155, 48, "rim")
    circle(g, CX, CY, 95, 34, "tick")
    circle(g, CX, CY, 40, 18, "core")
    # flecha gruesa desde esquina, no aguja de brujula
    a, b = (CX + 175, CY - 175), (CX + 18, CY - 8)
    polyline(g, [a, b], 7, "needle")
    polyline(g, [(a[0] - 14, a[1] - 8), (b[0] - 8, b[1] - 6)], 7, "needle")
    polyline(g, [(a[0] + 8, a[1] + 14), (b[0] + 6, b[1] + 8)], 7, "needle")
    arrow(g, (CX + 70, CY - 70), b, 28, "needle")
    hub(g)
    floaters(g)
    return g


def ico_caballo():
    g = G()
    # perfil de caballo a la izquierda: oreja, hocico, pecho, peana
    box = [
        (0.56, 0.02),  # punta oreja
        (0.68, 0.14),
        (0.60, 0.20),  # frente
        (0.74, 0.26),
        (0.92, 0.36),  # hocico
        (0.94, 0.46),
        (0.80, 0.48),  # boca
        (0.70, 0.46),
        (0.62, 0.56),  # cuello
        (0.54, 0.70),
        (0.40, 0.82),  # pecho
        (0.16, 0.86),
        (0.14, 0.98),  # peana izq
        (0.88, 0.98),
        (0.88, 0.86),
        (0.72, 0.82),
        (0.64, 0.68),
        (0.58, 0.48),
        (0.50, 0.30),  # crin
        (0.46, 0.14),
        (0.50, 0.04),
    ]
    sx, sy = 300, 360
    ox, oy = CX - sx * 0.52, CY - sy * 0.50
    poly(g, [(ox + x * sx, oy + y * sy) for x, y in box], 6, "rim")
    g.add((ox + 0.70 * sx, oy + 0.34 * sy), "core")  # ojo
    hub(g, ox + 0.58 * sx, oy + 0.58 * sy)
    floaters(g)
    return g


def ico_ciclo360():
    g = G()
    circle(g, CX, CY, 28, 14, "pivot")
    r_in, r_out = 108, 148
    for i in range(3):
        a0 = -math.pi / 2 + i * 2 * math.pi / 3
        outer, inner = [], []
        for k in range(12):
            ang = a0 + 1.55 * k / 11
            outer.append(polar(CX, CY, ang, r_out))
            inner.append(polar(CX, CY, ang, r_in))
        polyline(g, outer, 7, "rim")
        polyline(g, inner, 7, "rim")
        # cabeza de flecha
        tip = polar(CX, CY, a0 + 1.55, (r_in + r_out) / 2)
        left = polar(CX, CY, a0 + 1.35, r_out + 18)
        right = polar(CX, CY, a0 + 1.35, r_in - 18)
        poly(g, [tip, left, right], 6, "needle")
    hub(g)
    floaters(g)
    return g


def ico_tendencias():
    g = G()
    polyline(g, [(CX - 170, CY + 130), (CX - 170, CY - 140), (CX - 170, CY + 130), (CX + 180, CY + 130)], 8, "tick")
    nodes = [
        (CX - 140, CY + 90),
        (CX - 50, CY + 20),
        (CX + 30, CY + 50),
        (CX + 120, CY - 80),
        (CX + 170, CY - 120),
    ]
    polyline(g, nodes, 8, "rim")
    for p in nodes:
        g.add(p, "core")
    arrow(g, nodes[-2], (nodes[-1][0] + 18, nodes[-1][1] - 18), 18, "needle")
    hub(g, *nodes[2])
    floaters(g)
    return g


def ico_oportunidades():
    g = G()
    # pin
    pin = []
    for i in range(20):
        a = math.pi * 1.15 + (math.pi * 1.7) * i / 19
        pin.append(polar(CX, CY - 40, a, 78))
    pin.append((CX, CY + 150))
    poly(g, pin, 7, "rim")
    circle(g, CX, CY - 48, 28, 16, "core")
    star5(g, CX + 90, CY - 110, 22, 9, "needle")
    star5(g, CX + 130, CY - 40, 16, 7, "needle")
    hub(g, CX, CY - 48)
    floaters(g)
    return g


def ico_crecimiento():
    g = G()
    polyline(g, [(CX - 160, CY + 130), (CX - 160, CY - 130)], 8, "tick")
    polyline(g, [(CX - 160, CY + 130), (CX + 180, CY + 130)], 8, "tick")
    bars = [(CX - 110, 70), (CX - 20, 120), (CX + 70, 180)]
    for x, h in bars:
        rect(g, x, CY + 130 - h, 50, h, 7, "rim")
    arrow(g, (CX - 90, CY + 40), (CX + 150, CY - 120), 22, "needle")
    hub(g, CX + 70, CY + 40)
    floaters(g)
    return g


def ico_dashboard():
    g = G()
    rect(g, CX - 190, CY - 140, 380, 280, 8, "rim")
    polyline(g, [(CX - 190, CY - 100), (CX + 190, CY - 100)], 8, "tick")
    for x in (-160, -130, -100):
        circle(g, CX + x, CY - 120, 6, 8, "core")
    circle(g, CX - 80, CY + 20, 55, 28, "rim")
    polyline(g, [(CX - 80, CY + 20), (CX - 80, CY - 25), polar(CX - 80, CY + 20, -0.6, 50)], 7, "needle")
    for i, h in enumerate((50, 80, 110)):
        rect(g, CX + 40 + i * 42, CY + 90 - h, 28, h, 6, "tick")
    hub(g, CX - 80, CY + 20)
    floaters(g)
    return g


def ico_analisis_datos():
    g = G()
    circle(g, CX, CY, 150, 48, "rim")
    polyline(g, [(CX, CY - 150), (CX, CY + 150)], 8, "tick")
    polyline(g, [(CX - 150, CY), (CX + 150, CY)], 8, "tick")
    nodes = [(CX - 90, CY + 20), (CX - 20, CY - 40), (CX + 70, CY + 10), (CX + 110, CY - 70)]
    polyline(g, nodes, 8, "needle")
    for p in nodes:
        g.add(p, "core")
    hub(g)
    floaters(g)
    return g


def ico_inteligencia():
    g = G()
    # sobre + mini grafico
    poly(g, [(CX - 140, CY - 20), (CX, CY + 70), (CX + 140, CY - 20), (CX + 140, CY + 110), (CX - 140, CY + 110)], 8, "rim")
    polyline(g, [(CX - 140, CY - 20), (CX, CY - 120), (CX + 140, CY - 20)], 8, "tick")
    polyline(g, [(CX - 70, CY + 70), (CX - 20, CY + 30), (CX + 20, CY + 50), (CX + 70, CY + 10)], 7, "needle")
    hub(g, CX, CY + 20)
    floaters(g)
    return g


def ico_ubicacion():
    g = G()
    pin = []
    for i in range(22):
        a = math.pi * 1.12 + (math.pi * 1.76) * i / 21
        pin.append(polar(CX, CY - 50, a, 92))
    pin.append((CX, CY + 165))
    poly(g, pin, 7, "rim")
    circle(g, CX, CY - 58, 34, 18, "core")
    hub(g, CX, CY - 58)
    floaters(g)
    return g


def ico_alcance_global():
    g = G()
    circle(g, CX, CY, 150, 48, "rim")
    for ry in (48, 0, -48):
        # elipses paralelos
        pts = [polar(CX, CY + ry * 0.15, a, 150 * math.cos(abs(ry) / 220)) for a in [i * 0.22 for i in range(29)]]
        # meridianos / paralelos simples
    for i in range(-2, 3):
        pts = []
        for t in range(24):
            ang = math.pi * (t / 23 - 0.5)
            x = CX + math.sin(ang) * 150 * math.cos(i * 0.45)
            y = CY + math.cos(ang) * 150
            pts.append((x, y))
        polyline(g, pts, 9, "tick")
    for i in range(-2, 3):
        pts = []
        for t in range(32):
            ang = 2 * math.pi * t / 31
            x = CX + math.cos(ang) * 150
            y = CY + math.sin(ang) * (42 + abs(i) * 8) + i * 36
            if math.hypot(x - CX, y - CY) <= 152:
                pts.append((x, y))
        if len(pts) > 2:
            polyline(g, pts, 10, "tick")
    hub(g)
    floaters(g)
    return g


def ico_vision():
    g = G()
    # almendra
    eye = []
    for i in range(24):
        a = math.pi + math.pi * i / 23
        eye.append((CX + math.cos(a) * 160, CY + math.sin(a) * 70))
    for i in range(24):
        a = math.pi * i / 23
        eye.append((CX + math.cos(a) * 160, CY - math.sin(a) * 70))
    poly(g, eye, 7, "rim")
    circle(g, CX, CY, 48, 22, "core")
    hub(g)
    # circuito a la derecha
    for p in [(CX + 90, CY - 30), (CX + 130, CY), (CX + 90, CY + 30), (CX + 160, CY - 50), (CX + 170, CY + 40)]:
        g.add(p, "needle")
    polyline(g, [(CX + 48, CY), (CX + 90, CY - 30), (CX + 160, CY - 50)], 8, "tick")
    polyline(g, [(CX + 48, CY), (CX + 90, CY + 30), (CX + 170, CY + 40)], 8, "tick")
    floaters(g)
    return g


def ico_presencia_ia():
    g = G()
    circle(g, CX - 20, CY, 130, 44, "rim")
    for i in range(-1, 2):
        pts = []
        for t in range(20):
            ang = math.pi * (t / 19 - 0.5)
            pts.append((CX - 20 + math.sin(ang) * 130, CY + math.cos(ang) * 130))
        polyline(g, pts, 10, "tick")
    # chip
    rect(g, CX + 90, CY + 70, 70, 54, 6, "needle")
    polyline(g, [(CX + 102, CY + 88), (CX + 148, CY + 106)], 6, "core")
    hub(g, CX - 20, CY)
    floaters(g)
    return g


def ico_conexion():
    g = G()
    # dos eslabones
    def link(cx, cy, rot):
        ca, sa = math.cos(rot), math.sin(rot)
        pts = []
        for i in range(28):
            a = 2 * math.pi * i / 28
            x, y = 70 * math.cos(a), 38 * math.sin(a)
            pts.append((cx + ca * x - sa * y, cy + sa * x + ca * y))
        poly(g, pts, 7, "rim")

    link(CX - 50, CY - 18, 0.7)
    link(CX + 50, CY + 18, 0.7)
    hub(g)
    floaters(g)
    return g


def ico_red_enlaces():
    g = G()
    sats = []
    for i in range(5):
        a = -math.pi / 2 + i * 2 * math.pi / 5
        p = polar(CX, CY, a, 145)
        sats.append(p)
        circle(g, p[0], p[1], 18, 12, "core")
        polyline(g, [(CX, CY), p], 8, "tick")
    circle(g, CX, CY, 36, 18, "rim")
    hub(g)
    floaters(g)
    return g


def ico_enlaces_eficientes():
    g = G()
    rect(g, CX - 170, CY - 130, 340, 260, 8, "rim")
    polyline(g, [(CX - 170, CY - 90), (CX + 170, CY - 90)], 8, "tick")
    def link(cx, cy, rot):
        ca, sa = math.cos(rot), math.sin(rot)
        pts = []
        for i in range(24):
            a = 2 * math.pi * i / 24
            x, y = 55 * math.cos(a), 28 * math.sin(a)
            pts.append((cx + ca * x - sa * y, cy + sa * x + ca * y))
        poly(g, pts, 7, "needle")

    link(CX - 30, CY + 20, 0.65)
    link(CX + 35, CY + 40, 0.65)
    hub(g, CX, CY + 30)
    floaters(g)
    return g


def ico_analisis_contenido():
    g = G()
    rect(g, CX - 150, CY - 140, 180, 240, 8, "rim")
    for i in range(4):
        y = CY - 80 + i * 36
        polyline(g, [(CX - 130, y), (CX - 10, y)], 8, "tick")
    circle(g, CX + 90, CY + 40, 88, 36, "needle")
    polyline(g, [(CX + 150, CY + 100), (CX + 200, CY + 150)], 7, "needle")
    hub(g, CX + 90, CY + 40)
    floaters(g)
    return g


def ico_optimizacion():
    g = G()
    offsets = [(-40, -30), (0, 0), (40, 30)]
    for i, (dx, dy) in enumerate(offsets):
        rect(g, CX - 90 + dx, CY - 120 + dy, 160, 200, 8, "rim" if i < 2 else "needle")
    hub(g, CX + 20, CY + 10)
    floaters(g)
    return g


def ico_rendimiento_seo():
    g = G()
    rect(g, CX - 160, CY - 140, 200, 250, 8, "rim")
    for i in range(3):
        polyline(g, [(CX - 140, CY - 70 + i * 40), (CX + 10, CY - 70 + i * 40)], 8, "tick")
    circle(g, CX + 80, CY + 50, 80, 32, "needle")
    polyline(g, [(CX + 135, CY + 105), (CX + 185, CY + 155)], 7, "needle")
    # llave simple dentro de la lupa
    polyline(g, [(CX + 55, CY + 50), (CX + 105, CY + 50)], 6, "core")
    circle(g, CX + 50, CY + 50, 12, 10, "core")
    hub(g, CX + 80, CY + 50)
    floaters(g)
    return g


def ico_plataforma():
    g = G()
    rect(g, CX - 170, CY - 120, 340, 200, 8, "rim")
    polyline(g, [(CX - 170, CY - 80), (CX + 170, CY - 80)], 8, "tick")
    poly(g, [(CX - 90, CY + 80), (CX + 90, CY + 80), (CX + 130, CY + 130), (CX - 130, CY + 130)], 8, "needle")
    hub(g, CX, CY)
    floaters(g)
    return g


def ico_soluciones():
    g = G()
    # nube
    circle(g, CX - 70, CY + 10, 70, 28, "rim")
    circle(g, CX + 10, CY - 30, 90, 34, "rim")
    circle(g, CX + 80, CY + 15, 62, 26, "rim")
    polyline(g, [(CX - 70, CY + 70), (CX + 80, CY + 70)], 8, "rim")
    arrow(g, (CX, CY + 40), (CX, CY - 80), 20, "needle")
    hub(g, CX + 10, CY - 10)
    floaters(g)
    return g


def ico_infraestructura():
    g = G()
    circle(g, CX - 60, CY - 20, 60, 24, "rim")
    circle(g, CX + 20, CY - 50, 80, 30, "rim")
    circle(g, CX + 80, CY - 10, 52, 22, "rim")
    polyline(g, [(CX - 60, CY + 32), (CX + 80, CY + 32)], 8, "rim")
    for i, x in enumerate((-90, 0, 90)):
        p = (CX + x, CY + 130)
        circle(g, p[0], p[1], 16, 10, "core")
        polyline(g, [(CX + x * 0.3, CY + 40), p], 8, "tick")
    hub(g, CX + 10, CY - 20)
    floaters(g)
    return g


def ico_anuncios():
    g = G()
    # megafono: cono
    poly(g, [(CX - 40, CY - 55), (CX + 130, CY - 110), (CX + 130, CY + 110), (CX - 40, CY + 55)], 7, "rim")
    circle(g, CX - 70, CY, 42, 20, "tick")
    polyline(g, [(CX - 40, CY + 20), (CX - 20, CY + 120)], 7, "needle")
    hub(g, CX + 20, CY)
    floaters(g)
    return g


def ico_publicidad():
    g = G()
    rect(g, CX - 180, CY - 130, 360, 260, 8, "rim")
    polyline(g, [(CX - 180, CY - 90), (CX + 180, CY - 90)], 8, "tick")
    rect(g, CX - 70, CY - 40, 90, 50, 6, "needle")
    poly(g, [(CX - 55, CY - 15), (CX - 15, CY), (CX - 55, CY + 15)], 6, "core")
    rect(g, CX + 40, CY + 40, 80, 28, 6, "tick")
    hub(g)
    floaters(g)
    return g


def ico_roi():
    g = G()
    for i, h in enumerate((70, 120, 170)):
        rect(g, CX - 130 + i * 70, CY + 110 - h, 48, h, 7, "rim")
    arrow(g, (CX - 80, CY + 20), (CX + 150, CY - 110), 22, "needle")
    circle(g, CX + 160, CY - 130, 28, 14, "core")
    hub(g, CX + 10, CY + 20)
    floaters(g)
    return g


def ico_campanas():
    g = G()
    poly(g, [(CX - 90, CY - 50), (CX + 40, CY - 100), (CX + 40, CY + 100), (CX - 90, CY + 50)], 7, "rim")
    circle(g, CX - 120, CY, 36, 16, "tick")
    for i, ang in enumerate((-0.5, 0.0, 0.5)):
        p = polar(CX + 80, CY, ang, 90)
        circle(g, p[0], p[1], 16, 10, "core")
        polyline(g, [(CX + 40, CY), p], 8, "needle")
    hub(g, CX - 20, CY)
    floaters(g)
    return g


def ico_email():
    g = G()
    rect(g, CX - 160, CY - 90, 320, 200, 8, "rim")
    polyline(g, [(CX - 160, CY - 90), (CX, CY + 40), (CX + 160, CY - 90)], 8, "tick")
    hub(g, CX, CY + 10)
    floaters(g)
    return g


def ico_envio():
    g = G()
    # avion de papel
    poly(g, [(CX - 140, CY + 40), (CX + 160, CY - 20), (CX - 40, CY + 10)], 7, "rim")
    poly(g, [(CX - 140, CY + 40), (CX + 160, CY - 20), (CX - 20, CY + 80)], 7, "tick")
    polyline(g, [(CX - 40, CY + 10), (CX - 20, CY + 80)], 7, "needle")
    hub(g, CX + 20, CY)
    floaters(g)
    return g


def ico_contenido():
    g = G()
    rect(g, CX - 110, CY - 150, 220, 300, 8, "rim")
    polyline(g, [(CX - 80, CY - 80), (CX + 80, CY - 80)], 8, "tick")
    polyline(g, [(CX - 80, CY - 30), (CX + 80, CY - 30)], 8, "tick")
    polyline(g, [(CX - 80, CY + 20), (CX + 40, CY + 20)], 8, "tick")
    rect(g, CX - 80, CY + 60, 90, 60, 7, "core")
    hub(g)
    floaters(g)
    return g


def ico_ecosistema():
    g = G()
    for dx, dy, k in ((-50, -40, "rim"), (0, 0, "tick"), (50, 40, "needle")):
        rect(g, CX - 90 + dx, CY - 130 + dy, 170, 220, 8, k)
    hub(g, CX + 20, CY)
    floaters(g)
    return g


def ico_tienda():
    g = G()
    rect(g, CX - 140, CY - 20, 280, 170, 8, "rim")
    poly(g, [(CX - 170, CY - 20), (CX - 140, CY - 90), (CX + 140, CY - 90), (CX + 170, CY - 20)], 7, "needle")
    rect(g, CX - 40, CY + 40, 80, 110, 7, "tick")
    hub(g, CX, CY + 20)
    floaters(g)
    return g


def ico_comunidad():
    g = G()
    person(g, CX, CY - 10, 1.05, "rim")
    person(g, CX - 110, CY + 30, 0.85, "tick")
    person(g, CX + 110, CY + 30, 0.85, "tick")
    hub(g, CX, CY - 38)
    floaters(g)
    return g


def ico_diseno():
    g = G()
    circle(g, CX, CY - 50, 95, 36, "rim")
    poly(g, [(CX - 40, CY + 40), (CX + 40, CY + 40), (CX + 32, CY + 150), (CX - 32, CY + 150)], 7, "tick")
    polyline(g, [(CX - 22, CY + 80), (CX + 22, CY + 80)], 6, "core")
    polyline(g, [(CX - 22, CY + 110), (CX + 22, CY + 110)], 6, "core")
    for i in range(8):
        a = -math.pi / 2 + i * math.pi / 4
        polyline(g, [polar(CX, CY - 50, a, 105), polar(CX, CY - 50, a, 128)], 6, "needle")
    hub(g, CX, CY - 50)
    floaters(g)
    return g


def ico_conversacion():
    g = G()
    poly(
        g,
        [
            (CX - 150, CY - 90),
            (CX + 20, CY - 90),
            (CX + 20, CY + 30),
            (CX - 40, CY + 30),
            (CX - 80, CY + 80),
            (CX - 70, CY + 30),
            (CX - 150, CY + 30),
        ],
        7,
        "rim",
    )
    poly(
        g,
        [
            (CX - 10, CY - 10),
            (CX + 160, CY - 10),
            (CX + 160, CY + 100),
            (CX + 90, CY + 100),
            (CX + 120, CY + 150),
            (CX + 50, CY + 100),
            (CX - 10, CY + 100),
        ],
        7,
        "needle",
    )
    hub(g, CX - 60, CY - 30)
    floaters(g)
    return g


def ico_ventas():
    g = G()
    # bolsa
    poly(g, [(CX - 90, CY - 20), (CX + 90, CY - 20), (CX + 75, CY + 150), (CX - 75, CY + 150)], 7, "rim")
    polyline(g, [(CX - 40, CY - 20), (CX - 40, CY - 70), (CX + 40, CY - 70), (CX + 40, CY - 20)], 7, "tick")
    circle(g, CX, CY + 50, 22, 12, "core")
    hub(g, CX, CY + 50)
    floaters(g)
    return g


def ico_experiencia():
    g = G()
    poly(g, [(CX - 120, CY - 10), (CX - 20, CY - 10), (CX - 30, CY + 140), (CX - 110, CY + 140)], 7, "rim")
    polyline(g, [(CX - 95, CY - 10), (CX - 95, CY - 55), (CX - 45, CY - 55), (CX - 45, CY - 10)], 7, "tick")
    for i, h in enumerate((50, 80, 110)):
        rect(g, CX + 20 + i * 48, CY + 130 - h, 34, h, 6, "needle")
    hub(g, CX - 70, CY + 50)
    floaters(g)
    return g


def ico_paleta():
    g = G()
    # silueta de paleta (ovalo con pulgar)
    pal = []
    for i in range(32):
        a = 2 * math.pi * i / 32
        r = 150 if not (0.15 < i / 32 < 0.28) else 95
        pal.append(polar(CX + 10, CY, a, r))
    poly(g, pal, 7, "rim")
    for p, k in [
        ((CX - 40, CY - 40), "core"),
        ((CX + 30, CY - 50), "needle"),
        ((CX + 50, CY + 20), "tick"),
        ((CX - 20, CY + 50), "core"),
    ]:
        circle(g, p[0], p[1], 16, 10, k)
    polyline(g, [(CX + 80, CY + 80), (CX + 160, CY - 90)], 7, "needle")
    hub(g)
    floaters(g)
    return g


def ico_sitio_web():
    g = G()
    rect(g, CX - 180, CY - 130, 360, 240, 8, "rim")
    polyline(g, [(CX - 180, CY - 90), (CX + 180, CY - 90)], 8, "tick")
    for x in (-150, -120, -90):
        circle(g, CX + x, CY - 110, 6, 8, "core")
    rect(g, CX - 140, CY - 50, 120, 80, 7, "needle")
    polyline(g, [(CX + 20, CY - 30), (CX + 140, CY - 30)], 7, "tick")
    polyline(g, [(CX + 20, CY + 10), (CX + 110, CY + 10)], 7, "tick")
    hub(g)
    floaters(g)
    return g


def ico_desarrollo():
    g = G()
    rect(g, CX - 180, CY - 130, 360, 250, 8, "rim")
    polyline(g, [(CX - 180, CY - 90), (CX + 180, CY - 90)], 8, "tick")
    # < / >
    polyline(g, [(CX - 40, CY - 30), (CX - 110, CY + 30), (CX - 40, CY + 90)], 7, "needle")
    polyline(g, [(CX + 40, CY - 30), (CX + 110, CY + 30), (CX + 40, CY + 90)], 7, "needle")
    polyline(g, [(CX + 10, CY - 10), (CX - 10, CY + 70)], 7, "core")
    hub(g, CX, CY + 30)
    floaters(g)
    return g


ICONS = {
    "diana-objetivo": ico_diana,
    "caballo-ajedrez": ico_caballo,
    "ciclo-360": ico_ciclo360,
    "analisis-tendencias": ico_tendencias,
    "detectar-oportunidades": ico_oportunidades,
    "crecimiento": ico_crecimiento,
    "dashboard": ico_dashboard,
    "analisis-datos": ico_analisis_datos,
    "inteligencia-negocio": ico_inteligencia,
    "ubicacion": ico_ubicacion,
    "alcance-global": ico_alcance_global,
    "vision-inteligente": ico_vision,
    "presencia-alcance-ia": ico_presencia_ia,
    "conexion": ico_conexion,
    "red-enlaces": ico_red_enlaces,
    "enlaces-eficientes": ico_enlaces_eficientes,
    "analisis-contenido": ico_analisis_contenido,
    "optimizacion": ico_optimizacion,
    "rendimiento-seo": ico_rendimiento_seo,
    "plataforma-digital": ico_plataforma,
    "soluciones-digitales": ico_soluciones,
    "infraestructura": ico_infraestructura,
    "anuncios": ico_anuncios,
    "publicidad-online": ico_publicidad,
    "roi-publicitario": ico_roi,
    "campanas": ico_campanas,
    "email": ico_email,
    "envio-estrategico": ico_envio,
    "contenido-valor": ico_contenido,
    "ecosistema-contenido": ico_ecosistema,
    "tienda-digital": ico_tienda,
    "comunidad": ico_comunidad,
    "diseno-creativo": ico_diseno,
    "conversacion": ico_conversacion,
    "ventas-inteligentes": ico_ventas,
    "experiencia-compra": ico_experiencia,
    "paleta-creativa": ico_paleta,
    "sitio-web": ico_sitio_web,
    "desarrollo-web": ico_desarrollo,
}


def sizes_for(kinds):
    sizes = []
    for k in kinds:
        if k == "hub":
            sizes.append(7.4)
        elif k == "core":
            sizes.append(random.choice([3.0, 3.6, 4.4]))
        elif k == "needle":
            sizes.append(random.choice([2.8, 3.4, 4.2]))
        elif k == "rim":
            sizes.append(random.choice([2.6, 3.1, 3.8, 4.5]))
        elif k == "float":
            sizes.append(random.choice([1.7, 2.1, 2.6]))
        else:
            sizes.append(random.choice([2.2, 2.8, 3.4]))
    return sizes


def build_edges(pts, kinds):
    n = len(pts)
    edges = set()
    for i in range(n):
        dists = sorted(
            (((pts[i][0] - pts[j][0]) ** 2 + (pts[i][1] - pts[j][1]) ** 2), j)
            for j in range(n)
            if i != j
        )
        if kinds[i] == "rim":
            max_deg, lim = 7, 68**2
        elif kinds[i] in ("needle", "core", "tick", "pivot"):
            max_deg, lim = 6, 62**2
        elif kinds[i] == "float":
            max_deg, lim = 2, 48**2
        elif kinds[i] == "hub":
            max_deg, lim = 6, 42**2
        else:
            max_deg, lim = 5, 64**2
        c = 0
        for d2, j in dists:
            if d2 > lim:
                break
            if kinds[i] == "float" and kinds[j] != "float":
                continue
            a, b = (i, j) if i < j else (j, i)
            edges.add((a, b))
            c += 1
            if c >= max_deg:
                break
    return list(edges)


def ease_out(u):
    u = max(0, min(1, u))
    return 1 - (1 - u) ** 3


def ease_in(u):
    u = max(0, min(1, u))
    return u**3


def ease_io(u):
    u = max(0, min(1, u))
    return u * u * (3 - 2 * u)


def form_amount(t):
    if t < 0.35:
        return 0.0
    if t < 3.8:
        return ease_out((t - 0.35) / 3.45)
    if t < 10.2:
        return 1.0
    if t < 14.9:
        return 1.0 - ease_in((t - 10.2) / 4.7)
    return 0.0


def clamp_ell(sx, sy, r):
    if sx + r < -3 or sy + r < -3 or sx - r > W + 3 or sy - r > H + 3:
        return None
    r = max(0.5, r)
    return [sx - r, sy - r, sx + r, sy + r]


def prepare(name):
    random.seed(21 + sum(map(ord, name)) % 90)
    geom = ICONS[name]()
    pts, kinds = dedup(geom.pts, geom.kinds, MIN_D)
    n = len(pts)
    sizes = sizes_for(kinds)
    phases = [
        (random.random() * math.pi * 2, random.uniform(0.5, 1.25), random.uniform(0.25, 0.9))
        for _ in range(n)
    ]
    scatter = []
    for _ in range(n):
        ang = random.random() * math.pi * 2
        dist = random.uniform(270, 450)
        scatter.append((W / 2 + math.cos(ang) * dist, H / 2 + math.sin(ang) * dist * 0.72))
    edges = build_edges(pts, kinds)
    prio = {"rim": 0, "tick": 1, "core": 2, "needle": 3, "pivot": 4, "hub": 5, "float": 6}
    order = sorted(range(n), key=lambda i: (prio.get(kinds[i], 9), i))
    rank = [0] * n
    for r, i in enumerate(order):
        rank[i] = r
    print(f"{name}: nodes {n} edges {len(edges)} { {k: kinds.count(k) for k in sorted(set(kinds))} }")
    return pts, kinds, sizes, phases, scatter, edges, rank


def render_frame(t, pts, kinds, sizes, phases, scatter, edges, rank):
    n = len(pts)
    form = form_amount(t)
    layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    draw = ImageDraw.Draw(layer, "RGBA")
    breath = 1.0 + (0.012 * math.sin(t * 1.1) if form > 0.75 else 0)
    locals_u, pos = [], []
    for i in range(n):
        if t < 10.2:
            thr = rank[i] / max(1, n - 1)
            lu = ease_io(max(0, min(1, form * 1.12 - thr * 0.28)))
        else:
            lu = form
        locals_u.append(lu)
        ph, freq, amp = phases[i]
        tx, ty = pts[i]
        if kinds[i] != "float":
            tx = CX + (tx - CX) * breath
            ty = CY + (ty - CY) * breath
        if form > 0.55 and kinds[i] not in ("hub", "pivot"):
            tx += amp * math.sin(t * freq * 1.55 + ph)
            ty += amp * 0.65 * math.cos(t * freq * 1.25 + ph)
        sx, sy = scatter[i]
        push = 1.0 + 0.45 * (1 - form) if t >= 10.2 else 1.0
        sx = W / 2 + (sx - W / 2) * push
        sy = H / 2 + (sy - H / 2) * push
        pos.append((sx + (tx - sx) * lu, sy + (ty - sy) * lu))

    sil = {"rim", "tick", "core", "needle", "pivot"}
    for a, b in edges:
        uu = min(locals_u[a], locals_u[b])
        if uu < 0.38:
            continue
        xa, ya = pos[a]
        xb, yb = pos[b]
        if (xa - xb) ** 2 + (ya - yb) ** 2 > 88**2:
            continue
        depth = 1 - min(1, math.hypot((xa + xb) / 2 - CX, (ya + yb) / 2 - CY) / 340)
        if kinds[a] in sil or kinds[b] in sil:
            depth = max(depth, 0.82)
            boost = 1.25
        else:
            boost = 1.0
        alpha = int((55 + 145 * depth) * uu * uu * boost)
        if alpha < 8:
            continue
        r = int(LINE_FAR[0] + (LINE[0] - LINE_FAR[0]) * depth)
        gv = int(LINE_FAR[1] + (LINE[1] - LINE_FAR[1]) * depth)
        bl = int(LINE_FAR[2] + (LINE[2] - LINE_FAR[2]) * depth)
        draw.line([(xa, ya), (xb, yb)], fill=(r, gv, bl, min(230, alpha)), width=1)

    glow = {"hub", "rim", "core", "needle", "tick", "pivot"}
    for i in sorted(range(n), key=lambda i: (1 if kinds[i] == "hub" else 0, -sizes[i])):
        uu = locals_u[i]
        if uu < 0.03:
            continue
        x, y = pos[i]
        rad = sizes[i] * (0.4 + 0.6 * uu)
        if kinds[i] in glow:
            box = clamp_ell(x, y, rad * 2.3)
            if box:
                draw.ellipse(box, fill=(*GLOW, int(40 * uu)))
        box = clamp_ell(x, y, rad)
        if box:
            col = NODE if kinds[i] != "float" else NODE_DIM
            draw.ellipse(box, fill=(*col, min(255, int(210 * uu))))

    if "hub" in kinds:
        i = kinds.index("hub")
        if locals_u[i] > 0.25:
            x, y = pos[i]
            a = locals_u[i]
            draw.ellipse([x - 7, y - 7, x + 7, y + 7], fill=(9, 25, 20, int(255 * a)))
            draw.ellipse([x - 3.6, y - 3.6, x + 3.6, y + 3.6], fill=(*NODE, int(255 * a)))

    base = Image.new("RGBA", (W, H), (0, 0, 0, 255))
    return Image.alpha_composite(base, layer).convert("RGB")


def render_preview(name, out_path):
    data = prepare(name)
    img = render_frame(6.5, *data)
    os.makedirs(os.path.dirname(out_path) or ".", exist_ok=True)
    img.save(out_path)
    print("preview", out_path)


def render_video(name, mp4_path):
    data = prepare(name)
    os.makedirs(os.path.dirname(mp4_path), exist_ok=True)
    cmd = [
        "ffmpeg",
        "-y",
        "-f",
        "rawvideo",
        "-pix_fmt",
        "rgb24",
        "-s",
        f"{W}x{H}",
        "-r",
        str(FPS),
        "-i",
        "pipe:0",
        "-c:v",
        "libx264",
        "-pix_fmt",
        "yuv420p",
        "-crf",
        "18",
        "-preset",
        "veryfast",
        "-movflags",
        "+faststart",
        mp4_path,
    ]
    proc = subprocess.Popen(cmd, stdin=subprocess.PIPE, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    assert proc.stdin is not None
    for fi in range(NFRAMES):
        img = render_frame(fi / FPS, *data)
        proc.stdin.write(img.tobytes())
    proc.stdin.close()
    rc = proc.wait()
    if rc != 0:
        raise RuntimeError(f"ffmpeg {name} exit {rc}")
    print("mp4", mp4_path, os.path.getsize(mp4_path))


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--preview", action="store_true")
    p.add_argument("--icon", default="")
    p.add_argument("--icons", default="")
    p.add_argument("--out-dir", default=OUT_DIR)
    args = p.parse_args()
    names = list(ICONS)
    if args.icon:
        names = [args.icon]
    elif args.icons:
        names = [s.strip() for s in args.icons.split(",") if s.strip()]
    unknown = [n for n in names if n not in ICONS]
    if unknown:
        print("unknown", unknown)
        print("available", ", ".join(ICONS))
        return 1
    os.makedirs(args.out_dir, exist_ok=True)
    for name in names:
        if args.preview:
            render_preview(name, f"/tmp/mkof-ico-{name}.png")
        else:
            render_video(name, os.path.join(args.out_dir, f"{name}.mp4"))
    return 0


if __name__ == "__main__":
    sys.exit(main())
