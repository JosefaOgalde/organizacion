#!/usr/bin/env python3
"""Genera refs + páginas PNG + PDF del catálogo Llaveros (1080×1350, 2 por página)."""
from __future__ import annotations

import math
import os
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent
REFS = ROOT / "refs"
EXPORT = ROOT / "export"
LOGO = ROOT.parent / "identidad" / "logo-impresoreando.png"
PDF = EXPORT / "catalogo-llaveros.pdf"

W, H = 1080, 1350
NAVY = (22, 58, 107)
ORANGE = (240, 122, 40)
CREAM = (247, 241, 230)
WHITE = (255, 255, 255)

PRODUCTOS = [
    {"n": 1, "sku": "LLDONA001", "nombre": "Llavero Dona", "file": "01-dona.jpg", "sel": False, "accent": (255, 140, 180)},
    {"n": 2, "sku": "LLESTAR001", "nombre": "Llavero Estrella Mario", "file": "02-estrella-mario.jpg", "sel": False, "accent": (255, 210, 40)},
    {"n": 3, "sku": "LLMBLOQ001", "nombre": "Llavero Mario Bloques", "file": "03-mario-bloques.jpg", "sel": True, "accent": (240, 190, 40)},
    {"n": 4, "sku": "LLTAMAG001", "nombre": "Llavero Tamagotchi Gato", "file": "04-tamagotchi-gato.jpg", "sel": True, "accent": (150, 90, 200)},
    {"n": 5, "sku": "LLCOFFE001", "nombre": "Llavero Coffee", "file": "05-coffee.jpg", "sel": False, "accent": (120, 70, 40)},
    {"n": 6, "sku": "LLJOYST001", "nombre": "Llavero Joystick", "file": "06-joystick.jpg", "sel": False, "accent": (40, 40, 45)},
    {"n": 7, "sku": "LLMACCL001", "nombre": "Llavero Mac Classic", "file": "07-mac-classic.jpg", "sel": True, "accent": (190, 185, 170)},
    {"n": 8, "sku": "LLNICK001", "nombre": "Llavero Nickelodeon", "file": "08-nickelodeon.jpg", "sel": True, "accent": (255, 120, 20)},
    {"n": 9, "sku": "LLCRASH001", "nombre": "Llavero Crash Bandicoot — Boxes", "file": "09-crash-boxes.jpg", "sel": False, "accent": (220, 40, 40)},
    {"n": 10, "sku": "LLNARUT001", "nombre": "Llavero Naruto — Akatsuki Cloud", "file": "10-naruto-cloud.jpg", "sel": False, "accent": (200, 30, 40)},
    {"n": 11, "sku": "LLPOKE001", "nombre": "Llavero Pokémon — Poké Ball", "file": "11-pokeball.jpg", "sel": False, "accent": (220, 40, 50)},
    {"n": 12, "sku": "LLARCAD001", "nombre": "Llavero Retro Arcade", "file": "12-retro-arcade.jpg", "sel": True, "accent": (240, 200, 40)},
    {"n": 13, "sku": "LLONEPS001", "nombre": "Llavero One Piece — Sombrero", "file": "13-onepiece-sombrero.jpg", "sel": False, "accent": (220, 180, 70)},
    {"n": 14, "sku": "LLONEPC001", "nombre": "Llavero One Piece — Calavera", "file": "14-onepiece-calavera.jpg", "sel": False, "accent": (30, 30, 30)},
    {"n": 15, "sku": "LLONEPC002", "nombre": "Llavero One Piece — Calavera 2", "file": "15-onepiece-calavera-2.jpg", "sel": False, "accent": (30, 30, 30)},
    {"n": 16, "sku": "LLSUPER001", "nombre": "Llavero Chicas Superpoderosas", "file": "16-chicas-superpoderosas.jpg", "sel": True, "accent": (255, 110, 160)},
    {"n": 17, "sku": "LLHUELL001", "nombre": "Llavero Huella Porta Foto", "file": "17-huella-porta-foto.jpg", "sel": True, "accent": (200, 40, 50)},
    {"n": 18, "sku": "LLSUPTE001", "nombre": "Llavero Chicas Superpoderosas — Teléfono", "file": "18-telefono-superpoderosas.jpg", "sel": False, "accent": (220, 40, 50)},
    {"n": 19, "sku": "LLFRUTI001", "nombre": "Llavero Frutilla — Porta Pastillas", "file": "19-frutilla-pastillas.jpg", "sel": False, "accent": (220, 40, 60)},
    {"n": 20, "sku": "LLVINIL001", "nombre": "Llavero Vinilos", "file": "20-vinilos.jpg", "sel": True, "accent": (30, 30, 30)},
    {"n": 21, "sku": "LLCAPSU001", "nombre": "Llavero Cápsula — Porta Pastilla", "file": "21-capsula-pastilla.jpg", "sel": True, "accent": (40, 170, 90)},
    {"n": 22, "sku": "LLDONAP001", "nombre": "Llavero Dona — Porta Pastilla", "file": "22-dona-pastilla.jpg", "sel": False, "accent": (255, 140, 180)},
    {"n": 23, "sku": "LLTAMAP001", "nombre": "Llavero Tamagotchi — Porta Pastillas", "file": "23-tamagotchi-pastillas.jpg", "sel": False, "accent": (150, 90, 200)},
    {"n": 24, "sku": "LLLABIO001", "nombre": "Llavero Labios — Porta Pastillas", "file": "24-labios-pastillas.jpg", "sel": False, "accent": (210, 30, 50)},
]


def font(size: int, bold: bool = True):
    candidates = [
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
        "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
    ]
    for p in candidates:
        if os.path.isfile(p):
            return ImageFont.truetype(p, size)
    return ImageFont.load_default()


def rounded_rect(draw, xy, r, fill=None, outline=None, width=1):
    draw.rounded_rectangle(xy, radius=r, fill=fill, outline=outline, width=width)


def wrap_text(draw, text, fnt, max_w):
    words = text.split()
    lines, cur = [], ""
    for w in words:
        trial = (cur + " " + w).strip()
        if draw.textlength(trial, font=fnt) <= max_w:
            cur = trial
        else:
            if cur:
                lines.append(cur)
            cur = w
    if cur:
        lines.append(cur)
    return lines or [text]


def make_ref(p: dict) -> Path:
    REFS.mkdir(parents=True, exist_ok=True)
    out = REFS / p["file"]
    # Preferir foto real si ya existe (no pisar salvo FORCE_REFS=1).
    stem = p["file"].rsplit(".", 1)[0]
    for ext in (".jpg", ".jpeg", ".webp", ".png"):
        alt = REFS / (stem + ext)
        if alt.exists() and alt.stat().st_size > 8_000:
            if os.environ.get("FORCE_REFS") == "1" and alt == out:
                break
            return alt

    img = Image.new("RGB", (900, 760), CREAM)
    d = ImageDraw.Draw(img)
    # soft panel
    rounded_rect(d, (40, 40, 860, 720), 36, fill=WHITE, outline=(220, 210, 195), width=3)
    accent = p["accent"]
    # accent blob
    d.ellipse((300, 160, 600, 460), fill=accent)
    d.ellipse((340, 200, 560, 420), fill=tuple(min(255, c + 40) for c in accent))
    # ring hint (keychain)
    d.ellipse((420, 90, 480, 150), outline=NAVY, width=6)

    f_title = font(36)
    f_small = font(22)
    lines = wrap_text(d, p["nombre"], f_title, 760)
    y = 520
    for line in lines:
        tw = d.textlength(line, font=f_title)
        d.text(((900 - tw) / 2, y), line, fill=NAVY, font=f_title)
        y += 42
    if p["sel"]:
        note = "(debes seleccionar un diseño)"
        tw = d.textlength(note, font=f_small)
        d.text(((900 - tw) / 2, y + 8), note, fill=ORANGE, font=f_small)
    sku = p["sku"]
    tw = d.textlength(sku, font=f_small)
    d.text(((900 - tw) / 2, 680), sku, fill=(100, 120, 150), font=f_small)
    img.save(out, "PNG", optimize=True)
    return out


def load_logo(max_w=820):
    if not LOGO.exists():
        return None
    im = Image.open(LOGO).convert("RGBA")
    ratio = max_w / im.width
    return im.resize((max_w, int(im.height * ratio)), Image.Resampling.LANCZOS)


def page_portada(total: int) -> Image.Image:
    img = Image.new("RGB", (W, H), CREAM)
    d = ImageDraw.Draw(img)
    # soft gradient-ish bands
    for i in range(H):
        t = i / H
        r = int(255 - t * 12)
        g = int(253 - t * 18)
        b = int(248 - t * 30)
        d.line([(0, i), (W, i)], fill=(r, g, b))

    logo = load_logo(780)
    if logo:
        # Logo oficial con transparencia → tarjeta blanca (como catálogo base)
        card = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        cd = ImageDraw.Draw(card)
        x0 = (W - logo.width) // 2 - 40
        y0 = 220
        rounded_rect(cd, (x0, y0, x0 + logo.width + 80, y0 + logo.height + 60), 28, fill=(255, 255, 255, 245))
        img = Image.alpha_composite(img.convert("RGBA"), card).convert("RGB")
        d = ImageDraw.Draw(img)
        img.paste(logo, ((W - logo.width) // 2, y0 + 30), logo)
        logo_bottom = y0 + 30 + logo.height
    else:
        logo_bottom = 400
        d = ImageDraw.Draw(img)

    f_k = font(28)
    f_t = font(86)
    f_p = font(32)
    f_ig = font(34)
    d.text(((W - d.textlength("CATÁLOGO", font=f_k)) / 2, logo_bottom + 48), "CATÁLOGO", fill=ORANGE, font=f_k)
    d.text(((W - d.textlength("Llaveros", font=f_t)) / 2, logo_bottom + 108), "Llaveros", fill=NAVY, font=f_t)

    pill = "Todo es a pedido"
    pw = d.textlength(pill, font=f_p) + 56
    px = (W - pw) / 2
    rounded_rect(d, (px, logo_bottom + 248, px + pw, logo_bottom + 318), 999, fill=WHITE, outline=NAVY, width=3)
    d.text((px + 28, logo_bottom + 263), pill, fill=NAVY, font=f_p)

    ig = "@impresoreando"
    d.text(((W - d.textlength(ig, font=f_ig)) / 2, logo_bottom + 360), ig, fill=NAVY, font=f_ig)

    num = f"01 / {total:02d}"
    d.text((W - 140, H - 60), num, fill=(120, 130, 150), font=font(22))
    return img


def fit_contain(src: Image.Image, box_w: int, box_h: int) -> Image.Image:
    src = src.convert("RGBA")
    ratio = min(box_w / src.width, box_h / src.height)
    nw, nh = max(1, int(src.width * ratio)), max(1, int(src.height * ratio))
    return src.resize((nw, nh), Image.Resampling.LANCZOS)


def draw_product_half(img: Image.Image, p: dict, y0: int, half_h: int):
    d = ImageDraw.Draw(img)
    pad = 48
    card = (pad, y0, W - pad, y0 + half_h - 16)
    rounded_rect(d, card, 28, fill=(255, 253, 249), outline=(220, 210, 195), width=3)

    # visual left
    vis = (pad + 18, y0 + 18, pad + 520, y0 + half_h - 34)
    rounded_rect(d, vis, 22, fill=WHITE, outline=(230, 220, 205), width=2)
    ref = make_ref(p)
    photo = Image.open(ref).convert("RGBA")
    fitted = fit_contain(photo, int(vis[2] - vis[0]) - 20, int(vis[3] - vis[1]) - 20)
    px = int(vis[0] + ((vis[2] - vis[0]) - fitted.width) / 2)
    py = int(vis[1] + ((vis[3] - vis[1]) - fitted.height) / 2)
    img.paste(fitted, (px, py), fitted)

    # meta right
    mx = pad + 548
    f_sku = font(20)
    f_name = font(34)
    f_note = font(20)
    # sku pill
    sku = p["sku"]
    sw = d.textlength(sku, font=f_sku) + 36
    rounded_rect(d, (mx, y0 + 40, mx + sw, y0 + 84), 999, fill=NAVY)
    d.text((mx + 18, y0 + 50), sku, fill=WHITE, font=f_sku)

    lines = wrap_text(d, p["nombre"], f_name, W - mx - pad - 20)
    ty = y0 + 110
    for line in lines:
        d.text((mx, ty), line, fill=NAVY, font=f_name)
        ty += 40
    if p["sel"]:
        d.text((mx, ty + 8), "(debes seleccionar un diseño)", fill=ORANGE, font=f_note)
        ty += 36
    d.text((mx, ty + 16), "Todo es a pedido", fill=ORANGE, font=f_note)
    d.text((mx, y0 + half_h - 70), "@impresoreando", fill=(100, 120, 150), font=f_note)


def page_duo(par: list, page_idx: int, total: int) -> Image.Image:
    img = Image.new("RGB", (W, H), CREAM)
    half = (H - 80) // 2
    draw_product_half(img, par[0], 40, half)
    if len(par) > 1:
        draw_product_half(img, par[1], 40 + half, half)
    else:
        # odd last — leave cream
        pass
    d = ImageDraw.Draw(img)
    num = f"{page_idx:02d} / {total:02d}"
    d.text((W - 140, H - 50), num, fill=(120, 130, 150), font=font(22))
    return img


def page_cierre(total: int) -> Image.Image:
    img = Image.new("RGB", (W, H), NAVY)
    d = ImageDraw.Draw(img)
    for i in range(H):
        t = i / H
        r = int(22 + t * 8)
        g = int(58 - t * 20)
        b = int(107 - t * 30)
        d.line([(0, i), (W, i)], fill=(max(10, r), max(20, g), max(40, b)))

    logo = load_logo(700)
    if logo:
        card_w, card_h = logo.width + 80, logo.height + 60
        x0 = (W - card_w) // 2
        y0 = 220
        rounded_rect(d, (x0, y0, x0 + card_w, y0 + card_h), 28, fill=WHITE)
        img.paste(logo, (x0 + 40, y0 + 30), logo)

    f_t = font(54)
    f_ig = font(42)
    f_url = font(24)
    f_p = font(30)
    title1 = "Pide tus"
    title2 = "llaveros"
    title3 = "en impresoreando"
    d.text(((W - d.textlength(title1, font=f_t)) / 2, 620), title1, fill=WHITE, font=f_t)
    d.text(((W - d.textlength(title2, font=f_t)) / 2, 685), title2, fill=ORANGE, font=f_t)
    d.text(((W - d.textlength(title3, font=f_t)) / 2, 750), title3, fill=WHITE, font=f_t)

    box_w = 620
    bx = (W - box_w) // 2
    rounded_rect(d, (bx, 860, bx + box_w, 1000), 24, fill=(255, 255, 255, 30), outline=(200, 220, 255), width=2)
    # pillow doesn't do alpha fill easily on RGB — solid translucent approx
    rounded_rect(d, (bx, 860, bx + box_w, 1000), 24, fill=(30, 55, 95), outline=(180, 200, 230), width=2)
    ig = "@impresoreando"
    d.text(((W - d.textlength(ig, font=f_ig)) / 2, 890), ig, fill=WHITE, font=f_ig)
    url = "instagram.com/impresoreando"
    d.text(((W - d.textlength(url, font=f_url)) / 2, 950), url, fill=(200, 210, 230), font=f_url)

    fin = "TODO ES A PEDIDO"
    d.text(((W - d.textlength(fin, font=f_p)) / 2, 1100), fin, fill=ORANGE, font=f_p)
    num = f"{total:02d} / {total:02d}"
    d.text((W - 140, H - 50), num, fill=(160, 175, 200), font=font(22))
    return img


def main():
    REFS.mkdir(parents=True, exist_ok=True)
    EXPORT.mkdir(parents=True, exist_ok=True)

    for old in list(EXPORT.glob("*.jpg")) + list(EXPORT.glob("*.png")):
        if old.name != "catalogo-llaveros.pdf":
            old.unlink()

    pares = [PRODUCTOS[i : i + 2] for i in range(0, len(PRODUCTOS), 2)]
    total = 2 + len(pares)
    pages = []

    p0 = page_portada(total)
    f0 = EXPORT / "00-portada.png"
    p0.save(f0, "PNG", optimize=True)
    pages.append(f0)

    for i, par in enumerate(pares):
        pg = page_duo(par, i + 2, total)
        fp = EXPORT / f"{i + 1:02d}-llaveros.png"
        pg.save(fp, "PNG", optimize=True)
        pages.append(fp)

    pc = page_cierre(total)
    fc = EXPORT / f"{len(pares) + 1:02d}-cierre.png"
    pc.save(fc, "PNG", optimize=True)
    pages.append(fc)

    # PDF (Pillow = mejor compatibilidad en Chrome; img2pdf a veces sale en blanco)
    imgs = [Image.open(p).convert("RGB") for p in pages]
    imgs[0].save(
        PDF,
        "PDF",
        save_all=True,
        append_images=imgs[1:],
        resolution=72.0,
    )
    print("PDF", PDF, f"{PDF.stat().st_size // 1024} KB · {len(pages)} páginas")
    print("Refs:", len(list(REFS.glob("*.jpg"))), "· Export:", len(pages))


if __name__ == "__main__":
    main()
