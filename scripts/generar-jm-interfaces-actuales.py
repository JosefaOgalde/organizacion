#!/usr/bin/env python3
"""Mockups de interfaces actuales — Joyas Mercury (estado jun 2026)."""
from PIL import Image, ImageDraw, ImageFont
import os

OUT = '/workspace/index/clientes/JoyasMercury/interfaces'
os.makedirs(OUT, exist_ok=True)

W, H = 1080, 1080
DORADO = (236, 197, 74)
DORADO_O = (169, 126, 35)
ROSA = (200, 143, 156)
BEIGE = (216, 191, 177)
GRIS = (196, 196, 196)
GRIS_TXT = (100, 116, 139)
NEGRO = (35, 35, 35)
BLANCO = (255, 255, 255)
FONDO = (248, 248, 248)
WP_BLUE = (34, 113, 177)
ELEM_PINK = (214, 61, 127)
WC_PURPLE = (122, 75, 163)
VERDE_WA = (37, 211, 102)

FB = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
FR = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
FS = '/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf'


def f(p, s):
    return ImageFont.truetype(p, s)


def save(img, name):
    img.save(os.path.join(OUT, name), 'PNG', optimize=True)
    print('OK', name)


def label(d, text, x, y, bg=NEGRO, fg=BLANCO, sz=16):
    tw = d.textlength(text, font=f(FB, sz)) + 20
    d.rounded_rectangle([x, y, x + tw, y + 28], radius=6, fill=bg)
    d.text((x + 10, y + 4), text, fill=fg, font=f(FB, sz))


def browser_chrome(d, url, y0=0, h=H):
    d.rectangle([0, y0, W, y0 + 44], fill=(230, 230, 230))
    d.ellipse([16, y0 + 14, 28, y0 + 26], fill=(255, 95, 87))
    d.ellipse([36, y0 + 14, 48, y0 + 26], fill=(255, 189, 46))
    d.ellipse([56, y0 + 14, 68, y0 + 26], fill=(39, 201, 63))
    d.rounded_rectangle([100, y0 + 10, W - 16, y0 + 34], radius=8, fill=BLANCO)
    d.text((112, y0 + 14), url, fill=GRIS_TXT, font=f(FR, 14))


def jm_header(d, y, mobile=False):
    if mobile:
        d.rectangle([0, y, W, y + 28], fill=NEGRO)
        d.text((W // 2, y + 14), 'franja negra · Encima de cabecera', fill=GRIS, font=f(FR, 10), anchor='mm')
        y += 28
    d.rectangle([0, y, W, y + 64], fill=BLANCO)
    d.text((48, y + 20), '☰', fill=NEGRO, font=f(FR, 22))
    d.text((W // 2, y + 32), 'JOYAS MERCURY', fill=NEGRO, font=f(FS, 20), anchor='mm')
    d.text((W - 100, y + 22), '🔍', fill=NEGRO, font=f(FR, 18))
    d.text((W - 48, y + 22), '🛒', fill=NEGRO, font=f(FR, 18))
    if not mobile:
        d.rectangle([0, y + 64, W, y + 100], fill=BEIGE)
        items = ['Inicio', 'Tienda', 'Aros', 'Cadenas', 'Destacados', 'Contacto']
        x = 24
        for it in items:
            d.text((x, y + 78), it, fill=NEGRO, font=f(FR, 13))
            x += d.textlength(it, font=f(FR, 13)) + 20
        return y + 100
    return y + 64


# 01 Arquitectura sitio
def img_arquitectura():
    img = Image.new('RGB', (W, H), FONDO)
    d = ImageDraw.Draw(img)
    label(d, 'ESTADO ACTUAL', 24, 24, DORADO_O)
    d.text((W // 2, 80), 'Arquitectura joyasmercury.cl', fill=NEGRO, font=f(FB, 32), anchor='mm')
    boxes = [
        (80, 140, 460, 280, 'PRODUCCIÓN', 'Inicio (post 4387)\njoyasmercury.cl', BLANCO, NEGRO),
        (540, 140, 1000, 280, 'COPIA', 'Inicio v2\nElementor «inicio»', ROSA, BLANCO),
        (80, 320, 320, 480, 'Elementor', 'Landings\nEsencial/Gold/Deluxe', BLANCO, NEGRO),
        (360, 320, 600, 480, 'WooCommerce', 'Tienda\nCarrito · Checkout', WC_PURPLE, BLANCO),
        (640, 320, 1000, 480, 'Astra', 'Cabecera 3 filas\nMenú + logo', BEIGE, NEGRO),
    ]
    for x1, y1, x2, y2, title, body, bg, fg in boxes:
        d.rounded_rectangle([x1, y1, x2, y2], radius=14, fill=bg, outline=GRIS)
        d.text((x1 + 16, y1 + 16), title, fill=fg if bg != BLANCO else DORADO_O, font=f(FB, 18))
        yy = y1 + 50
        for line in body.split('\n'):
            d.text((x1 + 16, yy), line, fill=fg if bg != BLANCO else NEGRO, font=f(FR, 16))
            yy += 26
    d.text((W // 2, 540), 'Plugins: Elementor · WC · Astra · Smart Slider · WP Bottom Menu', fill=GRIS_TXT, font=f(FR, 18), anchor='mm')
    pages = 'Páginas: Inicio · Inicio v2 · Blog · Contacto · Nosotros · Newsletter · Políticas · Tienda · Carrito · Cuenta · Checkout'
    d.rounded_rectangle([48, 580, W - 48, 680], radius=12, fill=BLANCO)
    d.text((72, 610), pages, fill=NEGRO, font=f(FR, 15))
    d.text((W // 2, 900), 'Inventario: interfaces/site-inventory.json', fill=GRIS_TXT, font=f(FR, 18), anchor='mm')
    save(img, '01-arquitectura-sitio-1080x1080.png')


# 02 Home producción desktop
def img_home_prod_desktop():
    img = Image.new('RGB', (W, H), FONDO)
    d = ImageDraw.Draw(img)
    browser_chrome(d, 'https://joyasmercury.cl')
    label(d, 'PRODUCCIÓN · DESKTOP', 24, 56, (180, 60, 60))
    y = jm_header(d, 44, mobile=False)
    d.rectangle([0, y, W, y + 180], fill=(220, 220, 220))
    d.text((W // 2, y + 90), 'Smart Slider · banner 1920×600', fill=GRIS_TXT, font=f(FR, 18), anchor='mm')
    y += 200
    for i, col in enumerate(['ESENCIAL', 'GOLD', 'DELUXE']):
        cx = 180 + i * 360
        d.ellipse([cx - 70, y, cx + 70, y + 140], fill=[ROSA, DORADO, BEIGE][i])
        d.text((cx, y + 170), col, fill=NEGRO, font=f(FB, 16), anchor='mm')
    y += 220
    d.text((48, y), 'Bloque categorías con conteo (repetido):', fill=(180, 60, 60), font=f(FB, 16))
    y += 36
    for cat in ['Aros (12)', 'Cadenas (8)', 'Anillos (5)']:
        d.rounded_rectangle([48, y, 320, y + 48], radius=8, fill=BLANCO, outline=GRIS)
        d.text((64, y + 12), cat, fill=NEGRO, font=f(FR, 16))
        y += 56
    save(img, '02-home-produccion-desktop-1080x1080.png')


# 03 Home producción móvil
def img_home_prod_mobile():
    img = Image.new('RGB', (W, H), FONDO)
    d = ImageDraw.Draw(img)
    phone = [340, 40, 740, 920]
    d.rounded_rectangle(phone, radius=40, fill=NEGRO)
    d.rounded_rectangle([352, 52, 728, 908], radius=32, fill=BLANCO)
    label(d, 'PRODUCCIÓN · MÓVIL', 24, 24, (180, 60, 60))
    y = 80
    d.rectangle([360, y, 720, y + 24], fill=NEGRO)
    y = jm_header(d, 104, mobile=True)
    d.rectangle([360, y, 720, y + 120], fill=GRIS)
    d.text((540, y + 60), 'Slider', fill=BLANCO, font=f(FR, 14), anchor='mm')
    y += 140
    for col, c in zip(['E', 'G', 'D'], [ROSA, DORADO, BEIGE]):
        d.ellipse([400, y, 480, y + 80], fill=c)
        d.text((440, y + 40), col, fill=NEGRO, font=f(FB, 14), anchor='mm')
        y += 100
    d.rectangle([360, 820, 720, 900], fill=(40, 40, 40))
    for i, ic in enumerate(['🏠', '📦', '🛒', '☰']):
        d.text((400 + i * 80, 860), ic, fill=BLANCO, font=f(FR, 18), anchor='mm')
    d.text((540, 960), 'WP Bottom Menu + hamburguesa Astra', fill=GRIS_TXT, font=f(FR, 16), anchor='mm')
    save(img, '03-home-produccion-mobile-1080x1080.png')


# 04 Menú hamburguesa actual
def img_menu_hamburguesa():
    img = Image.new('RGB', (W, H), FONDO)
    d = ImageDraw.Draw(img)
    label(d, 'MENÚ ACTUAL', 24, 24, (180, 60, 60))
    d.text((W // 2, 80), 'Hamburguesa · estado problemático', fill=NEGRO, font=f(FB, 28), anchor='mm')
    d.rounded_rectangle([290, 120, 790, 780], radius=24, fill=BLANCO, outline=DORADO, width=3)
    d.rectangle([290, 120, 790, 180], fill=DORADO)
    d.text((540, 155), 'JOYAS MERCURY', fill=NEGRO, font=f(FS, 18), anchor='mm')
    items = [
        ('Inicio', NEGRO, False),
        ('Tienda', NEGRO, False),
        ('Aros', (180, 60, 60), True),
        ('Cadenas', (180, 60, 60), True),
        ('Anillos', (180, 60, 60), True),
        ('Aros', (180, 60, 60), True),
        ('Productos Destacados', (180, 60, 60), True),
        ('Contacto', NEGRO, False),
        ('Mi Carrito', NEGRO, False),
    ]
    y = 220
    for text, col, bad in items:
        if bad:
            d.rectangle([310, y - 4, 318, y + 20], fill=(180, 60, 60))
        d.text((330, y), text + (' ← repetido' if bad and text == 'Aros' else ''), fill=col, font=f(FB if not bad else FR, 20))
        y += 48
    save(img, '04-menu-hamburguesa-actual-1080x1080.png')


# 05 WP Admin páginas
def img_wp_admin():
    img = Image.new('RGB', (W, H), FONDO)
    d = ImageDraw.Draw(img)
    browser_chrome(d, 'tusitio.local/wp-admin/edit.php?post_type=page')
    label(d, 'WP ADMIN', 24, 56, WP_BLUE)
    d.rectangle([0, 44, 200, H], fill=(30, 35, 40))
    d.text((24, 80), 'Escritorio', fill=GRIS, font=f(FR, 14))
    d.text((24, 120), '▸ Páginas', fill=BLANCO, font=f(FB, 14))
    d.text((24, 150), 'Productos', fill=GRIS, font=f(FR, 14))
    d.text((24, 180), 'Elementor', fill=GRIS, font=f(FR, 14))
    d.text((24, 210), 'Apariencia', fill=GRIS, font=f(FR, 14))
    d.rectangle([200, 44, W, 120], fill=BLANCO)
    d.text((224, 80), 'Páginas', fill=NEGRO, font=f(FB, 28))
    rows = [
        ('Inicio', 'Publicada', '★ Producción'),
        ('Inicio v2', 'Borrador', '✎ Elementor'),
        ('Contacto', 'Publicada', ''),
        ('Nosotros', 'Publicada', ''),
        ('Tienda', 'Publicada', 'WC'),
        ('Mi Carrito', 'Publicada', 'WC'),
    ]
    y = 140
    for name, st, note in rows:
        bg = (255, 240, 240) if 'v2' in name else BLANCO
        d.rectangle([220, y, W - 20, y + 56], fill=bg, outline=(230, 230, 230))
        d.text((240, y + 16), name, fill=NEGRO, font=f(FB, 18))
        d.text((500, y + 18), st, fill=GRIS_TXT, font=f(FR, 16))
        d.text((680, y + 18), note, fill=DORADO_O, font=f(FB, 14))
        y += 60
    d.text((W // 2, 920), 'Editar Inicio v2 → «Editar con Elementor»', fill=WP_BLUE, font=f(FB, 20), anchor='mm')
    save(img, '05-wp-admin-paginas-1080x1080.png')


# 06 Elementor Inicio v2
def img_elementor():
    img = Image.new('RGB', (W, H), FONDO)
    d = ImageDraw.Draw(img)
    browser_chrome(d, 'wp-admin · Elementor · Inicio v2')
    label(d, 'ELEMENTOR', 24, 56, ELEM_PINK)
    d.rectangle([0, 44, 56, H], fill=(40, 40, 40))
    d.rectangle([56, 44, 280, H], fill=(50, 50, 55))
    d.text((72, 80), 'Widgets', fill=GRIS, font=f(FB, 14))
    d.rectangle([280, 44, W, 100], fill=ELEM_PINK)
    d.text((300, 68), 'Editar: Inicio v2', fill=BLANCO, font=f(FB, 18))
    sections = [
        ('Cabecera (Astra)', BEIGE, 'tema'),
        ('Smart Slider 1920×600', GRIS, 'banner'),
        ('#categorias-destacadas', ROSA, 'círculos E/G/D'),
        ('Grid categorías + conteo', (255, 200, 200), '⚠ eliminar'),
        ('Productos destacados', BEIGE, 'pendiente'),
        ('Footer', GRIS, 'parcial'),
    ]
    y = 120
    for name, col, note in sections:
        d.rounded_rectangle([300, y, W - 40, y + 100], radius=8, fill=col, outline=ELEM_PINK if 'eliminar' in note else GRIS)
        d.text((320, y + 20), name, fill=NEGRO, font=f(FB, 18))
        d.text((320, y + 52), note, fill=GRIS_TXT, font=f(FR, 15))
        if 'eliminar' in note:
            d.text((W - 120, y + 40), '🗑', fill=(180, 60, 60), font=f(FR, 24))
        y += 116
    save(img, '06-elementor-inicio-v2-1080x1080.png')


# 07 Landing colección Esencial
def img_landing_esencial():
    img = Image.new('RGB', (W, H), FONDO)
    d = ImageDraw.Draw(img)
    browser_chrome(d, 'joyasmercury.cl/esencial')
    label(d, 'LANDING COLECCIÓN', 24, 56, ROSA)
    y = jm_header(d, 44, mobile=False)
    d.rectangle([0, y, W, y + 100], fill=ROSA)
    d.text((W // 2, y + 50), 'COLECCIÓN ESENCIAL', fill=BLANCO, font=f(FS, 28), anchor='mm')
    y += 120
    d.text((48, y), 'Filtros (pendiente Fase 3):', fill=GRIS_TXT, font=f(FR, 16))
    y += 32
    for cat in ['Aros', 'Cadenas', 'Anillos', 'Pulseras', 'Conjuntos']:
        d.rounded_rectangle([48, y, 200, y + 40], radius=20, fill=BEIGE)
        d.text((124, y + 10), cat, fill=NEGRO, font=f(FR, 14), anchor='mm')
        y += 48
    y += 20
    for i in range(3):
        d.rectangle([48 + i * 320, y, 280 + i * 320, y + 200], fill=BLANCO, outline=GRIS)
        d.text((164 + i * 320, y + 100), f'Producto {i+1}', fill=GRIS_TXT, font=f(FR, 14), anchor='mm')
    d.text((W // 2, 900), '~3 productos cargados · Etapa 1 parcial', fill=GRIS_TXT, font=f(FR, 16), anchor='mm')
    save(img, '07-landing-esencial-1080x1080.png')


# 08 WooCommerce carrito
def img_carrito():
    img = Image.new('RGB', (W, H), FONDO)
    d = ImageDraw.Draw(img)
    browser_chrome(d, 'joyasmercury.cl/mi-carrito')
    label(d, 'WOOCOMMERCE', 24, 56, WC_PURPLE)
    y = jm_header(d, 44, mobile=False)
    d.text((W // 2, y + 40), 'Mi Carrito', fill=NEGRO, font=f(FS, 32), anchor='mm')
    y += 100
    d.rectangle([80, y, W - 80, y + 80], fill=BLANCO, outline=GRIS)
    d.text((120, y + 28), 'Producto ejemplo · $29.990', fill=NEGRO, font=f(FR, 18))
    y += 120
    d.text((W - 120, y), 'Total: $29.990', fill=NEGRO, font=f(FB, 20), anchor='rm')
    y += 60
    d.rounded_rectangle([W // 2 - 140, y, W // 2 + 140, y + 52], radius=8, fill=WC_PURPLE)
    d.text((W // 2, y + 26), 'Finalizar compra', fill=BLANCO, font=f(FB, 18), anchor='mm')
    d.text((W // 2, 880), 'Fase 6: personalizar parte visual superior', fill=GRIS_TXT, font=f(FR, 16), anchor='mm')
    save(img, '08-woocommerce-carrito-1080x1080.png')


# 09 Astra personalizador cabecera
def img_astra_header():
    img = Image.new('RGB', (W, H), FONDO)
    d = ImageDraw.Draw(img)
    label(d, 'ASTRA · CABECERA', 24, 24, DORADO_O)
    d.text((W // 2, 72), '3 filas de cabecera', fill=NEGRO, font=f(FB, 28), anchor='mm')
    rows = [
        ('Fila 1 · Encima de cabecera', NEGRO, 'Franja negra móvil → OCULTAR', (180, 60, 60)),
        ('Fila 2 · Cabecera principal', BLANCO, 'Logo centro · 🔍 · 🛒', NEGRO),
        ('Fila 3 · Barra de menú', BEIGE, 'Menú horizontal / hamburguesa', NEGRO),
    ]
    y = 120
    for title, bg, desc, tc in rows:
        d.rounded_rectangle([48, y, W - 48, y + 140], radius=16, fill=bg, outline=GRIS)
        d.text((72, y + 24), title, fill=tc if isinstance(tc, tuple) and tc != NEGRO else NEGRO, font=f(FB, 20))
        d.text((72, y + 64), desc, fill=GRIS_TXT if tc == NEGRO else tc, font=f(FR, 18))
        y += 160
    d.text((W // 2, 880), 'Apariencia → Personalizar → Encabezado', fill=DORADO_O, font=f(FB, 18), anchor='mm')
    save(img, '09-astra-cabecera-3-filas-1080x1080.png')


# 10 Flujo usuario actual vs objetivo
def img_flujo():
    img = Image.new('RGB', (W, H), FONDO)
    d = ImageDraw.Draw(img)
    label(d, 'FLUJO', 24, 24, DORADO_O)
    d.text((270, 72), 'ACTUAL', fill=(180, 60, 60), font=f(FB, 22), anchor='mm')
    d.text((810, 72), 'OBJETIVO', fill=(40, 140, 80), font=f(FB, 22), anchor='mm')
    actual = ['Inicio', '↓ bloques repetidos', 'Tienda / categorías sueltas', '↓ confuso', 'Producto', 'Carrito']
    obj = ['Inicio v2', '↓ círculos colección', 'Landing + filtros', '↓ mismo vista', 'Producto', 'Carrito']
    y = 120
    for a, o in zip(actual, obj):
        d.rounded_rectangle([48, y, 500, y + 56], radius=10, fill=(255, 235, 235))
        d.text((72, y + 16), a, fill=NEGRO, font=f(FR, 16))
        d.rounded_rectangle([580, y, W - 48, y + 56], radius=10, fill=(235, 255, 240))
        d.text((604, y + 16), o, fill=NEGRO, font=f(FR, 16))
        y += 72
    d.text((W // 2, 920), 'WhatsApp verde = canal principal en ambos', fill=VERDE_WA, font=f(FB, 18), anchor='mm')
    save(img, '10-flujo-actual-vs-objetivo-1080x1080.png')


if __name__ == '__main__':
    img_arquitectura()
    img_home_prod_desktop()
    img_home_prod_mobile()
    img_menu_hamburguesa()
    img_wp_admin()
    img_elementor()
    img_landing_esencial()
    img_carrito()
    img_astra_header()
    img_flujo()
    print('Done:', OUT)
