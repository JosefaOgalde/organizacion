#!/usr/bin/env python3
"""Guía visual Día 1 — Joyas Mercury (1080×1080 px)."""
from PIL import Image, ImageDraw, ImageFont
import os

OUT = '/workspace/index/clientes/JoyasMercury/dia-1'
os.makedirs(OUT, exist_ok=True)
W = H = 1080

DORADO = (236, 197, 74)
DORADO_O = (169, 126, 35)
ROSA = (200, 143, 156)
BEIGE = (216, 191, 177)
GRIS = (196, 196, 196)
NEGRO = (45, 45, 45)
BLANCO = (255, 255, 255)
FONDO = (251, 251, 251)

FB = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
FR = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
FS = '/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf'


def f(path, size):
    return ImageFont.truetype(path, size)


def save(img, name):
    img.save(os.path.join(OUT, name), 'PNG', optimize=True)
    print('OK', name)


def header(d, paso, titulo, y=48):
    d.rounded_rectangle([48, y, W - 48, y + 56], radius=28, fill=DORADO)
    d.text((72, y + 14), f'PASO {paso}', fill=NEGRO, font=f(FB, 22))
    d.text((W // 2, y + 72), titulo, fill=NEGRO, font=f(FS, 36), anchor='mt')


def badge(d, text, x, y, bg=ROSA):
    tw = d.textlength(text, font=f(FB, 18)) + 28
    d.rounded_rectangle([x, y, x + tw, y + 34], radius=17, fill=bg)
    d.text((x + 14, y + 6), text, fill=BLANCO, font=f(FB, 18))


def bullet_list(d, items, x, y, max_w=900):
    yy = y
    for item in items:
        d.ellipse([x, yy + 8, x + 14, yy + 22], fill=DORADO_O)
        lines = []
        words = item.split()
        line = ''
        for w in words:
            test = (line + ' ' + w).strip()
            if d.textlength(test, font=f(FR, 24)) > max_w and line:
                lines.append(line)
                line = w
            else:
                line = test
        if line:
            lines.append(line)
        for ln in lines:
            d.text((x + 28, yy), ln, fill=NEGRO, font=f(FR, 24))
            yy += 34
        yy += 12
    return yy


# ── 00 Portada ───────────────────────────────────────────
def img_00():
    img = Image.new('RGB', (W, H), FONDO)
    d = ImageDraw.Draw(img)
    d.rectangle([0, 0, W, 200], fill=DORADO)
    d.text((W // 2, 70), 'JOYAS MERCURY', fill=NEGRO, font=f(FS, 48), anchor='mm')
    d.text((W // 2, 130), 'Fase 2 · Día 1', fill=DORADO_O, font=f(FB, 28), anchor='mm')
    d.text((W // 2, 280), 'Auditoría menú y bloques repetidos', fill=NEGRO, font=f(FB, 36), anchor='mm')
    d.text((W // 2, 340), 'Trabajo en copia Elementor · Producción intacta', fill=GRIS, font=f(FR, 26), anchor='mm')
    d.rounded_rectangle([120, 420, W - 120, 520], radius=16, fill=BLANCO, outline=DORADO, width=3)
    d.text((W // 2, 470), 'joyasmercury.cl → igual', fill=NEGRO, font=f(FB, 28), anchor='mm')
    d.rounded_rectangle([120, 560, W - 120, 660], radius=16, fill=ROSA)
    d.text((W // 2, 610), 'Inicio v2 + Elementor → aquí trabajas', fill=BLANCO, font=f(FB, 26), anchor='mm')
    items = ['Capturas menú actual', 'Lista bloques a quitar', 'Mapa navegación', 'Mockup menú propuesto']
    y = 720
    for it in items:
        d.rounded_rectangle([160, y, W - 160, y + 56], radius=12, fill=BEIGE)
        d.text((W // 2, y + 28), it, fill=NEGRO, font=f(FR, 22), anchor='mm')
        y += 72
    save(img, '00-portada-dia1-1080x1080.png')


# ── 01 Regla copia ───────────────────────────────────────
def img_01():
    img = Image.new('RGB', (W, H), FONDO)
    d = ImageDraw.Draw(img)
    header(d, 0, 'Regla de oro: dos mundos')
    d.rounded_rectangle([72, 200, W // 2 - 24, 520], radius=20, fill=BLANCO, outline=GRIS, width=2)
    d.text((W // 4, 240), 'PRODUCCIÓN', fill=GRIS, font=f(FB, 24), anchor='mm')
    d.text((W // 4, 300), 'joyasmercury.cl', fill=NEGRO, font=f(FB, 22), anchor='mm')
    d.text((W // 4, 360), 'Página: Inicio', fill=NEGRO, font=f(FR, 20), anchor='mm')
    d.text((W // 4, 400), 'NO editar hoy', fill=GRIS, font=f(FB, 22), anchor='mm')
    d.text((W // 4, 460), 'Los clientes ven esto', fill=GRIS, font=f(FR, 18), anchor='mm')
    d.rounded_rectangle([W // 2 + 24, 200, W - 72, 520], radius=20, fill=ROSA)
    d.text((3 * W // 4, 240), 'COPIA DE TRABAJO', fill=BLANCO, font=f(FB, 24), anchor='mm')
    d.text((3 * W // 4, 300), 'Inicio v2', fill=BLANCO, font=f(FB, 22), anchor='mm')
    d.text((3 * W // 4, 360), 'Elementor + plantilla', fill=BLANCO, font=f(FR, 20), anchor='mm')
    d.text((3 * W // 4, 400), '«inicio»', fill=BLANCO, font=f(FB, 22), anchor='mm')
    d.text((3 * W // 4, 460), 'Aquí haces Día 1', fill=BLANCO, font=f(FR, 18), anchor='mm')
    bullet_list(d, [
        'WP Admin → Páginas → Inicio v2 → Editar con Elementor',
        'Ajustes → Lectura: sigue apuntando a Inicio (original)',
        'Publicar cambios solo cuando Camila apruebe',
    ], 72, 560)
    save(img, '01-regla-copia-elementor-1080x1080.png')


# ── 02 Acceder WP ────────────────────────────────────────
def img_02():
    img = Image.new('RGB', (W, H), FONDO)
    d = ImageDraw.Draw(img)
    header(d, 1, 'Abrir WordPress y ubicar páginas')
    steps = [
        'Entra a tu WP Admin (local o staging del backup)',
        'Menú lateral → Páginas',
        'Identifica: Inicio (producción) e Inicio v2 (trabajo)',
        'En Inicio v2 → clic «Editar con Elementor»',
        'Abre otra pestaña: joyasmercury.cl y compara',
    ]
    y = 200
    for i, s in enumerate(steps, 1):
        d.rounded_rectangle([72, y, 120, y + 48], radius=24, fill=DORADO)
        d.text((96, y + 24), str(i), fill=NEGRO, font=f(FB, 22), anchor='mm')
        d.rounded_rectangle([136, y, W - 72, y + 48], radius=12, fill=BLANCO, outline=BEIGE)
        d.text((156, y + 12), s, fill=NEGRO, font=f(FR, 22))
        y += 68
    d.rounded_rectangle([72, y + 40, W - 72, y + 200], radius=16, fill=BEIGE)
    d.text((96, y + 70), 'Plugins activos:', fill=DORADO_O, font=f(FB, 22))
    d.text((96, y + 110), 'Elementor · WooCommerce · Astra · Smart Slider', fill=NEGRO, font=f(FR, 22))
    d.text((96, y + 150), 'Plantillas: «inicio» · «Backup Inicio - Original»', fill=NEGRO, font=f(FR, 20))
    save(img, '02-paso-wp-admin-1080x1080.png')


# ── 03 Menú actual (problemas) ───────────────────────────
def img_03():
    img = Image.new('RGB', (W, H), FONDO)
    d = ImageDraw.Draw(img)
    header(d, 2, 'Auditar menú actual (producción)')
    # mock hamburger bad menu
    d.rounded_rectangle([200, 200, 880, 720], radius=24, fill=BLANCO, outline=DORADO, width=3)
    d.rectangle([200, 200, 880, 260], fill=DORADO)
    d.text((540, 235), 'MENÚ ACTUAL · problemas', fill=NEGRO, font=f(FB, 20), anchor='mm')
    bad = [
        '✗ Categorías repetidas (Aros x3…)',
        '✗ Bloques con conteo de productos',
        '✗ Destacados como ítem suelto',
        '✗ Landings de categoría sueltas',
        '✗ Navegación confusa en móvil',
    ]
    y = 300
    for b in bad:
        d.text((240, y), b, fill=(180, 60, 60), font=f(FR, 26))
        y += 56
    bullet_list(d, [
        'Captura desktop: navbar + menú hamburguesa',
        'Captura móvil: WP Bottom Menu + hamburguesa Astra',
        'Anota cada ítem duplicado en un doc',
    ], 72, 760)
    save(img, '03-auditoria-menu-actual-1080x1080.png')


# ── 04 Bloques a quitar ──────────────────────────────────
def img_04():
    img = Image.new('RGB', (W, H), FONDO)
    d = ImageDraw.Draw(img)
    header(d, 3, 'Bloques repetidos a eliminar en Inicio v2')
    blocks = [
        ('Grid categorías con número', 'Ej. «Aros (12)» — quitar en v2'),
        ('Círculos colección duplicados', 'Si ya están en menú, no repetir abajo'),
        ('Listados WC por categoría', 'Sustituir por navegación Colección → filtros'),
        ('Bloques Destacados sueltos', 'Destacados solo en zona home, no en menú'),
    ]
    y = 210
    for title, desc in blocks:
        d.rounded_rectangle([72, y, W - 72, y + 120], radius=16, fill=BLANCO, outline=ROSA, width=2)
        d.text((96, y + 24), title, fill=DORADO_O, font=f(FB, 24))
        d.text((96, y + 64), desc, fill=NEGRO, font=f(FR, 22))
        badge(d, 'ELIMINAR', W - 200, y + 40, (180, 60, 60))
        y += 140
    d.text((W // 2, 900), 'En Elementor: selecciona sección → papelera', fill=GRIS, font=f(FR, 22), anchor='mm')
    save(img, '04-bloques-quitar-1080x1080.png')


# ── 05 Menú propuesto ────────────────────────────────────
def img_05():
    img = Image.new('RGB', (W, H), FONDO)
    d = ImageDraw.Draw(img)
    header(d, 4, 'Menú propuesto (mockup)')
    # phone mockup
    d.rounded_rectangle([340, 190, 740, 820], radius=32, fill=BLANCO, outline=DORADO_O, width=4)
    d.rectangle([340, 190, 740, 250], fill=DORADO)
    d.text((540, 225), 'JOYAS MERCURY', fill=NEGRO, font=f(FS, 18), anchor='mm')
    menu = [
        ('Inicio', NEGRO, True),
        ('Colecciones ▾', ROSA, True),
        ('  Esencial', DORADO_O, False),
        ('    Aros · Cadenas · Anillos…', GRIS, False),
        ('  Gold', DORADO_O, False),
        ('  Deluxe', DORADO_O, False),
        ('Historias que Brillan', NEGRO, True),
        ('Mi Cuenta', NEGRO, True),
        ('Contacto', NEGRO, True),
        ('Mi Carrito', NEGRO, True),
    ]
    y = 280
    for text, col, bold in menu:
        fn = f(FB, 20) if bold else f(FR, 18)
        d.text((380, y), text, fill=col, font=fn)
        y += 42 if bold else 32
    d.text((W // 2, 880), 'Sin «Productos Destacados» en menú', fill=DORADO_O, font=f(FB, 24), anchor='mm')
    d.text((W // 2, 920), 'Destacados van dentro de Inicio v2', fill=GRIS, font=f(FR, 20), anchor='mm')
    save(img, '05-mockup-menu-propuesto-1080x1080.png')


# ── 06 Mapa navegación ───────────────────────────────────
def img_06():
    img = Image.new('RGB', (W, H), FONDO)
    d = ImageDraw.Draw(img)
    header(d, 5, 'Mapa: Inicio → Colección → Categoría')
    nodes = [
        (540, 220, 'Inicio v2', DORADO),
        (280, 400, 'Esencial', ROSA),
        (540, 400, 'Gold', ROSA),
        (800, 400, 'Deluxe', ROSA),
        (200, 580, 'Aros', BEIGE),
        (360, 580, 'Cadenas', BEIGE),
        (540, 580, 'Anillos', BEIGE),
        (720, 580, 'Pulseras', BEIGE),
        (880, 580, 'Conjuntos', BEIGE),
    ]
    lines = [
        (540, 260, 280, 360), (540, 260, 540, 360), (540, 260, 800, 360),
        (280, 440, 200, 540), (280, 440, 360, 540),
        (540, 440, 540, 540), (800, 440, 880, 540),
    ]
    for x1, y1, x2, y2 in lines:
        d.line([(x1, y1), (x2, y2)], fill=DORADO_O, width=3)
    for x, y, label, col in nodes:
        d.ellipse([x - 70, y - 36, x + 70, y + 36], fill=col)
        d.text((x, y), label, fill=NEGRO, font=f(FB, 16), anchor='mm')
    d.text((W // 2, 700), 'Flujo usuario acordado con Camila', fill=NEGRO, font=f(FR, 22), anchor='mm')
    d.text((W // 2, 760), 'Inicio → círculos colección → landing → filtros → producto', fill=GRIS, font=f(FR, 20), anchor='mm')
    d.rounded_rectangle([120, 820, W - 120, 920], radius=16, fill=BLANCO, outline=DORADO)
    d.text((W // 2, 870), 'Día 2 implementa este menú en Astra + Elementor', fill=DORADO_O, font=f(FB, 22), anchor='mm')
    save(img, '06-mapa-navegacion-1080x1080.png')


# ── 07 Checklist entregables ─────────────────────────────
def img_07():
    img = Image.new('RGB', (W, H), FONDO)
    d = ImageDraw.Draw(img)
    header(d, 6, 'Checklist — qué debe quedar listo hoy')
    checks = [
        'Capturas menú actual (desktop + móvil)',
        'Documento bloques repetidos identificados',
        'Mapa navegación Inicio → Colección → Categoría',
        'Mockup menú propuesto (PNG o Figma/Canva)',
        'Inicio v2 abierto en Elementor (sin publicar a producción)',
        'Lista de preguntas para Camila (si aplica)',
    ]
    y = 210
    for c in checks:
        d.rounded_rectangle([72, y, 120, y + 48], radius=8, fill=BLANCO, outline=DORADO_O, width=2)
        d.text((96, y + 24), '☐', fill=DORADO_O, font=f(FR, 24), anchor='mm')
        d.text((140, y + 10), c, fill=NEGRO, font=f(FR, 24))
        y += 72
    d.rounded_rectangle([72, 780, W - 72, 920], radius=20, fill=DORADO)
    d.text((W // 2, 830), 'Organizador', fill=NEGRO, font=f(FB, 22), anchor='mm')
    d.text((W // 2, 870), 'index.html?tarea=joyas-mercury/01', fill=NEGRO, font=f(FR, 20), anchor='mm')
    save(img, '07-checklist-entregables-1080x1080.png')


if __name__ == '__main__':
    img_00()
    img_01()
    img_02()
    img_03()
    img_04()
    img_05()
    img_06()
    img_07()
    print('Done:', OUT)
