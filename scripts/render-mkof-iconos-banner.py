#!/usr/bin/env python3
"""
Lote de iconos mesh MKOF — estética caras / mundo / lupa:
malla llena (no solo contorno), cadenas estructurales para rectas y curvas,
armado fluido, jitter bajo para que la figura no se pierda.

Verde neon / negro · bucle 16s · 798x570. Solo videos.

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


def along(a, b, u):
    return (a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u)


def dist(a, b):
    return math.hypot(b[0] - a[0], b[1] - a[1])


def polar(cx, cy, ang, r):
    return (cx + math.cos(ang) * r, cy + math.sin(ang) * r)


def cubic_pts(a, c1, c2, b, n=8):
    pts = []
    for i in range(n):
        t = i / n
        u = 1.0 - t
        x = u * u * u * a[0] + 3 * u * u * t * c1[0] + 3 * u * t * t * c2[0] + t * t * t * b[0]
        y = u * u * u * a[1] + 3 * u * u * t * c1[1] + 3 * u * t * t * c2[1] + t * t * t * b[1]
        pts.append((x, y))
    return pts


def svg_xy(x, y, s=1.26):
    return (CX + (x - 260.0) * s, CY + (y - 198.0) * s)


def densify_open(a, b, step):
    d = dist(a, b)
    steps = max(1, int(round(d / step)))
    return [along(a, b, k / steps) for k in range(steps + 1)]


def densify_closed(poly, step):
    out = []
    n = len(poly)
    for i in range(n):
        out.extend(densify_open(poly[i], poly[(i + 1) % n], step)[:-1])
    return out


def pip(p, poly):
    x, y = p
    inside = False
    n = len(poly)
    j = n - 1
    for i in range(n):
        xi, yi = poly[i]
        xj, yj = poly[j]
        if (yi > y) != (yj > y):
            t = (y - yi) / (yj - yi + 1e-12)
            if x < xi + t * (xj - xi):
                inside = not inside
        j = i
    return inside


def rrect_pts(x, y, w, h, r=18, n_arc=5):
    r = min(r, w / 2.0, h / 2.0)
    corners = (
        (x + r, y + r, math.pi, 1.5 * math.pi),
        (x + w - r, y + r, -0.5 * math.pi, 0.0),
        (x + w - r, y + h - r, 0.0, 0.5 * math.pi),
        (x + r, y + h - r, 0.5 * math.pi, math.pi),
    )
    pts = []
    for cx, cy, a0, a1 in corners:
        for i in range(n_arc + 1):
            a = a0 + (a1 - a0) * i / n_arc
            pts.append((cx + math.cos(a) * r, cy + math.sin(a) * r))
    return pts


class G:
    def __init__(self):
        self.pts: list[tuple[float, float]] = []
        self.kinds: list[str] = []
        self.chains: list[tuple[list[int], bool]] = []
        self.disks: list[tuple[float, float, float]] = []
        self.polys: list[list[tuple[float, float]]] = []

    def add(self, p, kind="rim"):
        self.pts.append((float(p[0]), float(p[1])))
        self.kinds.append(kind)
        return len(self.pts) - 1

    def _chain(self, pts, kind, closed):
        if len(pts) < 2:
            return []
        idx = [self.add(p, kind) for p in pts]
        self.chains.append((idx, closed))
        return idx

    def line(self, a, b, step=20, kind="rim"):
        return self._chain(densify_open(a, b, step), kind, False)

    def lines(self, pts, step=20, kind="rim"):
        acc = []
        for i in range(len(pts) - 1):
            acc.extend(densify_open(pts[i], pts[i + 1], step)[:-1])
        acc.append(pts[-1])
        return self._chain(acc, kind, False)

    def loop(self, pts, step=20, kind="rim", fill=True):
        acc = densify_closed(pts, step)
        idx = self._chain(acc, kind, True)
        if fill and len(pts) >= 3:
            self.polys.append([(float(p[0]), float(p[1])) for p in pts])
        return idx

    def circ(self, cx, cy, r, n=28, kind="rim", fill=True):
        pts = [polar(cx, cy, 2 * math.pi * i / n, r) for i in range(n)]
        idx = self._chain(pts, kind, True)
        if fill:
            self.disks.append((cx, cy, r))
        return idx

    def rrect(self, x, y, w, h, r=18, step=20, kind="rim", fill=True):
        return self.loop(rrect_pts(x, y, w, h, r), step, kind, fill)

    def chevron(self, a, b, head=20, kind="needle"):
        self.line(a, b, 14, kind)
        ang = math.atan2(b[1] - a[1], b[0] - a[0])
        p1 = (b[0] + math.cos(ang + 2.65) * head, b[1] + math.sin(ang + 2.65) * head)
        p2 = (b[0] + math.cos(ang - 2.65) * head, b[1] + math.sin(ang - 2.65) * head)
        self.line(p1, b, 11, kind)
        self.line(p2, b, 11, kind)

    def hub_at(self, x=None, y=None):
        self.add((CX if x is None else x, CY if y is None else y), "hub")


def far_enough(g, p, min_d):
    md2 = min_d * min_d
    for q in g.pts:
        if (p[0] - q[0]) ** 2 + (p[1] - q[1]) ** 2 < md2:
            return False
    return True


def stamp_fill(g):
    for cx, cy, r in g.disks:
        area = math.pi * r * r
        gap = 14 if r < 48 else 18
        n = max(5, min(36, int(area / 980)))
        added = 0
        tries = 0
        while added < n and tries < n * 18:
            tries += 1
            a = random.uniform(0, 2 * math.pi)
            rr = r * math.sqrt(random.random()) * 0.78
            p = (cx + math.cos(a) * rr, cy + math.sin(a) * rr)
            if far_enough(g, p, gap):
                g.add(p, "fill")
                added += 1
    for poly in g.polys:
        xs = [p[0] for p in poly]
        ys = [p[1] for p in poly]
        minx, maxx, miny, maxy = min(xs), max(xs), min(ys), max(ys)
        area = max(80.0, (maxx - minx) * (maxy - miny) * 0.50)
        gap = 14 if area < 14000 else 18
        n = max(6, min(38, int(area / 900)))
        added = 0
        tries = 0
        while added < n and tries < n * 20:
            tries += 1
            p = (random.uniform(minx, maxx), random.uniform(miny, maxy))
            if pip(p, poly) and far_enough(g, p, gap):
                g.add(p, "fill")
                added += 1


def floaters(g, n=6):
    for _ in range(n):
        a = random.uniform(-0.45, math.pi + 0.45)
        r = random.uniform(235, 285)
        p = (CX + math.cos(a) * r, CY + math.sin(a) * r * 0.78)
        if far_enough(g, p, 48):
            g.add(p, "float")


def person(g, x, y, s=1.0):
    g.circ(x, y - 30 * s, 15 * s, 14, fill=True)
    g.loop(
        [
            (x - 24 * s, y + 42 * s),
            (x - 16 * s, y - 6 * s),
            (x + 16 * s, y - 6 * s),
            (x + 24 * s, y + 42 * s),
        ],
        12,
        fill=True,
    )


def pin_poly(cx, cy, r=90, drop=95):
    # Arco largo (izq → arriba → der) y punta abajo, sin hueco.
    pts = []
    for i in range(30):
        a = math.radians(135) + math.radians(270) * i / 29
        pts.append(polar(cx, cy, a, r))
    pts.append((cx, cy + r + drop))
    return pts


def window(g, x, y, w, h, r=16):
    g.rrect(x, y, w, h, r, 18, fill=False)
    g.line((x + 10, y + 36), (x + w - 10, y + 36), 16, "tick")
    for dx in (18, 38, 58):
        g.circ(x + dx, y + 18, 4.5, 6, "core", fill=False)


# ---------- siluetas ----------
def ico_diana():
    g = G()
    g.circ(CX, CY, 148, 32, fill=False)
    g.circ(CX, CY, 92, 24, "tick", fill=False)
    g.circ(CX, CY, 36, 14, "core", fill=True)
    g.chevron((CX + 168, CY - 168), (CX + 22, CY - 10), 24)
    g.hub_at()
    return g


def ico_caballo():
    g = G()
    box = [
        (0.46, 0.00),
        (0.58, 0.10),
        (0.54, 0.18),
        (0.40, 0.22),
        (0.18, 0.30),
        (0.02, 0.38),
        (0.04, 0.50),
        (0.20, 0.52),
        (0.34, 0.50),
        (0.40, 0.60),
        (0.28, 0.74),
        (0.16, 0.86),
        (0.10, 0.88),
        (0.06, 0.98),
        (0.94, 0.98),
        (0.90, 0.88),
        (0.78, 0.84),
        (0.74, 0.62),
        (0.66, 0.40),
        (0.60, 0.22),
        (0.54, 0.08),
    ]
    sx, sy = 310, 370
    ox, oy = CX - sx * 0.50, CY - sy * 0.50
    poly = [(ox + x * sx, oy + y * sy) for x, y in box]
    g.loop(poly, 12, fill=True)
    g.line((ox + 0.14 * sx, oy + 0.90 * sy), (ox + 0.86 * sx, oy + 0.90 * sy), 14, "tick")
    g.circ(ox + 0.28 * sx, oy + 0.34 * sy, 7, 8, "core", fill=False)
    g.hub_at(ox + 0.52 * sx, oy + 0.58 * sy)
    return g


def ico_ciclo360():
    g = G()
    g.circ(CX, CY, 26, 14, "core", fill=True)
    r_in, r_out = 100, 148
    for i in range(3):
        a0 = -math.pi / 2 + i * 2 * math.pi / 3
        outer, inner = [], []
        for k in range(14):
            ang = a0 + 1.45 * k / 13
            outer.append(polar(CX, CY, ang, r_out))
            inner.append(polar(CX, CY, ang, r_in))
        g.lines(outer, 12)
        g.lines(inner, 12)
        for k in (2, 6, 10):
            g.line(inner[k], outer[k], 14, "fill")
        tip = polar(CX, CY, a0 + 1.45, (r_in + r_out) / 2)
        left = polar(CX, CY, a0 + 1.28, r_out + 10)
        right = polar(CX, CY, a0 + 1.28, r_in - 10)
        g.line(left, tip, 11, "needle")
        g.line(right, tip, 11, "needle")
    g.hub_at()
    return g


def ico_tendencias():
    g = G()
    g.line((CX - 175, CY + 125), (CX - 175, CY - 135), 14, "tick")
    g.line((CX - 175, CY + 125), (CX + 185, CY + 125), 14, "tick")
    nodes = [
        (CX - 145, CY + 85),
        (CX - 55, CY + 15),
        (CX + 25, CY + 45),
        (CX + 115, CY - 75),
        (CX + 165, CY - 118),
    ]
    g.lines(nodes, 13)
    for p in nodes:
        g.circ(p[0], p[1], 9, 10, "core", fill=True)
    g.chevron(nodes[-2], (nodes[-1][0] + 16, nodes[-1][1] - 16), 16)
    g.hub_at(*nodes[2])
    return g


def ico_oportunidades():
    g = G()
    g.loop(pin_poly(CX - 20, CY - 36, 78, 88), 12, fill=True)
    g.circ(CX - 20, CY - 36, 26, 16, "core", fill=True)
    for p in ((CX + 95, CY - 115), (CX + 125, CY - 40)):
        g.circ(p[0], p[1], 12, 10, "needle", fill=True)
        for k in range(4):
            a = -math.pi / 2 + k * math.pi / 2
            g.line(polar(p[0], p[1], a, 16), polar(p[0], p[1], a, 28), 10, "needle")
    g.hub_at(CX - 20, CY - 36)
    return g


def ico_crecimiento():
    g = G()
    g.line((CX - 170, CY + 130), (CX - 170, CY - 130), 14, "tick")
    g.line((CX - 170, CY + 130), (CX + 185, CY + 130), 14, "tick")
    for x, h in ((CX - 115, 75), (CX - 25, 125), (CX + 65, 185)):
        g.rrect(x, CY + 130 - h, 52, h, 8, 12, fill=True)
    g.chevron((CX - 95, CY + 35), (CX + 155, CY - 125), 20)
    g.hub_at(CX + 65, CY + 35)
    return g


def ico_dashboard():
    g = G()
    window(g, CX - 195, CY - 145, 390, 290, 18)
    g.circ(CX - 80, CY + 25, 58, 28, fill=True)
    g.line((CX - 80, CY + 25), polar(CX - 80, CY + 25, -0.7, 48), 12, "needle")
    for i, h in enumerate((52, 82, 112)):
        g.rrect(CX + 40 + i * 44, CY + 95 - h, 30, h, 6, 11, "tick", fill=True)
    g.hub_at(CX - 80, CY + 25)
    return g


def ico_analisis_datos():
    g = G()
    g.circ(CX, CY, 148, 32, fill=False)
    g.line((CX, CY - 148), (CX, CY + 148), 15, "tick")
    g.line((CX - 148, CY), (CX + 148, CY), 15, "tick")
    nodes = [(CX - 85, CY + 18), (CX - 15, CY - 42), (CX + 70, CY + 8), (CX + 108, CY - 68)]
    g.lines(nodes, 13, "needle")
    for p in nodes:
        g.circ(p[0], p[1], 8, 9, "core", fill=True)
    g.hub_at()
    return g


def ico_inteligencia():
    g = G()
    g.loop(
        [
            (CX - 145, CY - 18),
            (CX, CY + 72),
            (CX + 145, CY - 18),
            (CX + 145, CY + 115),
            (CX - 145, CY + 115),
        ],
        13,
        fill=True,
    )
    g.lines([(CX - 145, CY - 18), (CX, CY - 125), (CX + 145, CY - 18)], 13, "tick")
    g.lines([(CX - 70, CY + 70), (CX - 20, CY + 28), (CX + 20, CY + 50), (CX + 70, CY + 8)], 12, "needle")
    g.hub_at(CX, CY + 20)
    return g


def ico_ubicacion():
    g = G()
    g.loop(pin_poly(CX, CY - 48, 88, 92), 12, fill=True)
    g.circ(CX, CY - 48, 30, 16, "core", fill=True)
    g.hub_at(CX, CY - 48)
    return g


def ico_alcance_global():
    g = G()
    R = 148
    g.circ(CX, CY, R, 32, fill=False)
    for lon in (-0.75, 0.0, 0.75):
        pts = []
        for i in range(16):
            lat = -math.pi / 2 + math.pi * i / 15
            x = CX + R * math.cos(lat) * math.sin(lon)
            y = CY + R * math.sin(lat)
            pts.append((x, y))
        g.lines(pts, 18, "tick")
    for lat in (-0.55, 0.0, 0.55):
        pts = []
        for i in range(20):
            lon = -math.pi / 2 + math.pi * i / 19
            rr = R * math.cos(lat)
            x = CX + rr * math.sin(lon)
            y = CY + R * math.sin(lat)
            if math.hypot(x - CX, y - CY) <= R + 2:
                pts.append((x, y))
        if len(pts) > 3:
            g.lines(pts, 18, "tick")
    g.hub_at()
    return g


def ico_vision():
    g = G()
    eye = []
    for i in range(36):
        a = 2 * math.pi * i / 36
        eye.append((CX + math.cos(a) * 168, CY + math.sin(a) * 72))
    g.loop(eye, 12, fill=True)
    g.circ(CX, CY, 44, 20, "core", fill=True)
    g.circ(CX + 6, CY - 4, 12, 10, "core", fill=True)
    g.hub_at()
    return g


def ico_presencia_ia():
    g = G()
    g.circ(CX - 18, CY, 128, 42, fill=True)
    for lon in (-0.55, 0.0, 0.55):
        pts = []
        for i in range(18):
            lat = -math.pi / 2 + math.pi * i / 17
            x = CX - 18 + 128 * math.cos(lat) * math.sin(lon)
            y = CY + 128 * math.sin(lat)
            pts.append((x, y))
        g.lines(pts, 14, "tick")
    g.rrect(CX + 88, CY + 68, 78, 56, 10, 12, "needle", fill=True)
    g.line((CX + 102, CY + 88), (CX + 152, CY + 88), 12, "core")
    g.line((CX + 102, CY + 106), (CX + 140, CY + 106), 12, "core")
    g.hub_at(CX - 18, CY)
    return g


def ico_conexion():
    g = G()

    def link(cx, cy, rot, rx=74, ry=38):
        ca, sa = math.cos(rot), math.sin(rot)
        for rx_, ry_, k in ((rx, ry, "rim"), (rx - 16, ry - 14, "tick")):
            pts = []
            for i in range(32):
                a = 2 * math.pi * i / 32
                x, y = rx_ * math.cos(a), ry_ * math.sin(a)
                pts.append((cx + ca * x - sa * y, cy + sa * x + ca * y))
            g.loop(pts, 11, k, fill=False)
        for i in range(0, 32, 4):
            a = 2 * math.pi * i / 32
            p0 = (cx + ca * (rx * math.cos(a)) - sa * (ry * math.sin(a)), cy + sa * (rx * math.cos(a)) + ca * (ry * math.sin(a)))
            p1 = (
                cx + ca * ((rx - 16) * math.cos(a)) - sa * ((ry - 14) * math.sin(a)),
                cy + sa * ((rx - 16) * math.cos(a)) + ca * ((ry - 14) * math.sin(a)),
            )
            g.line(p0, p1, 11, "fill")

    link(CX - 52, CY - 16, 0.7)
    link(CX + 52, CY + 16, 0.7)
    g.hub_at()
    return g


def ico_red_enlaces():
    g = G()
    g.circ(CX, CY, 34, 16, fill=True)
    for i in range(5):
        a = -math.pi / 2 + i * 2 * math.pi / 5
        p = polar(CX, CY, a, 148)
        g.circ(p[0], p[1], 20, 12, "core", fill=True)
        g.line((CX, CY), p, 14, "tick")
    g.hub_at()
    return g


def ico_enlaces_eficientes():
    g = G()
    window(g, CX - 175, CY - 135, 350, 270, 16)

    def link(cx, cy, rot):
        ca, sa = math.cos(rot), math.sin(rot)
        pts = []
        for i in range(24):
            a = 2 * math.pi * i / 24
            x, y = 58 * math.cos(a), 28 * math.sin(a)
            pts.append((cx + ca * x - sa * y, cy + sa * x + ca * y))
        g.loop(pts, 12, "needle", fill=False)

    link(CX - 28, CY + 28, 0.65)
    link(CX + 38, CY + 48, 0.65)
    g.hub_at(CX, CY + 35)
    return g


def ico_analisis_contenido():
    g = G()
    g.rrect(CX - 165, CY - 145, 190, 250, 14, 13, fill=True)
    for i in range(4):
        y = CY - 85 + i * 38
        g.line((CX - 145, y), (CX - 5, y), 14, "tick")
    g.circ(CX + 95, CY + 35, 82, 32, "needle", fill=True)
    g.line((CX + 152, CY + 92), (CX + 200, CY + 142), 13, "needle")
    g.hub_at(CX + 95, CY + 35)
    return g


def ico_optimizacion():
    g = G()
    for dx, dy, k in ((-38, -28, "rim"), (0, 0, "tick"), (38, 28, "needle")):
        g.rrect(CX - 95 + dx, CY - 125 + dy, 170, 210, 14, 13, k, fill=True)
    g.hub_at(CX + 18, CY + 8)
    return g


def ico_rendimiento_seo():
    g = G()
    g.rrect(CX - 170, CY - 145, 205, 255, 14, 13, fill=True)
    for i in range(3):
        y = CY - 75 + i * 42
        g.line((CX - 150, y), (CX + 5, y), 14, "tick")
    g.circ(CX + 85, CY + 48, 78, 30, "needle", fill=True)
    g.line((CX + 140, CY + 102), (CX + 188, CY + 152), 13, "needle")
    g.hub_at(CX + 85, CY + 48)
    return g


def ico_plataforma():
    g = G()
    g.rrect(CX - 175, CY - 130, 350, 210, 16, 13, fill=True)
    g.line((CX - 165, CY - 88), (CX + 165, CY - 88), 15, "tick")
    g.loop(
        [(CX - 70, CY + 85), (CX + 70, CY + 85), (CX + 115, CY + 145), (CX - 115, CY + 145)],
        13,
        "needle",
        fill=True,
    )
    g.hub_at()
    return g


def ico_soluciones():
    g = G()
    g.circ(CX - 72, CY + 12, 72, 28, fill=True)
    g.circ(CX + 8, CY - 32, 92, 34, fill=True)
    g.circ(CX + 82, CY + 16, 64, 26, fill=True)
    g.chevron((CX + 8, CY + 28), (CX + 8, CY - 95), 18)
    g.hub_at(CX + 8, CY - 8)
    return g


def ico_infraestructura():
    g = G()
    g.circ(CX - 62, CY - 22, 62, 26, fill=True)
    g.circ(CX + 18, CY - 52, 82, 32, fill=True)
    g.circ(CX + 82, CY - 12, 54, 22, fill=True)
    for x in (-95, 0, 95):
        p = (CX + x, CY + 138)
        g.circ(p[0], p[1], 16, 10, "core", fill=True)
        g.line((CX + x * 0.28, CY + 28), p, 14, "tick")
    g.hub_at(CX + 10, CY - 22)
    return g


def ico_anuncios():
    g = G()
    g.loop(
        [(CX - 48, CY - 52), (CX + 128, CY - 108), (CX + 128, CY + 108), (CX - 48, CY + 52)],
        12,
        fill=True,
    )
    g.circ(CX - 78, CY, 40, 18, "tick", fill=True)
    g.line((CX - 42, CY + 22), (CX - 18, CY + 118), 13, "needle")
    for i, r in enumerate((152, 176, 200)):
        pts = [polar(CX + 128, CY, -0.55 + 1.1 * k / 8, r) for k in range(9)]
        g.lines(pts, 22, "rim")
    g.hub_at(CX + 20, CY)
    return g


def ico_publicidad():
    g = G()
    window(g, CX - 185, CY - 135, 370, 270, 16)
    g.rrect(CX - 70, CY - 28, 88, 48, 8, 11, "needle", fill=True)
    g.rrect(CX + 40, CY + 48, 86, 30, 8, 11, "tick", fill=True)
    g.hub_at()
    return g


def ico_roi():
    g = G()
    for i, h in enumerate((75, 125, 175)):
        g.rrect(CX - 135 + i * 72, CY + 115 - h, 50, h, 8, 12, fill=True)
    g.chevron((CX - 85, CY + 18), (CX + 145, CY - 108), 20)
    g.circ(CX + 162, CY - 128, 26, 14, "core", fill=True)
    g.hub_at(CX + 10, CY + 18)
    return g


def ico_campanas():
    g = G()
    g.loop(
        [(CX - 95, CY - 48), (CX + 38, CY - 98), (CX + 38, CY + 98), (CX - 95, CY + 48)],
        12,
        fill=True,
    )
    g.circ(CX - 122, CY, 34, 16, "tick", fill=True)
    for ang in (-0.5, 0.0, 0.5):
        p = polar(CX + 70, CY, ang, 95)
        g.circ(p[0], p[1], 16, 10, "core", fill=True)
        g.line((CX + 38, CY), p, 14, "needle")
    g.hub_at(CX - 20, CY)
    return g


def ico_email():
    g = G()
    g.rrect(CX - 165, CY - 95, 330, 205, 16, 13, fill=True)
    g.lines([(CX - 165, CY - 95), (CX, CY + 38), (CX + 165, CY - 95)], 13, "tick")
    g.hub_at(CX, CY + 8)
    return g


def ico_envio():
    g = G()
    g.loop([(CX - 150, CY + 42), (CX + 168, CY - 28), (CX - 28, CY + 8)], 12, fill=True)
    g.loop([(CX - 150, CY + 42), (CX + 168, CY - 28), (CX - 12, CY + 88)], 12, "tick", fill=True)
    g.line((CX - 28, CY + 8), (CX - 12, CY + 88), 13, "needle")
    g.hub_at(CX + 20, CY)
    return g


def ico_contenido():
    g = G()
    g.rrect(CX - 115, CY - 155, 230, 310, 16, 13, fill=True)
    g.rrect(CX - 82, CY - 115, 100, 70, 8, 12, "core", fill=True)
    for y in (-20, 22, 64):
        g.line((CX - 82, CY + y), (CX + 78, CY + y), 14, "tick")
    g.hub_at()
    return g


def ico_ecosistema():
    g = G()
    for dx, dy, k in ((-48, -38, "rim"), (0, 0, "tick"), (48, 38, "needle")):
        g.rrect(CX - 95 + dx, CY - 135 + dy, 175, 225, 14, 13, k, fill=True)
    g.hub_at(CX + 18, CY)
    return g


def ico_tienda():
    g = G()
    g.rrect(CX - 145, CY - 18, 290, 175, 12, 13, fill=True)
    g.loop(
        [(CX - 175, CY - 18), (CX - 145, CY - 95), (CX + 145, CY - 95), (CX + 175, CY - 18)],
        12,
        "needle",
        fill=True,
    )
    g.rrect(CX - 38, CY + 42, 76, 115, 8, 12, "tick", fill=True)
    g.hub_at(CX, CY + 18)
    return g


def ico_comunidad():
    g = G()
    person(g, CX, CY - 12, 1.08)
    person(g, CX - 115, CY + 28, 0.86)
    person(g, CX + 115, CY + 28, 0.86)
    g.hub_at(CX, CY - 42)
    return g


def ico_diseno():
    g = G()
    g.circ(CX, CY - 52, 92, 34, fill=True)
    g.loop(
        [(CX - 38, CY + 38), (CX + 38, CY + 38), (CX + 30, CY + 152), (CX - 30, CY + 152)],
        12,
        "tick",
        fill=True,
    )
    g.line((CX - 20, CY + 78), (CX + 20, CY + 78), 12, "core")
    g.line((CX - 20, CY + 108), (CX + 20, CY + 108), 12, "core")
    for i in range(6):
        a = -math.pi / 2 + i * math.pi / 3
        g.line(polar(CX, CY - 52, a, 102), polar(CX, CY - 52, a, 124), 11, "needle")
    g.hub_at(CX, CY - 52)
    return g


def ico_conversacion():
    g = G()
    g.loop(
        [
            (CX - 155, CY - 95),
            (CX + 15, CY - 95),
            (CX + 15, CY + 22),
            (CX - 42, CY + 22),
            (CX - 82, CY + 78),
            (CX - 72, CY + 22),
            (CX - 155, CY + 22),
        ],
        12,
        fill=True,
    )
    g.loop(
        [
            (CX - 8, CY - 8),
            (CX + 162, CY - 8),
            (CX + 162, CY + 98),
            (CX + 88, CY + 98),
            (CX + 118, CY + 148),
            (CX + 48, CY + 98),
            (CX - 8, CY + 98),
        ],
        12,
        "needle",
        fill=True,
    )
    g.hub_at(CX - 60, CY - 32)
    return g


def ico_ventas():
    g = G()
    g.loop(
        [(CX - 92, CY - 18), (CX + 92, CY - 18), (CX + 76, CY + 155), (CX - 76, CY + 155)],
        12,
        fill=True,
    )
    g.lines([(CX - 38, CY - 18), (CX - 38, CY - 72), (CX + 38, CY - 72), (CX + 38, CY - 18)], 13, "tick")
    g.circ(CX, CY + 52, 20, 12, "core", fill=True)
    g.hub_at(CX, CY + 52)
    return g


def ico_experiencia():
    g = G()
    g.loop(
        [(CX - 125, CY - 8), (CX - 18, CY - 8), (CX - 28, CY + 145), (CX - 115, CY + 145)],
        12,
        fill=True,
    )
    g.lines([(CX - 98, CY - 8), (CX - 98, CY - 55), (CX - 45, CY - 55), (CX - 45, CY - 8)], 13, "tick")
    for i, h in enumerate((55, 85, 115)):
        g.rrect(CX + 18 + i * 50, CY + 135 - h, 36, h, 6, 11, "needle", fill=True)
    g.hub_at(CX - 72, CY + 52)
    return g


def ico_paleta():
    g = G()
    pal = []
    for i in range(36):
        a = 2 * math.pi * i / 36
        u = i / 36
        r = 78 if 0.12 < u < 0.34 else 152
        pal.append(polar(CX + 8, CY, a, r))
    g.loop(pal, 12, fill=True)
    for p, k in (
        ((CX - 42, CY - 42), "core"),
        ((CX + 32, CY - 52), "needle"),
        ((CX + 52, CY + 22), "tick"),
        ((CX - 22, CY + 52), "core"),
    ):
        g.circ(p[0], p[1], 16, 10, k, fill=True)
    g.line((CX + 78, CY + 78), (CX + 162, CY - 92), 13, "needle")
    g.hub_at()
    return g


def ico_sitio_web():
    g = G()
    window(g, CX - 185, CY - 140, 370, 255, 16)
    g.rrect(CX - 150, CY - 55, 130, 88, 10, 12, "needle", fill=True)
    g.line((CX + 12, CY - 28), (CX + 150, CY - 28), 14, "tick")
    g.line((CX + 12, CY + 12), (CX + 118, CY + 12), 14, "tick")
    g.line((CX + 12, CY + 52), (CX + 98, CY + 52), 14, "tick")
    g.hub_at()
    return g


def ico_desarrollo():
    g = G()
    window(g, CX - 185, CY - 140, 370, 265, 16)
    g.lines([(CX - 48, CY - 38), (CX - 128, CY + 28), (CX - 48, CY + 94)], 12, "needle")
    g.lines([(CX + 48, CY - 38), (CX + 128, CY + 28), (CX + 48, CY + 94)], 12, "needle")
    g.line((CX + 16, CY - 12), (CX - 16, CY + 70), 12, "core")
    g.lines([(CX - 40, CY - 32), (CX - 118, CY + 28), (CX - 40, CY + 88)], 12, "needle")
    g.lines([(CX + 40, CY - 32), (CX + 118, CY + 28), (CX + 40, CY + 88)], 12, "needle")
    g.hub_at(CX, CY + 32)
    return g


def ico_caras():
    """Dos perfiles enfrentados + nodo central, como caras-mesh.svg."""
    g = G()

    def face(cubics):
        poly = []
        for a, c1, c2, b in cubics:
            poly.extend(cubic_pts(svg_xy(*a), svg_xy(*c1), svg_xy(*c2), svg_xy(*b), 7))
        g.loop(poly, 16, fill=True)

    face(
        [
            ((188, 70), (155, 95), (132, 140), (138, 185)),
            ((138, 185), (142, 220), (155, 245), (168, 268)),
            ((168, 268), (175, 280), (172, 295), (160, 308)),
            ((160, 308), (175, 300), (190, 288), (198, 272)),
            ((198, 272), (210, 290), (225, 305), (235, 318)),
            ((235, 318), (242, 290), (248, 255), (245, 220)),
            ((245, 220), (242, 175), (225, 115), (188, 70)),
        ]
    )
    face(
        [
            ((332, 68), (365, 93), (388, 138), (382, 183)),
            ((382, 183), (378, 218), (365, 243), (352, 266)),
            ((352, 266), (345, 278), (348, 293), (360, 306)),
            ((360, 306), (345, 298), (330, 286), (322, 270)),
            ((322, 270), (310, 288), (295, 303), (285, 316)),
            ((285, 316), (278, 288), (272, 253), (275, 218)),
            ((275, 218), (278, 173), (295, 113), (332, 68)),
        ]
    )
    # ojos
    g.circ(*svg_xy(200, 175), 8, 8, "core", fill=True)
    g.circ(*svg_xy(320, 173), 8, 8, "core", fill=True)
    # malla al hub, como el SVG
    for a, c1, c2, b in (
        ((170, 150), (210, 180), (230, 190), (260, 200)),
        ((350, 145), (310, 175), (290, 190), (260, 200)),
        ((175, 250), (210, 235), (235, 215), (260, 200)),
        ((345, 245), (310, 230), (285, 215), (260, 200)),
    ):
        g.lines([svg_xy(*a), svg_xy(*c1), svg_xy(*c2), svg_xy(*b)], 16, "tick")
    g.line(svg_xy(260, 200), svg_xy(260, 330), 16, "tick")
    g.hub_at(*svg_xy(260, 200))
    return g


def ico_mundo():
    """Globo con meridianos y paralelos visibles (misma familia que alcance-global)."""
    g = G()
    R = 168
    g.circ(CX, CY, R, 36, fill=False)
    for lon in (-1.05, -0.52, 0.0, 0.52, 1.05):
        pts = []
        for i in range(18):
            lat = -math.pi / 2 + math.pi * i / 17
            x = CX + R * math.cos(lat) * math.sin(lon)
            y = CY + R * math.sin(lat)
            pts.append((x, y))
        g.lines(pts, 18, "tick")
    for lat in (-0.85, -0.42, 0.0, 0.42, 0.85):
        pts = []
        for i in range(22):
            lon = -math.pi / 2 + math.pi * i / 21
            rr = R * math.cos(lat)
            x = CX + rr * math.sin(lon)
            y = CY + R * math.sin(lat)
            if math.hypot(x - CX, y - CY) <= R + 2:
                pts.append((x, y))
        if len(pts) > 3:
            g.lines(pts, 18, "tick")
    g.hub_at()
    return g


ICONS = {
    "caras": ico_caras,
    "mundo": ico_mundo,
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
            sizes.append(6.8)
        elif k == "core":
            sizes.append(random.choice([2.8, 3.4, 4.0]))
        elif k == "needle":
            sizes.append(random.choice([2.6, 3.2, 3.8]))
        elif k == "rim":
            sizes.append(random.choice([2.1, 2.5, 2.9, 3.3]))
        elif k == "fill":
            sizes.append(random.choice([1.7, 2.1, 2.5]))
        elif k == "float":
            sizes.append(random.choice([1.6, 2.0, 2.4]))
        else:
            sizes.append(random.choice([2.2, 2.7, 3.2]))
    return sizes


def build_edges(pts, kinds, chains):
    n = len(pts)
    edges = set()

    def add(i, j):
        if i == j:
            return
        a, b = (i, j) if i < j else (j, i)
        edges.add((a, b))

    for idx, closed in chains:
        m = len(idx)
        last = m if closed else m - 1
        for i in range(last):
            add(idx[i], idx[(i + 1) % m])

    fill_like = {"fill", "core", "rim", "needle"}
    for i in range(n):
        if kinds[i] == "float":
            dists = sorted(
                ((dist(pts[i], pts[j]), j) for j in range(n) if i != j and kinds[j] == "float")
            )
            for d, j in dists[:2]:
                if d < 48:
                    add(i, j)
            continue
        if kinds[i] not in fill_like:
            continue
        dists = sorted(((dist(pts[i], pts[j]), j) for j in range(n) if i != j))
        cap = 4 if kinds[i] == "fill" else 2
        lim = 48 if kinds[i] == "fill" else 36
        c = 0
        for d, j in dists:
            if d > lim:
                break
            if kinds[j] in ("float", "hub", "tick"):
                continue
            if kinds[i] != "fill" and kinds[j] != "fill":
                continue
            add(i, j)
            c += 1
            if c >= cap:
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
    # Armado más lento y suave para poder leer la figura mientras aparece.
    if t < 0.28:
        return 0.0
    if t < 5.4:
        u = (t - 0.28) / 5.12
        return 0.40 * ease_out(u) + 0.60 * ease_io(u)
    if t < 11.1:
        return 1.0
    if t < 15.35:
        return 1.0 - ease_io((t - 11.1) / 4.25)
    return 0.0


def clamp_ell(sx, sy, r):
    if sx + r < -3 or sy + r < -3 or sx - r > W + 3 or sy - r > H + 3:
        return None
    r = max(0.5, r)
    return [sx - r, sy - r, sx + r, sy + r]


KIND_LAG = {
    "rim": 0.00,
    "tick": 0.01,
    "needle": 0.02,
    "core": 0.02,
    "hub": 0.03,
    "fill": 0.05,
    "float": 0.12,
}


def prepare(name):
    random.seed(21 + sum(map(ord, name)) % 90)
    g = ICONS[name]()
    stamp_fill(g)
    floaters(g)
    pts, kinds, chains = g.pts, g.kinds, g.chains
    n = len(pts)
    sizes = sizes_for(kinds)
    phases = []
    for k in kinds:
        ph = random.random() * math.pi * 2
        if k == "rim":
            phases.append((ph, random.uniform(0.28, 0.48), random.uniform(0.05, 0.12)))
        elif k == "fill":
            phases.append((ph, random.uniform(0.36, 0.62), random.uniform(0.12, 0.26)))
        elif k == "float":
            phases.append((ph, random.uniform(0.40, 0.72), random.uniform(0.28, 0.55)))
        else:
            phases.append((ph, random.uniform(0.30, 0.52), random.uniform(0.07, 0.16)))
    scatter = []
    for i in range(n):
        if kinds[i] == "float":
            ang = random.random() * math.pi * 2
            d0 = random.uniform(260, 410)
            scatter.append((CX + math.cos(ang) * d0, CY + math.sin(ang) * d0 * 0.72))
            continue
        # Condensa desde una copia un poco más grande de la misma silueta
        # (se lee la figura mientras se arma, como las caras).
        vx, vy = pts[i][0] - CX, pts[i][1] - CY
        scale = random.uniform(1.48, 2.05)
        jit = random.uniform(-0.10, 0.10)
        ca, sa = math.cos(jit), math.sin(jit)
        scatter.append((CX + (ca * vx - sa * vy) * scale, CY + (sa * vx + ca * vy) * scale * 0.98))
    edges = build_edges(pts, kinds, chains)
    chain_set = set()
    for idx, closed in chains:
        m = len(idx)
        last = m if closed else m - 1
        for i in range(last):
            a, b = idx[i], idx[(i + 1) % m]
            chain_set.add((a, b) if a < b else (b, a))
    print(f"{name}: nodes {n} edges {len(edges)} chains {len(chains)} { {k: kinds.count(k) for k in sorted(set(kinds))} }")
    return pts, kinds, sizes, phases, scatter, edges, chain_set


def render_frame(t, pts, kinds, sizes, phases, scatter, edges, chain_set):
    n = len(pts)
    form = form_amount(t)
    layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    draw = ImageDraw.Draw(layer, "RGBA")
    hold = 1.0 if form > 0.72 else max(0.0, (form - 0.45) / 0.27)
    breath = 1.0 + 0.016 * math.sin(t * 0.85) * hold
    locals_u, pos = [], []
    for i in range(n):
        lag = KIND_LAG.get(kinds[i], 0.04)
        lu = ease_io(max(0.0, min(1.0, form * 1.06 - lag)))
        locals_u.append(lu)
        ph, freq, amp = phases[i]
        tx, ty = pts[i]
        if kinds[i] != "float":
            tx = CX + (tx - CX) * breath
            ty = CY + (ty - CY) * breath
        if form > 0.62 and kinds[i] != "hub":
            j = amp * hold
            tx += j * math.sin(t * freq + ph)
            ty += j * 0.62 * math.cos(t * freq * 0.9 + ph)
        sx, sy = scatter[i]
        push = 1.0 + 0.35 * (1 - form) if t >= 11.1 else 1.0
        sx = W / 2 + (sx - W / 2) * push
        sy = H / 2 + (sy - H / 2) * push
        pos.append((sx + (tx - sx) * lu, sy + (ty - sy) * lu))

    for a, b in edges:
        uu = min(locals_u[a], locals_u[b])
        if uu < 0.12:
            continue
        xa, ya = pos[a]
        xb, yb = pos[b]
        key = (a, b) if a < b else (b, a)
        is_chain = key in chain_set
        span2 = (xa - xb) ** 2 + (ya - yb) ** 2
        if not is_chain and span2 > 72**2:
            continue
        if is_chain and span2 > 170**2:
            continue
        depth = 1 - min(1, math.hypot((xa + xb) / 2 - CX, (ya + yb) / 2 - CY) / 340)
        if is_chain:
            depth = max(depth, 0.88)
            boost = 1.55
        elif kinds[a] == "fill" or kinds[b] == "fill":
            boost = 0.58
        else:
            boost = 0.9
        alpha = int((55 + 165 * depth) * uu * boost)
        if alpha < 8:
            continue
        r = int(LINE_FAR[0] + (LINE[0] - LINE_FAR[0]) * depth)
        gv = int(LINE_FAR[1] + (LINE[1] - LINE_FAR[1]) * depth)
        bl = int(LINE_FAR[2] + (LINE[2] - LINE_FAR[2]) * depth)
        draw.line([(xa, ya), (xb, yb)], fill=(r, gv, bl, min(235, alpha)), width=2 if is_chain else 1)

    glow = {"hub", "rim", "core", "needle", "tick"}
    for i in sorted(range(n), key=lambda i: (1 if kinds[i] == "hub" else 0, -sizes[i])):
        uu = locals_u[i]
        if uu < 0.03:
            continue
        x, y = pos[i]
        rad = sizes[i] * (0.4 + 0.6 * uu)
        if kinds[i] in glow:
            box = clamp_ell(x, y, rad * 2.2)
            if box:
                draw.ellipse(box, fill=(*GLOW, int(36 * uu)))
        box = clamp_ell(x, y, rad)
        if box:
            col = NODE if kinds[i] != "float" else NODE_DIM
            draw.ellipse(box, fill=(*col, min(255, int(215 * uu))))

    if "hub" in kinds:
        i = kinds.index("hub")
        if locals_u[i] > 0.22:
            x, y = pos[i]
            a = locals_u[i]
            draw.ellipse([x - 6.2, y - 6.2, x + 6.2, y + 6.2], fill=(9, 25, 20, int(255 * a)))
            draw.ellipse([x - 3.2, y - 3.2, x + 3.2, y + 3.2], fill=(*NODE, int(255 * a)))

    base = Image.new("RGBA", (W, H), (0, 0, 0, 255))
    return Image.alpha_composite(base, layer).convert("RGB")


def render_preview(name, out_path):
    data = prepare(name)
    img = render_frame(7.2, *data)
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
