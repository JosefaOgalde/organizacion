#!/usr/bin/env python3
"""Genera capturas placeholder del flujo actual JM (1080×1920).
Reemplaza con capturas reales del sitio usando los mismos nombres de archivo."""

from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "index/clientes/JoyasMercury/flujo-actual"

PASOS = [
    ("01-inicio-home.png", "1 · Inicio", "Hero · Colecciones Esencial / Gold / Deluxe · barra inferior móvil"),
    ("02-coleccion-esencial.png", "2 · Colección Esencial", "Categorías circulares · Productos destacados"),
    ("03-coleccion-gold.png", "3 · Colección Gold", "Categorías · destacados · tono dorado"),
    ("04-coleccion-deluxe.png", "4 · Colección Deluxe", "Categorías · destacados · línea premium"),
    ("05-tienda-catalogo.png", "5 · Tienda", "Grilla productos · filtros Esencial/Deluxe · paginación"),
    ("06-mi-carrito.png", "6 · Mi Carrito", "Estado vacío · volver a la tienda · newsletter"),
    ("07-nosotros.png", "7 · Nosotros", "Contenido editorial · entradas blog"),
    ("08-pie-garantia-footer.png", "8 · Pie y garantía", "Texto garantía · footer dorado · WhatsApp flotante"),
]

W, H = 1080, 1920
BG = (253, 240, 244)
GOLD = (169, 126, 35)
ROSA = (200, 143, 156)
TAN = (216, 191, 177)
TEXT = (90, 90, 90)


def font(size):
    for name in ("DejaVuSans.ttf", "DejaVuSans-Bold.ttf", "arial.ttf"):
        try:
            return ImageFont.truetype(name, size)
        except OSError:
            continue
    return ImageFont.load_default()


def dibujar(nombre, titulo, subtitulo):
    img = Image.new("RGB", (W, H), BG)
    d = ImageDraw.Draw(img)
    d.rectangle([0, 0, W, 120], fill=TAN)
    d.rectangle([0, H - 280, W, H], fill=GOLD)
    d.text((W // 2, 60), "JOYAS MERCURY", fill=GOLD, anchor="mm", font=font(36))
    d.text((W // 2, H // 2 - 80), titulo, fill=ROSA, anchor="mm", font=font(52))
    d.text((W // 2, H // 2 + 20), subtitulo, fill=TEXT, anchor="mm", font=font(28))
    d.text((W // 2, H // 2 + 120), "joyasmercury.cl · flujo actual", fill=TEXT, anchor="mm", font=font(22))
    d.text((W // 2, H - 140), "Reemplazar con captura real", fill=(255, 255, 255), anchor="mm", font=font(24))
    d.text((W // 2, H - 90), nombre, fill=(255, 255, 255), anchor="mm", font=font(20))
    return img


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    for nombre, titulo, sub in PASOS:
        path = OUT / nombre
        dibujar(nombre, titulo, sub).save(path, optimize=True)
        print("OK", path.relative_to(ROOT))
    print(f"\n{len(PASOS)} pantallas en {OUT.relative_to(ROOT)}/")


if __name__ == "__main__":
    main()
