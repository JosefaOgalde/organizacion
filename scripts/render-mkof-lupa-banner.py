#!/usr/bin/env python3
"""
Lupa mesh — misma estructura que caras + mundo:
silueta clara (aro + mango), malla triangular densa (plexus),
nodos en vértices, densidad mayor en el aro (como rasgos / continentes).
Verde neón / negro · bucle armar/desarmar 16s · 798×570.

Uso:
  python3 scripts/render-mkof-lupa-banner.py --preview
  python3 scripts/render-mkof-lupa-banner.py
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

# Lente un poco a la izquierda/arriba para que el mango quepa
LX, LY = 348.0, 252.0
R_OUT = 152.0
R_IN = 126.0
HANDLE_ANG = math.radians(42)
HANDLE_LEN = 198.0
HANDLE_HALF = 16.0

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
ASSET_DIR = os.path.join(ROOT, "index/clientes/mkof/sitio-web/assets")
OUT_MP4 = os.path.join(ASSET_DIR, "seo-geo-lupa-banner-verde.mp4")


def glass_point(ang: float, r: float) -> tuple[float, float]:
    return (LX + math.cos(ang) * r, LY + math.sin(ang) * r)


def along(a: tuple[float, float], b: tuple[float, float], u: float) -> tuple[float, float]:
    return (a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u)


def densify_line(a, b, step: float) -> list[tuple[float, float]]:
    dist = math.hypot(b[0] - a[0], b[1] - a[1])
    steps = max(1, int(dist / step))
    return [along(a, b, k / steps) for k in range(steps)]


def in_lens(x: float, y: float) -> bool:
    return math.hypot(x - LX, y - LY) <= R_IN - 2


def handle_frame():
    """Par de rieles del mango + tapón, desde el aro hacia abajo-derecha."""
    ux, uy = math.cos(HANDLE_ANG), math.sin(HANDLE_ANG)
    px, py = -uy, ux  # perpendicular
    start = glass_point(HANDLE_ANG, R_OUT - 6)
    end = (start[0] + ux * HANDLE_LEN, start[1] + uy * HANDLE_LEN)
    r1a = (start[0] + px * HANDLE_HALF, start[1] + py * HANDLE_HALF)
    r1b = (end[0] + px * HANDLE_HALF, end[1] + py * HANDLE_HALF)
    r2a = (start[0] - px * HANDLE_HALF, start[1] - py * HANDLE_HALF)
    r2b = (end[0] - px * HANDLE_HALF, end[1] - py * HANDLE_HALF)
    return start, end, r1a, r1b, r2a, r2b, (ux, uy), (px, py)


def build_points(seed: int = 21):
    random.seed(seed)
    start, end, r1a, r1b, r2a, r2b, (ux, uy), (px, py) = handle_frame()

    pts: list[tuple[float, float]] = []
    kinds: list[str] = []

    # 1) Aro exterior — silueta (costa)
    n_out = 52
    for i in range(n_out):
        ang = 2 * math.pi * i / n_out
        pts.append(glass_point(ang, R_OUT))
        kinds.append("rim")

    # 2) Aro interior — borde del cristal
    n_in = 44
    for i in range(n_in):
        ang = 2 * math.pi * i / n_in + 0.04
        pts.append(glass_point(ang, R_IN))
        kinds.append("rim")

    # 3) Grosor del marco (entre aros)
    for i in range(22):
        ang = 2 * math.pi * i / 22 + 0.11
        r = random.uniform(R_IN + 6, R_OUT - 5)
        pts.append(glass_point(ang, r))
        kinds.append("rim")

    # 4) Brillo especular (arco superior-izquierdo, lectura de cristal)
    for i in range(10):
        ang = math.radians(200) + math.radians(55) * i / 9
        pts.append(glass_point(ang, R_IN - 10 - (3 if i in (3, 4, 5) else 0)))
        kinds.append("core")

    # 5) Interior del cristal — más ralo que el aro (como océanos)
    for _ in range(36):
        a = random.uniform(0, 2 * math.pi)
        r = math.sqrt(random.random()) * (R_IN - 22)
        x, y = LX + math.cos(a) * r, LY + math.sin(a) * r
        if in_lens(x, y):
            pts.append((x, y))
            kinds.append("glass")

    # 6) Cúmulo «lo que se busca» — densidad tipo rasgos/continentes
    fx, fy = LX - 18, LY + 6
    for _ in range(16):
        x = fx + random.uniform(-28, 28)
        y = fy + random.uniform(-24, 24)
        if in_lens(x, y):
            pts.append((x, y))
            kinds.append("core")

    # 7) Nodo mint — foco de la lupa
    pts.append((LX, LY))
    kinds.append("hub")

    # 8) Virola (unión aro-mango) — densa como la base de la ampolleta
    for i in range(22):
        t = i / 21
        along_v = -10 + t * 36
        across = ((i % 5) - 2) / 2 * (HANDLE_HALF + 2)
        x = start[0] + ux * along_v + px * across
        y = start[1] + uy * along_v + py * across
        pts.append((x, y))
        kinds.append("ferrule")

    # 9) Rieles del mango (más densos para que el palo se lea)
    for p0, p1 in ((r1a, r1b), (r2a, r2b)):
        for q in densify_line(p0, p1, step=12):
            pts.append(q)
            kinds.append("handle")
    # eje central
    for q in densify_line(start, end, step=18):
        pts.append(q)
        kinds.append("handle")
    # travesaños
    for i in range(8):
        u = 0.10 + 0.82 * i / 7
        a = along(r1a, r1b, u)
        b = along(r2a, r2b, u)
        pts.append(along(a, b, 0.5))
        kinds.append("handle")
        pts.append(along(a, b, 0.18))
        kinds.append("handle")
        pts.append(along(a, b, 0.82))
        kinds.append("handle")

    # 10) Tapón redondeado
    for i in range(10):
        ang = HANDLE_ANG - math.pi / 2 + math.pi * i / 9
        pts.append((end[0] + math.cos(ang) * HANDLE_HALF, end[1] + math.sin(ang) * HANDLE_HALF))
        kinds.append("tip")
    pts.append(end)
    kinds.append("tip")

    # 11) Fragmentos sueltos (firma caras)
    for _ in range(10):
        a = random.uniform(-0.55, math.pi + 0.55)
        r = random.uniform(195, 245)
        pts.append((LX + math.cos(a) * r, LY + math.sin(a) * r * 0.82))
        kinds.append("float")

    min_d = {
        "rim": 42,
        "glass": 62,
        "core": 38,
        "ferrule": 28,
        "handle": 32,
        "tip": 32,
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
            sizes.append(6.2)
        elif k == "rim":
            sizes.append(random.choice([2.6, 3.0, 3.5, 4.2, 4.8]))
        elif k in ("core", "ferrule"):
            sizes.append(random.choice([2.4, 2.8, 3.4, 4.0]))
        elif k in ("handle", "tip"):
            sizes.append(random.choice([2.3, 2.7, 3.2, 3.8]))
        elif k == "float":
            sizes.append(random.choice([1.7, 2.1, 2.6]))
        else:
            sizes.append(random.choice([2.0, 2.4, 2.8, 3.2]))
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
        elif kinds[i] in ("core", "ferrule", "handle", "tip"):
            max_deg, lim = 6, 70**2
        elif kinds[i] == "float":
            max_deg, lim = 2, 48**2
        else:
            max_deg, lim = 6, 70**2
        c = 0
        for d2, j in dists:
            if d2 > lim:
                break
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
        if kinds[i] in ("rim", "glass", "core", "hub"):
            tx = LX + (tx - LX) * breath
            ty = LY + (ty - LY) * breath
        if form > 0.55 and kinds[i] != "hub":
            tx += amp * math.sin(t * freq * 1.55 + ph)
            ty += amp * 0.65 * math.cos(t * freq * 1.25 + ph)
        sx, sy = scatter[i]
        push = 1.0 + 0.45 * (1 - form) if t >= 10.2 else 1.0
        cx, cy = W / 2.0, H / 2.0
        sx = cx + (sx - cx) * push
        sy = cy + (sy - cy) * push
        pos.append((sx + (tx - sx) * lu, sy + (ty - sy) * lu))

    for a, b in edges:
        uu = min(locals_u[a], locals_u[b])
        if uu < 0.38:
            continue
        xa, ya = pos[a]
        xb, yb = pos[b]
        if (xa - xb) ** 2 + (ya - yb) ** 2 > 88**2:
            continue
        midx, midy = (xa + xb) / 2, (ya + yb) / 2
        dist_lens = math.hypot(midx - LX, midy - (LY - 8))
        depth = 1 - min(1, dist_lens / 320)
        sil = {"rim", "ferrule", "handle", "tip"}
        if kinds[a] in sil or kinds[b] in sil:
            depth = max(depth, 0.78)
            boost = 1.25
        else:
            boost = 1.0
        if kinds[a] in ("core", "ferrule") or kinds[b] in ("core", "ferrule"):
            boost *= 1.08
        alpha = int((55 + 145 * depth) * uu * uu * boost)
        if alpha < 8:
            continue
        r = int(LINE_FAR[0] + (LINE[0] - LINE_FAR[0]) * depth)
        g = int(LINE_FAR[1] + (LINE[1] - LINE_FAR[1]) * depth)
        bl = int(LINE_FAR[2] + (LINE[2] - LINE_FAR[2]) * depth)
        draw.line([(xa, ya), (xb, yb)], fill=(r, g, bl, min(225, alpha)), width=1)

    glow_kinds = ("hub", "rim", "core", "ferrule", "handle", "tip")
    for i in sorted(range(n), key=lambda i: (0 if kinds[i] == "hub" else 1, -sizes[i])):
        uu = locals_u[i]
        if uu < 0.03:
            continue
        x, y = pos[i]
        rad = sizes[i] * (0.4 + 0.6 * uu)
        if kinds[i] in glow_kinds:
            box = clamp_ell(x, y, rad * 2.35)
            if box:
                ga = 48 if kinds[i] in ("rim", "core") else 32
                draw.ellipse(box, fill=(*GLOW, int(ga * uu)))
        box = clamp_ell(x, y, rad)
        if box:
            col = NODE if kinds[i] != "float" else NODE_DIM
            draw.ellipse(box, fill=(*col, min(255, int(210 * uu))))

    i = kinds.index("hub")
    if locals_u[i] > 0.25:
        x, y = pos[i]
        draw.ellipse([x - 5, y - 5, x + 5, y + 5], fill=(9, 25, 20, int(255 * locals_u[i])))
        draw.ellipse([x - 2.8, y - 2.8, x + 2.8, y + 2.8], fill=(*NODE, int(255 * locals_u[i])))

    base = Image.new("RGBA", (W, H), (0, 0, 0, 255))
    composed = Image.alpha_composite(base, layer).convert("RGB")
    if locals_only:
        return composed, form
    return composed


def prepare():
    pts, kinds = build_points()
    n = len(pts)
    random.seed(21)
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
        "ferrule": 1,
        "handle": 2,
        "tip": 3,
        "core": 4,
        "glass": 5,
        "hub": 6,
        "float": 7,
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
    print(f"preview form={form:.2f} → {out_path}")


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
    p.add_argument("--preview-out", default="/tmp/mkof-lupa-formado.png")
    p.add_argument("--frames", default="/tmp/mkof-lupa-frames")
    p.add_argument("--out", default=OUT_MP4)
    args = p.parse_args()
    if args.preview:
        render_preview(args.preview_out)
        return 0
    render_video(args.frames, args.out)
    return 0


if __name__ == "__main__":
    sys.exit(main())
