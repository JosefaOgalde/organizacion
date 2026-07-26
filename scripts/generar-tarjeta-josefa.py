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


def build_horizontal() -> Image.Image:
    W, H = 1600, 1001
    canvas = Image.new("RGB", (W, H), WHITE)
    draw = ImageDraw.Draw(canvas)
    # faint DEVELOPER
    fbig = font(120, bold=True)
    draw.text((-10, 220), "DEVELOPER", fill=(232, 246, 244), font=fbig)

    photo = Image.open(PHOTO)
    pol = draw_polaroid(photo, "desarrolladora fullstack", inner_w=360)
    pol = rotate(pol, 3.5)
    canvas.paste(pol, (90, 160), pol)

    # right column
    x0 = 620
    y = 160
    f_name = font(56, bold=True)
    f_script = font_serif(52)
    draw.text((x0, y), "JOSEFA", fill=INK, font=f_name)
    jw = draw.textlength("JOSEFA ", font=f_name)
    draw.text((x0 + jw, y + 4), "Ogalde", fill=TEAL, font=f_script)
    y += 78

    f_eye = font(16, bold=True)
    f_mi = font_serif(22)
    draw.text((x0, y), "SOBRE ", fill=INK, font=f_eye)
    ow = draw.textlength("SOBRE ", font=f_eye)
    draw.text((x0 + ow, y - 2), "mí", fill=TEAL, font=f_mi)
    y += 42

    f_title = font(22, bold=True)
    draw.text((x0, y), "DESARROLLADORA FULLSTACK", fill=INK, font=f_title)
    y += 48

    f_bio = font(20)
    bio = (
        "Especializada en sitios web, tiendas online y proyectos WordPress/"
        "WooCommerce. Acompañamiento post-entrega para que gestiones tu sitio con confianza."
    )
    for line in wrap_text(draw, bio, f_bio, 820):
        draw.text((x0, y), line, fill=MUTED, font=f_bio)
        y += 28
    y += 22

    # button contacto
    bw, bh = 200, 52
    draw.rounded_rectangle((x0, y, x0 + bw, y + bh), radius=10, fill=TEAL)
    f_btn = font(20, bold=True)
    label = "contacto"
    lw = draw.textlength(label, font=f_btn)
    draw.text((x0 + (bw - lw) / 2, y + 14), label, fill=WHITE, font=f_btn)
    y += bh + 36

    f_lab = font(13, bold=True)
    f_val = font(20, bold=True)
    rows = [
        ("EMAIL", "josefaogalde@gmail.com"),
        ("WHATSAPP", "+56 9 6604 7614"),
        ("GITHUB", "github.com/JosefaOgalde"),
    ]
    col_w = 360
    for i, (lab, val) in enumerate(rows):
        cx = x0 + (i % 2) * col_w
        cy = y + (i // 2) * 64
        draw.text((cx, cy), lab, fill=TEAL_DEEP, font=f_lab)
        draw.text((cx, cy + 20), val, fill=INK, font=f_val)

    # chip WA
    chip = "+56 9 6604 7614"
    f_chip = font(16, bold=True)
    cw = int(draw.textlength(chip, font=f_chip)) + 48
    ch = 36
    cx, cy = 40, H - 56
    draw.rounded_rectangle((cx, cy, cx + cw, cy + ch), radius=18, fill=WHITE, outline=(230, 230, 230))
    draw.ellipse((cx + 10, cy + 12, cx + 22, cy + 24), fill=(37, 211, 102))
    draw.text((cx + 30, cy + 8), chip, fill=INK, font=f_chip)
    return canvas


def build_vertical() -> Image.Image:
    W, H = 900, 1236
    canvas = Image.new("RGB", (W, H), WHITE)
    draw = ImageDraw.Draw(canvas)
    photo = Image.open(PHOTO)
    pol = draw_polaroid(photo, "desarrolladora fullstack", inner_w=480)
    pol = rotate(pol, 2.8)
    px = (W - pol.width) // 2
    canvas.paste(pol, (px, 48), pol)

    y = 48 + pol.height + 8
    f_name = font(44, bold=True)
    f_script = font_serif(42)
    name = "JOSEFA"
    nw = draw.textlength(name + " ", font=f_name)
    sw = draw.textlength("Ogalde", font=f_script)
    start = (W - (nw + sw)) // 2
    draw.text((start, y), name, fill=INK, font=f_name)
    draw.text((start + nw, y + 2), "Ogalde", fill=TEAL, font=f_script)
    y += 62

    f_eye = font(15, bold=True)
    f_mi = font_serif(20)
    line = "SOBRE "
    # center sobre mí
    total = draw.textlength(line, font=f_eye) + draw.textlength("mí", font=f_mi)
    sx = (W - total) // 2
    draw.text((sx, y), line, fill=INK, font=f_eye)
    draw.text((sx + draw.textlength(line, font=f_eye), y - 2), "mí", fill=TEAL, font=f_mi)
    y += 36

    f_title = font(20, bold=True)
    title = "DESARROLLADORA FULLSTACK"
    tw = draw.textlength(title, font=f_title)
    draw.text(((W - tw) / 2, y), title, fill=INK, font=f_title)
    y += 40

    f_bio = font(18)
    bio = "Sitios web, tiendas online y WordPress/WooCommerce. Acompañamiento post-entrega para que gestiones tu sitio con confianza."
    for line in wrap_text(draw, bio, f_bio, 640):
        lw = draw.textlength(line, font=f_bio)
        draw.text(((W - lw) / 2, y), line, fill=MUTED, font=f_bio)
        y += 26
    y += 18

    bw, bh = 220, 52
    bx = (W - bw) // 2
    draw.rounded_rectangle((bx, y, bx + bw, y + bh), radius=10, fill=TEAL)
    f_btn = font(20, bold=True)
    label = "contacto"
    lw = draw.textlength(label, font=f_btn)
    draw.text((bx + (bw - lw) / 2, y + 14), label, fill=WHITE, font=f_btn)
    y += bh + 28

    f_lab = font(13, bold=True)
    f_val = font(20, bold=True)
    for lab, val in (
        ("EMAIL", "josefaogalde@gmail.com"),
        ("WHATSAPP", "+56 9 6604 7614"),
        ("GITHUB", "github.com/JosefaOgalde"),
    ):
        lw = draw.textlength(lab, font=f_lab)
        draw.text(((W - lw) / 2, y), lab, fill=TEAL_DEEP, font=f_lab)
        vw = draw.textlength(val, font=f_val)
        draw.text(((W - vw) / 2, y + 18), val, fill=INK, font=f_val)
        y += 56
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
