#!/usr/bin/env python3
"""Genera PNG + PDF de la tarjeta Josefa (polaroid) con WhatsApp en todo el PDF."""
from __future__ import annotations

import math
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont, ImageFilter
from pypdf import PdfReader, PdfWriter
from pypdf.generic import (
    ArrayObject,
    DictionaryObject,
    FloatObject,
    NameObject,
    NumberObject,
    TextStringObject,
)
from reportlab.lib.utils import ImageReader
from reportlab.pdfgen import canvas as pdfcanvas

ROOT = Path(__file__).resolve().parents[1]
PERFIL = ROOT / "index" / "assets" / "perfil"
PHOTO = PERFIL / "josefa-ogalde-foto-fuente.jpg"
WA = "https://wa.me/56966047614"
TEAL = (20, 184, 164)
TEAL_DEEP = (15, 118, 110)
INK = (20, 20, 20)
MUTED = (90, 90, 90)
WHITE = (255, 255, 255)


def font(size: int, bold: bool = False):
    candidates = [
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf",
    ]
    for p in candidates:
        if Path(p).exists():
            return ImageFont.truetype(p, size)
    return ImageFont.load_default()


def font_serif(size: int):
    for p in (
        "/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSerif-Regular.ttf",
    ):
        if Path(p).exists():
            return ImageFont.truetype(p, size)
    return font(size)


def cover_crop(im: Image.Image, tw: int, th: int, focus_y: float = 0.22) -> Image.Image:
    """object-fit: cover con foco vertical en la cara."""
    sw, sh = im.size
    scale = max(tw / sw, th / sh)
    nw, nh = int(sw * scale), int(sh * scale)
    resized = im.resize((nw, nh), Image.Resampling.LANCZOS)
    left = (nw - tw) // 2
    # focus_y: fracción del alto original de la cara
    top = int(focus_y * nh - th * 0.35)
    top = max(0, min(top, nh - th))
    return resized.crop((left, top, left + tw, top + th))


def draw_polaroid(photo: Image.Image, caption: str, inner_w: int = 340) -> Image.Image:
    pad = 16
    caption_h = 78
    photo_h = int(inner_w * 1.08)
    W = inner_w + pad * 2
    H = pad + photo_h + caption_h
    card = Image.new("RGBA", (W + 24, H + 24), (0, 0, 0, 0))
    # shadow
    shadow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    sd = ImageDraw.Draw(shadow)
    sd.rounded_rectangle((0, 0, W - 1, H - 1), radius=2, fill=(0, 0, 0, 55))
    shadow = shadow.filter(ImageFilter.GaussianBlur(10))
    card.paste(shadow, (14, 16), shadow)

    body = Image.new("RGBA", (W, H), WHITE + (255,))
    bd = ImageDraw.Draw(body)
    bd.rectangle((0, 0, W - 1, H - 1), outline=(230, 230, 230, 255))
    cropped = cover_crop(photo.convert("RGB"), inner_w, photo_h, focus_y=0.20)
    body.paste(cropped, (pad, pad))
    # caption
    f = font_serif(22)
    bbox = bd.textbbox((0, 0), caption, font=f)
    tw = bbox[2] - bbox[0]
    tx = (W - tw) // 2
    ty = pad + photo_h + (caption_h - (bbox[3] - bbox[1])) // 2 - 2
    bd.text((tx, ty), caption, fill=INK + (255,), font=f)
    card.paste(body, (4, 4), body)
    return card


def rotate(im: Image.Image, angle: float) -> Image.Image:
    return im.rotate(angle, expand=True, resample=Image.Resampling.BICUBIC)


def wrap_text(draw: ImageDraw.ImageDraw, text: str, font_obj, max_w: int) -> list[str]:
    words = text.split()
    lines: list[str] = []
    cur = ""
    for w in words:
        test = (cur + " " + w).strip()
        if draw.textlength(test, font=font_obj) <= max_w:
            cur = test
        else:
            if cur:
                lines.append(cur)
            cur = w
    if cur:
        lines.append(cur)
    return lines


def paint_atmosphere(canvas: Image.Image, mode: str = "h") -> None:
    """Fondo con atmósfera turquesa: wash, puntos y acentos geométricos."""
    W, H = canvas.size
    base = Image.new("RGBA", (W, H), WHITE + (255,))
    overlay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(overlay)

    # wash superior derecha
    for i in range(420):
        a = int(28 * (1 - i / 420))
        if mode == "h":
            d.ellipse((W - 520 + i // 2, -180 + i // 3, W + 80, 320), fill=(20, 184, 164, a // 3))
        else:
            d.ellipse((W - 380, -120, W + 60, 260), fill=(20, 184, 164, max(0, 18 - i // 30)))

    # wash inferior izquierda
    for i in range(280):
        a = int(22 * (1 - i / 280))
        d.ellipse((-160, H - 340 + i // 4, 320, H + 80), fill=(13, 122, 109, a // 3))

    # malla de puntos
    step = 28
    for y in range(40, H - 20, step):
        for x in range(40, W - 20, step):
            if (x + y) % (step * 2) == 0:
                d.ellipse((x, y, x + 2, y + 2), fill=(20, 184, 164, 28))

    # arco / curva decorativa
    if mode == "h":
        d.arc((40, 40, 520, 520), start=200, end=340, fill=(20, 184, 164, 55), width=2)
        d.line((560, 120, 560, H - 80), fill=(20, 184, 164, 40), width=1)
    else:
        d.arc((W // 2 - 260, 20, W // 2 + 260, 540), start=200, end=340, fill=(20, 184, 164, 50), width=2)

    composed = Image.alpha_composite(base, overlay).convert("RGB")
    canvas.paste(composed)


def draw_code_chip(canvas: Image.Image, x: int, y: int, text: str = 'const jo = "fullstack"') -> Image.Image:
    """Ventanita tipo editor — acento de marca tech. Devuelve canvas RGB."""
    f = font(14)
    tw = int(ImageDraw.Draw(canvas).textlength(text, font=f))
    w, h = tw + 14 * 2 + 36, 34
    base = canvas.convert("RGBA")
    layer = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    d.rounded_rectangle((x + 3, y + 4, x + w + 3, y + h + 4), radius=8, fill=(0, 0, 0, 28))
    d.rounded_rectangle((x, y, x + w, y + h), radius=8, fill=(15, 40, 44, 235))
    for i, col in enumerate(((255, 95, 86), (255, 189, 46), (39, 201, 63))):
        d.ellipse((x + 10 + i * 12, y + 12, x + 18 + i * 12, y + 20), fill=col + (255,))
    d.text((x + 48, y + 9), text, fill=(180, 245, 230, 255), font=f)
    return Image.alpha_composite(base, layer).convert("RGB")


def draw_contact_row(
    draw: ImageDraw.ImageDraw,
    x: int,
    y: int,
    lab: str,
    val: str,
    center: bool = False,
    width: int = 900,
) -> None:
    f_lab = font(12, bold=True)
    f_val = font(18, bold=True)
    # bullet turquesa
    if center:
        block_w = max(draw.textlength(lab, font=f_lab), draw.textlength(val, font=f_val))
        cx = (width - block_w) / 2
        draw.ellipse((cx - 18, y + 22, cx - 8, y + 32), fill=TEAL)
        draw.text((cx, y), lab, fill=TEAL_DEEP, font=f_lab)
        draw.text((cx, y + 18), val, fill=INK, font=f_val)
    else:
        draw.ellipse((x, y + 22, x + 10, y + 32), fill=TEAL)
        draw.text((x + 18, y), lab, fill=TEAL_DEEP, font=f_lab)
        draw.text((x + 18, y + 18), val, fill=INK, font=f_val)


def build_horizontal() -> Image.Image:
    W, H = 1600, 1001
    canvas = Image.new("RGB", (W, H), WHITE)
    paint_atmosphere(canvas, "h")
    draw = ImageDraw.Draw(canvas)

    # marco sutil
    draw.rounded_rectangle((18, 18, W - 19, H - 19), radius=18, outline=(20, 184, 164, 255), width=2)
    draw.rounded_rectangle((28, 28, W - 29, H - 29), radius=14, outline=(230, 240, 238), width=1)

    # marca de agua tipográfica
    fbig = font(118, bold=True)
    draw.text((36, 210), "DEV", fill=(225, 242, 239), font=fbig)

    photo = Image.open(PHOTO)
    pol = draw_polaroid(photo, "desarrolladora fullstack", inner_w=360)
    pol = rotate(pol, 3.5)
    canvas.paste(pol, (100, 150), pol)

    # chip código flotante
    canvas = draw_code_chip(canvas, 70, 70, 'stack: "web · woo · ui"')
    draw = ImageDraw.Draw(canvas)

    # right column
    x0 = 640
    y = 150
    f_name = font(52, bold=True)
    draw.text((x0, y), "Josefa Ogalde", fill=INK, font=f_name)
    y += 68
    # acento bajo el nombre
    draw.rounded_rectangle((x0, y, x0 + 72, y + 5), radius=3, fill=TEAL)
    y += 28

    f_eye = font(16, bold=True)
    f_mi = font_serif(22)
    draw.text((x0, y), "SOBRE ", fill=INK, font=f_eye)
    ow = draw.textlength("SOBRE ", font=f_eye)
    draw.text((x0 + ow, y - 2), "mí", fill=TEAL, font=f_mi)
    y += 40

    f_title = font(22, bold=True)
    draw.text((x0, y), "DESARROLLADORA FULLSTACK", fill=INK, font=f_title)
    y += 44

    f_bio = font(20)
    bio = (
        "Especializada en sitios web, tiendas online y proyectos WordPress/"
        "WooCommerce. Acompañamiento post-entrega para que gestiones tu sitio con confianza."
    )
    for line in wrap_text(draw, bio, f_bio, 800):
        draw.text((x0, y), line, fill=MUTED, font=f_bio)
        y += 28
    y += 20

    bw, bh = 210, 54
    # sombra del botón
    draw.rounded_rectangle((x0 + 3, y + 4, x0 + bw + 3, y + bh + 4), radius=12, fill=(20, 184, 164))
    draw.rounded_rectangle((x0, y, x0 + bw, y + bh), radius=12, fill=TEAL)
    f_btn = font(20, bold=True)
    label = "contacto"
    lw = draw.textlength(label, font=f_btn)
    draw.text((x0 + (bw - lw) / 2, y + 15), label, fill=WHITE, font=f_btn)
    y += bh + 40

    rows = [
        ("EMAIL", "josefaogalde@gmail.com"),
        ("WHATSAPP", "+56 9 6604 7614"),
        ("GITHUB", "github.com/JosefaOgalde"),
    ]
    col_w = 360
    for i, (lab, val) in enumerate(rows):
        cx = x0 + (i % 2) * col_w
        cy = y + (i // 2) * 66
        draw_contact_row(draw, cx, cy, lab, val)

    # chip WA
    chip = "+56 9 6604 7614"
    f_chip = font(16, bold=True)
    cw = int(draw.textlength(chip, font=f_chip)) + 48
    ch = 36
    cx, cy = 48, H - 64
    draw.rounded_rectangle((cx, cy, cx + cw, cy + ch), radius=18, fill=WHITE, outline=TEAL)
    draw.ellipse((cx + 10, cy + 12, cx + 22, cy + 24), fill=(37, 211, 102))
    draw.text((cx + 30, cy + 8), chip, fill=INK, font=f_chip)
    return canvas


def build_vertical() -> Image.Image:
    W, H = 900, 1236
    canvas = Image.new("RGB", (W, H), WHITE)
    paint_atmosphere(canvas, "v")
    draw = ImageDraw.Draw(canvas)

    draw.rounded_rectangle((16, 16, W - 17, H - 17), radius=18, outline=TEAL, width=2)
    draw.rounded_rectangle((26, 26, W - 27, H - 27), radius=14, outline=(230, 240, 238), width=1)

    canvas = draw_code_chip(canvas, (W - 280) // 2, 36, 'stack: "web · woo · ui"')
    draw = ImageDraw.Draw(canvas)

    photo = Image.open(PHOTO)
    pol = draw_polaroid(photo, "desarrolladora fullstack", inner_w=460)
    pol = rotate(pol, 2.8)
    px = (W - pol.width) // 2
    canvas.paste(pol, (px, 88), pol)

    y = 88 + pol.height + 4
    f_name = font(40, bold=True)
    name = "Josefa Ogalde"
    nw = draw.textlength(name, font=f_name)
    draw.text(((W - nw) / 2, y), name, fill=INK, font=f_name)
    y += 54
    # acento centrado
    bar_w = 64
    draw.rounded_rectangle(((W - bar_w) / 2, y, (W + bar_w) / 2, y + 5), radius=3, fill=TEAL)
    y += 24

    f_eye = font(15, bold=True)
    f_mi = font_serif(20)
    line = "SOBRE "
    total = draw.textlength(line, font=f_eye) + draw.textlength("mí", font=f_mi)
    sx = (W - total) // 2
    draw.text((sx, y), line, fill=INK, font=f_eye)
    draw.text((sx + draw.textlength(line, font=f_eye), y - 2), "mí", fill=TEAL, font=f_mi)
    y += 34

    f_title = font(20, bold=True)
    title = "DESARROLLADORA FULLSTACK"
    tw = draw.textlength(title, font=f_title)
    draw.text(((W - tw) / 2, y), title, fill=INK, font=f_title)
    y += 36

    f_bio = font(18)
    bio = "Sitios web, tiendas online y WordPress/WooCommerce. Acompañamiento post-entrega para que gestiones tu sitio con confianza."
    for line in wrap_text(draw, bio, f_bio, 640):
        lw = draw.textlength(line, font=f_bio)
        draw.text(((W - lw) / 2, y), line, fill=MUTED, font=f_bio)
        y += 26
    y += 16

    bw, bh = 220, 52
    bx = (W - bw) // 2
    draw.rounded_rectangle((bx + 3, y + 4, bx + bw + 3, y + bh + 4), radius=12, fill=(13, 150, 134))
    draw.rounded_rectangle((bx, y, bx + bw, y + bh), radius=12, fill=TEAL)
    f_btn = font(20, bold=True)
    label = "contacto"
    lw = draw.textlength(label, font=f_btn)
    draw.text((bx + (bw - lw) / 2, y + 14), label, fill=WHITE, font=f_btn)
    y += bh + 26

    for lab, val in (
        ("EMAIL", "josefaogalde@gmail.com"),
        ("WHATSAPP", "+56 9 6604 7614"),
        ("GITHUB", "github.com/JosefaOgalde"),
    ):
        draw_contact_row(draw, 0, y, lab, val, center=True, width=W)
        y += 54
    return canvas


def make_thumb(src: Path, dest: Path, max_w: int) -> None:
    im = Image.open(src).convert("RGB")
    ratio = max_w / im.width
    im2 = im.resize((max_w, max(1, int(im.height * ratio))), Image.Resampling.LANCZOS)
    im2.save(dest, optimize=True)


def write_pdf(png: Path, pdf_path: Path) -> None:
    im = Image.open(png)
    w, h = im.size
    # points: keep pixel aspect at 72dpi-ish scale using points = px * 72/96
    pw, ph = w * 72 / 96, h * 72 / 96
    c = pdfcanvas.Canvas(str(pdf_path), pagesize=(pw, ph))
    c.drawImage(ImageReader(im), 0, 0, width=pw, height=ph)
    # full-page link
    c.linkURL(WA, (0, 0, pw, ph), relative=0)
    c.setTitle("Tarjeta — Josefa Ogalde")
    c.save()
    # ensure annot exists
    reader = PdfReader(str(pdf_path))
    writer = PdfWriter()
    writer.append(reader)
    for page in writer.pages:
        box = page.mediabox
        x0, y0, x1, y1 = float(box.left), float(box.bottom), float(box.right), float(box.top)
        annot = DictionaryObject(
            {
                NameObject("/Type"): NameObject("/Annot"),
                NameObject("/Subtype"): NameObject("/Link"),
                NameObject("/Rect"): ArrayObject(
                    [FloatObject(x0), FloatObject(y0), FloatObject(x1), FloatObject(y1)]
                ),
                NameObject("/Border"): ArrayObject(
                    [NumberObject(0), NumberObject(0), NumberObject(0)]
                ),
                NameObject("/A"): DictionaryObject(
                    {
                        NameObject("/S"): NameObject("/URI"),
                        NameObject("/URI"): TextStringObject(WA),
                    }
                ),
            }
        )
        if NameObject("/Annots") in page:
            page[NameObject("/Annots")].append(annot)
        else:
            page[NameObject("/Annots")] = ArrayObject([annot])
    tmp = pdf_path.with_suffix(".tmp.pdf")
    with open(tmp, "wb") as f:
        writer.write(f)
    tmp.replace(pdf_path)


def main() -> None:
    if not PHOTO.exists():
        raise SystemExit(f"Falta foto fuente: {PHOTO}")

    horiz = build_horizontal()
    vert = build_vertical()
    horiz_path = PERFIL / "josefa-ogalde-tarjeta.png"
    vert_path = PERFIL / "josefa-ogalde-tarjeta-vertical.png"
    pdf_path = PERFIL / "Josefa-Ogalde-Desarrollo-y-Diseno-Web.pdf"

    horiz.save(horiz_path, optimize=True)
    vert.save(vert_path, optimize=True)
    make_thumb(horiz_path, PERFIL / "josefa-ogalde-tarjeta-thumb.png", 420)
    make_thumb(vert_path, PERFIL / "josefa-ogalde-tarjeta-vertical-thumb.png", 360)
    write_pdf(horiz_path, pdf_path)

    # clean foto.png = fuente
    Image.open(PHOTO).convert("RGB").save(PERFIL / "josefa-ogalde-foto.png", optimize=True)

    r = PdfReader(str(pdf_path))
    links = sum(len(p.get("/Annots") or []) for p in r.pages)
    print(
        "OK",
        horiz_path.stat().st_size,
        vert_path.stat().st_size,
        pdf_path.stat().st_size,
        "links",
        links,
    )


if __name__ == "__main__":
    main()
