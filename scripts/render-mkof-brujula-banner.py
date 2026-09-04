#!/usr/bin/env python3
"""
Brujula mesh — misma estructura que caras + mundo + lupa:
silueta clara (aro + marcas cardinales + aguja al norte),
malla triangular densa (plexus), nodos en vertices.
Verde neon / negro · bucle armar/desarmar 16s · 798x570.

Uso:
  python3 scripts/render-mkof-brujula-banner.py --preview
  python3 scripts/render-mkof-brujula-banner.py
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

LINE, LINE_FAR = (70, 200, 55), (28, 95, 26)
NODE, NODE_DIM, GLOW = (163, 255, 96), (55, 130, 42), (35, 85, 22)

CX, CY = W / 2.0, H / 2.0 - 4
R_OUT = 188.0
R_IN = 160.0

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
ASSET_DIR = os.path.join(ROOT, "index/clientes/mkof/sitio-web/assets")
OUT_MP4 = os.path.join(ASSET_DIR, "seo-geo-brujula-banner-verde.mp4")


def polar(ang: float, r: float) -> tuple[float, float]:
    return (CX + math.cos(ang) * r, CY + math.sin(ang) * r)


def along(a, b, u: float) -> tuple[float, float]:
    return (a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u)


def densify_line(a, b, step: float) -> list[tuple[float, float]]:
    dist = math.hypot(b[0] - a[0], b[1] - a[1])
    steps = max(1, int(dist / step))
    return [along(a, b, k / steps) for k in range(steps)]


def densify_closed(poly, step: float) -> list[tuple[float, float]]:
    out = []
    n = len(poly)
    for i in range(n):
        out.extend(densify_line(poly[i], poly[(i + 1) % n], step))
    return out


def build_points(seed: int = 34):
    random.seed(seed)
    pts: list[tuple[float, float]] = []
    kinds: list[str] = []

    # 1) Aro exterior (bezel)
    for i in range(56):
        pts.append(polar(2 * math.pi * i / 56, R_OUT))
        kinds.append("rim")

    # 2) Aro interior
    for i in range(46):
        pts.append(polar(2 * math.pi * i / 46 + 0.03, R_IN))
        kinds.append("rim")

    # 3) Grosor del marco
    for i in range(20):
        ang = 2 * math.pi * i / 20 + 0.1
        r = random.uniform(R_IN + 6, R_OUT - 5)
        pts.append(polar(ang, r))
        kinds.append("rim")

    # 4) Marcas cardinales iguales en N/E/S/W (no un solo pip = no se lee como lupa)
    cardinals = [
        (-math.pi / 2, "N", 22, 9),
        (0.0, "E", 22, 9),
        (math.pi / 2, "S", 22, 9),
        (math.pi, "W", 22, 9),
    ]
    for ang, name, extra, half in cardinals:
        a = polar(ang, R_IN - 2)
        b = polar(ang, R_OUT + extra)
        for q in densify_line(a, b, step=8):
            pts.append(q)
            kinds.append("tick")
        px, py = -math.sin(ang), math.cos(ang)
        for s in (-half, 0, half):
            pts.append((b[0] + px * s, b[1] + py * s))
            kinds.append("tick")
        # triangulo hacia afuera en cada cardinal
        tip = polar(ang, R_OUT + extra + 14)
        bl = (b[0] + px * (half + 3), b[1] + py * (half + 3))
        br = (b[0] - px * (half + 3), b[1] - py * (half + 3))
        kind = "core" if name == "N" else "tick"
        for q in densify_closed([tip, bl, br], step=7):
            pts.append(q)
            kinds.append(kind)
        pts.append(tip)
        kinds.append(kind)

    # 5) Intercardinales cortas
    for k in range(4):
        ang = -math.pi / 2 + math.pi / 4 + k * math.pi / 2
        a = polar(ang, R_IN + 10)
        b = polar(ang, R_OUT + 4)
        for q in densify_line(a, b, step=10):
            pts.append(q)
            kinds.append("tick")

    # 6) Rosa de 4 puntas: SOLO contorno, hueco negro entre brazos (centro legible)
    n_tip = polar(-math.pi / 2, 118)
    s_tip = polar(math.pi / 2, 76)
    e_tip = polar(0.0, 66)
    w_tip = polar(math.pi, 66)
    n_l, n_r = (CX - 13, CY - 28), (CX + 13, CY - 28)
    s_l, s_r = (CX - 9, CY + 28), (CX + 9, CY + 28)
    e_t, e_b = (CX + 28, CY - 9), (CX + 28, CY + 9)
    w_t, w_b = (CX - 28, CY - 9), (CX - 28, CY + 9)

    def outline_tri(tip, a, b, step=5.5):
        for q in densify_closed([tip, a, b], step=step):
            pts.append(q)
            kinds.append("needle")
        # una sola costilla al eje, sin relleno
        mid = along(a, b, 0.5)
        for q in densify_line(tip, mid, step=8):
            pts.append(q)
            kinds.append("needle")

    outline_tri(n_tip, n_l, n_r)
    outline_tri(s_tip, s_l, s_r)
    outline_tri(e_tip, e_t, e_b)
    outline_tri(w_tip, w_t, w_b)

    # 7) Anillo del pivote — circulo vacio, separado de la rosa
    for i in range(18):
        pts.append(polar(2 * math.pi * i / 18, 22))
        kinds.append("pivot")

    # 8) Hub
    pts.append((CX, CY))
    kinds.append("hub")

    # 9) Floaters
    for _ in range(10):
        a = random.uniform(-0.4, math.pi + 0.4)
        r = random.uniform(230, 280)
        pts.append((CX + math.cos(a) * r, CY + math.sin(a) * r * 0.78))
        kinds.append("float")

    min_d = {
        "rim": 42,
        "tick": 30,
        "core": 26,
        "needle": 16,
        "pivot": 14,
        "hub": 0,
        "float": 55,
    }
    final, fk = [], []
    for p, k in zip(pts, kinds):
        md = min_d.get(k, 48)
        if k == "hub" or all((p[0] - q[0]) ** 2 + (p[1] - q[1]) ** 2 > md for q in final):
            final.append(p)
            fk.append(k)
    return final, fk


def sizes_for(kinds: list[str]) -> list[float]:
    sizes = []
    for k in kinds:
        if k == "hub":
            sizes.append(8.2)
        elif k == "pivot":
            sizes.append(random.choice([2.8, 3.2, 3.8]))
        elif k == "core":
            sizes.append(random.choice([3.2, 3.8, 4.4, 5.0]))
        elif k == "needle":
            sizes.append(random.choice([3.2, 3.8, 4.6, 5.2]))
        elif k == "tick":
            sizes.append(random.choice([2.4, 2.9, 3.5, 4.0]))
        elif k == "rim":
            sizes.append(random.choice([2.6, 3.0, 3.5, 4.2, 4.8]))
        elif k == "float":
            sizes.append(random.choice([1.7, 2.1, 2.6]))
        else:
            sizes.append(random.choice([2.0, 2.4, 2.8, 3.2]))
    return sizes


def build_edges(pts, kinds):
    n = len(pts)
    # El centro (aguja + pivote) no se ata al aro: asi se lee nítido.
    family = {
        "needle": "center",
        "pivot": "center",
        "hub": "center",
        "rim": "bezel",
        "tick": "bezel",
        "core": "bezel",
        "float": "float",
    }
    edges = set()
    for i in range(n):
        dists = sorted(
            (((pts[i][0] - pts[j][0]) ** 2 + (pts[i][1] - pts[j][1]) ** 2), j)
            for j in range(n)
            if i != j
        )
        if kinds[i] == "rim":
            max_deg, lim = 7, 68**2
        elif kinds[i] in ("needle", "pivot"):
            max_deg, lim = 6, 52**2
        elif kinds[i] in ("tick", "core"):
            max_deg, lim = 6, 64**2
        elif kinds[i] == "hub":
            max_deg, lim = 8, 36**2
        elif kinds[i] == "float":
            max_deg, lim = 2, 48**2
        else:
            max_deg, lim = 5, 62**2
        c = 0
        for d2, j in dists:
            if d2 > lim:
                break
            if family.get(kinds[i]) != family.get(kinds[j]):
                continue
            a, b = (i, j) if i < j else (j, i)
            edges.add((a, b))
            c += 1
            if c >= max_deg:
                break
    return list(edges)


def ease_out(u: float) -> float:
    u = max(0, min(1, u))
    return 1 - (1 - u) ** 3


def ease_in(u: float) -> float:
    u = max(0, min(1, u))
    return u**3


def ease_io(u: float) -> float:
    u = max(0, min(1, u))
    return u * u * (3 - 2 * u)


def form_amount(t: float) -> float:
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


def render_frame(t, pts, kinds, sizes, phases, scatter, edges, rank, locals_only=False):
    n = len(pts)
    form = form_amount(t)
    layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    draw = ImageDraw.Draw(layer, "RGBA")

    breath = 1.0
    if form > 0.75:
        breath = 1.0 + 0.012 * math.sin(t * 1.1)

    locals_u = []
    pos = []
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
            wiggle = 0.18 if kinds[i] == "needle" else amp
            tx += wiggle * math.sin(t * freq * 1.55 + ph)
            ty += wiggle * 0.65 * math.cos(t * freq * 1.25 + ph)
        sx, sy = scatter[i]
        push = 1.0 + 0.45 * (1 - form) if t >= 10.2 else 1.0
        cx, cy = W / 2.0, H / 2.0
        sx = cx + (sx - cx) * push
        sy = cy + (sy - cy) * push
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
        midx, midy = (xa + xb) / 2, (ya + yb) / 2
        dist = math.hypot(midx - CX, midy - CY)
        depth = 1 - min(1, dist / 340)
        if kinds[a] in sil or kinds[b] in sil:
            depth = max(depth, 0.84)
            boost = 1.28
        else:
            boost = 1.0
        if kinds[a] in ("needle", "pivot", "hub") or kinds[b] in ("needle", "pivot", "hub"):
            boost *= 1.22
            depth = max(depth, 0.92)
        alpha = int((55 + 145 * depth) * uu * uu * boost)
        if alpha < 8:
            continue
        r = int(LINE_FAR[0] + (LINE[0] - LINE_FAR[0]) * depth)
        g = int(LINE_FAR[1] + (LINE[1] - LINE_FAR[1]) * depth)
        bl = int(LINE_FAR[2] + (LINE[2] - LINE_FAR[2]) * depth)
        draw.line([(xa, ya), (xb, yb)], fill=(r, g, bl, min(235, alpha)), width=1)

    glow_kinds = ("hub", "rim", "core", "needle", "tick", "pivot")
    for i in sorted(range(n), key=lambda i: (1 if kinds[i] == "hub" else 0, -sizes[i])):
        uu = locals_u[i]
        if uu < 0.03:
            continue
        x, y = pos[i]
        rad = sizes[i] * (0.4 + 0.6 * uu)
        if kinds[i] in glow_kinds:
            box = clamp_ell(x, y, rad * 2.35)
            if box:
                ga = 52 if kinds[i] in ("needle", "core") else 36
                draw.ellipse(box, fill=(*GLOW, int(ga * uu)))
        box = clamp_ell(x, y, rad)
        if box:
            col = NODE if kinds[i] != "float" else NODE_DIM
            draw.ellipse(box, fill=(*col, min(255, int(210 * uu))))

    i = kinds.index("hub")
    if locals_u[i] > 0.25:
        x, y = pos[i]
        a = locals_u[i]
        draw.ellipse([x - 9, y - 9, x + 9, y + 9], fill=(9, 25, 20, int(255 * a)))
        draw.ellipse([x - 5.2, y - 5.2, x + 5.2, y + 5.2], fill=(*NODE, int(255 * a)))
        draw.ellipse([x - 2.2, y - 2.2, x + 2.2, y + 2.2], fill=(9, 25, 20, int(220 * a)))

    base = Image.new("RGBA", (W, H), (0, 0, 0, 255))
    composed = Image.alpha_composite(base, layer).convert("RGB")
    if locals_only:
        return composed, form
    return composed


def prepare():
    pts, kinds = build_points()
    n = len(pts)
    random.seed(34)
    sizes = sizes_for(kinds)
    phases = [
        (random.random() * math.pi * 2, random.uniform(0.5, 1.25), random.uniform(0.25, 0.9))
        for _ in range(n)
    ]
    cx, cy = W / 2.0, H / 2.0
    scatter = []
    for _i in range(n):
        ang = random.random() * math.pi * 2
        dist = random.uniform(270, 450)
        scatter.append((cx + math.cos(ang) * dist, cy + math.sin(ang) * dist * 0.72))
    edges = build_edges(pts, kinds)
    prio = {
        "rim": 0,
        "tick": 1,
        "core": 2,
        "needle": 3,
        "pivot": 4,
        "hub": 5,
        "float": 6,
    }
    order_build = sorted(range(n), key=lambda i: (prio.get(kinds[i], 9), i))
    rank = [0] * n
    for r, i in enumerate(order_build):
        rank[i] = r
    counts = {k: kinds.count(k) for k in sorted(set(kinds))}
    print(f"nodes {n} {counts}")
    print(f"edges {len(edges)}")
    return pts, kinds, sizes, phases, scatter, edges, rank


def render_preview(out_path: str):
    data = prepare()
    img, form = render_frame(6.5, *data, locals_only=True)
    os.makedirs(os.path.dirname(out_path) or ".", exist_ok=True)
    img.save(out_path)
    print(f"preview form={form:.2f} -> {out_path}")


def render_video(frames_dir: str, mp4_path: str):
    data = prepare()
    os.makedirs(frames_dir, exist_ok=True)
    for fi in range(NFRAMES):
        t = fi / FPS
        img = render_frame(t, *data)
        img.save(f"{frames_dir}/f{fi:04d}.png")
        if fi % 50 == 0:
            print("frame", fi, round(form_amount(t), 2))
    os.makedirs(os.path.dirname(mp4_path), exist_ok=True)
    cmd = [
        "ffmpeg",
        "-y",
        "-framerate",
        str(FPS),
        "-i",
        f"{frames_dir}/f%04d.png",
        "-c:v",
        "libx264",
        "-pix_fmt",
        "yuv420p",
        "-crf",
        "18",
        "-preset",
        "medium",
        "-movflags",
        "+faststart",
        mp4_path,
    ]
    subprocess.check_call(cmd)
    print("mp4", mp4_path, os.path.getsize(mp4_path))


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--preview", action="store_true")
    p.add_argument("--preview-out", default="/tmp/mkof-brujula-formado.png")
    p.add_argument("--frames", default="/tmp/mkof-brujula-frames")
    p.add_argument("--out", default=OUT_MP4)
    args = p.parse_args()
    if args.preview:
        render_preview(args.preview_out)
        return 0
    render_video(args.frames, args.out)
    return 0


if __name__ == "__main__":
    sys.exit(main())
