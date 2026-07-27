#!/usr/bin/env python3
"""
Monta la pieza 1080×1920 con la FOTO REAL del porta completos bulldog
(sin regenerar el producto con IA).

Uso (PC):
  1) Guardá la foto del producto como:
       index\\clientes\\impresoreando\\piezas\\foto-producto-bulldog.jpg
     (también busca en Descargas si no está)
  2) python scripts/montar-pieza-porta-completos-bulldog.py

Salida:
  index/clientes/impresoreando/piezas/porta-completos-bulldog-1080x1920.png
"""
from __future__ import annotations

import os
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageOps

ROOT = Path(__file__).resolve().parents[1]
PIEZAS = ROOT / "index" / "clientes" / "impresoreando" / "piezas"
OUT = PIEZAS / "porta-completos-bulldog-1080x1920.png"
W, H = 1080, 1920
BG = (232, 220, 200)  # beige identidad
INK = (62, 42, 28)  # café tipografía


def candidatos_foto() -> list[Path]:
    downloads = Path(os.environ.get("USERPROFILE") or os.environ.get("HOME") or "") / "Downloads"
    names = [
        "foto-producto-bulldog.jpg",
        "foto-producto-bulldog.jpeg",
        "foto-producto-bulldog.png",
        "porta-completos-bulldog.jpg",
        "porta-completos-bulldog.jpeg",
        "porta-completos-bulldog.png",
    ]
    paths: list[Path] = []
    for base in (PIEZAS, downloads):
        if not base.exists():
            continue
        for n in names:
            p = base / n
            if p.is_file():
                paths.append(p)
    return paths


def font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    candidates = [
        "C:/Windows/Fonts/georgia.ttf",
        "C:/Windows/Fonts/times.ttf",
        "C:/Windows/Fonts/timesbd.ttf" if bold else None,
        "/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf" if bold else "/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSerif-Bold.ttf" if bold else "/usr/share/fonts/truetype/liberation/LiberationSerif-Regular.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
    ]
    for c in candidates:
        if c and Path(c).is_file():
            try:
                return ImageFont.truetype(c, size)
            except OSError:
                pass
    return ImageFont.load_default()


def text_size(draw: ImageDraw.ImageDraw, text: str, fnt) -> tuple[int, int]:
    box = draw.textbbox((0, 0), text, font=fnt)
    return box[2] - box[0], box[3] - box[1]


def main() -> int:
    fotos = candidatos_foto()
    if not fotos:
        print(
            "[error] No encontré la foto del producto.\n"
            "  Guardala como:\n"
            f"    {PIEZAS / 'foto-producto-bulldog.jpg'}\n"
            "  o en Descargas con el mismo nombre, y re-ejecutá."
        )
        return 1

    foto_path = fotos[0]
    print("[foto]", foto_path)
    product = Image.open(foto_path).convert("RGBA")

    # Recorte centrado suave: quitar bordes extremos si hay mucha pared/mano
    # (no inventa el producto: solo encuadra)
    pw, ph = product.size
    # Si la foto es muy vertical con mucha pared arriba, recortar un poco arriba/abajo
    top = int(ph * 0.02)
    bottom = int(ph * 0.98)
    left = int(pw * 0.02)
    right = int(pw * 0.98)
    product = product.crop((left, top, right, bottom))

    canvas = Image.new("RGB", (W, H), BG)
    draw = ImageDraw.Draw(canvas)

    title_f = font(92, bold=True)
    sub_f = font(36, bold=False)
    foot_f = font(28, bold=False)

    title = "Porta completos"
    sub = "El bulldog que cuida tu completo"
    foot = "Hecho a pedido"

    tw, th = text_size(draw, title, title_f)
    sw, sh = text_size(draw, sub, sub_f)
    fw, fh = text_size(draw, foot, foot_f)

    draw.text(((W - tw) / 2, 110), title, font=title_f, fill=INK)
    draw.text(((W - sw) / 2, 110 + th + 18), sub, font=sub_f, fill=INK)

    # Zona producto
    top_zone = 110 + th + 18 + sh + 50
    bottom_zone = H - 160
    max_w = int(W * 0.86)
    max_h = bottom_zone - top_zone
    product_fit = ImageOps.contain(product, (max_w, max_h), Image.Resampling.LANCZOS)

    # Sombra suave
    shadow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    sx = (W - product_fit.width) // 2 + 12
    sy = top_zone + (max_h - product_fit.height) // 2 + 18
    sh_img = Image.new("RGBA", product_fit.size, (0, 0, 0, 55))
    shadow.paste(sh_img, (sx, sy), sh_img)
    shadow = shadow.filter(ImageFilter.GaussianBlur(18))
    canvas = Image.alpha_composite(canvas.convert("RGBA"), shadow).convert("RGB")
    draw = ImageDraw.Draw(canvas)

    px = (W - product_fit.width) // 2
    py = top_zone + (max_h - product_fit.height) // 2
    if product_fit.mode == "RGBA":
        canvas.paste(product_fit, (px, py), product_fit)
    else:
        canvas.paste(product_fit.convert("RGB"), (px, py))

    # Footer
    fy = H - 100
    line_y = fy + fh // 2
    gap = 24
    lx1, lx2 = 80, (W - fw) // 2 - gap
    rx1, rx2 = (W + fw) // 2 + gap, W - 80
    draw.line((lx1, line_y, lx2, line_y), fill=INK, width=2)
    draw.line((rx1, line_y, rx2, line_y), fill=INK, width=2)
    draw.text(((W - fw) / 2, fy), foot, font=foot_f, fill=INK)

    PIEZAS.mkdir(parents=True, exist_ok=True)
    canvas.save(OUT, "PNG", optimize=True)
    # alias viejo
    alias = PIEZAS / "porta-celular-bulldog-1080x1920.png"
    canvas.save(alias, "PNG", optimize=True)
    print("[ok]", OUT, f"{W}x{H}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
