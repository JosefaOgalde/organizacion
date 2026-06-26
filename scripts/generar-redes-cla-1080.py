#!/usr/bin/env python3
"""Genera piezas 1080×1080 px — Programa CLA Caja Los Andes (contenido landing)."""
from PIL import Image, ImageDraw, ImageFont
import math
import os

OUT = '/workspace/index/clientes/DesafioLatam/CLA/identidad/redes-1080'
os.makedirs(OUT, exist_ok=True)

W = H = 1080
NAVY = (10, 30, 70)
NAVY2 = (5, 25, 51)
AZUL = (0, 102, 255)
AZUL_CLARO = (0, 153, 221)
TEAL = (0, 168, 120)
DORADO = (255, 210, 0)
BLANCO = (255, 255, 255)
GRIS = (100, 116, 139)
GRIS_OSC = (30, 41, 59)
ICE = (232, 244, 252)
ICE2 = (240, 248, 255)

F_BOLD = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
F_REG = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
F_SERIF = '/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf'


def font(path, size):
    return ImageFont.truetype(path, size)


def gradient_bg(img, c1, c2, vertical=True):
    d = ImageDraw.Draw(img)
    for i in range(H):
        t = i / (H - 1) if vertical else 0
        r = int(c1[0] + (c2[0] - c1[0]) * t)
        g = int(c1[1] + (c2[1] - c1[1]) * t)
        b = int(c1[2] + (c2[2] - c1[2]) * t)
        if vertical:
            d.line([(0, i), (W, i)], fill=(r, g, b))
        else:
            d.line([(i, 0), (i, H)], fill=(r, g, b))


def waves_corner(d, corner='tl', color=AZUL):
    pts_sets = []
    if corner == 'tl':
        for i in range(4):
            pts_sets.append([(0, 0), (180 + i * 40, 0), (0, 180 + i * 40)])
    elif corner == 'br':
        for i in range(4):
            pts_sets.append([(W, H), (W - 180 - i * 40, H), (W, H - 180 - i * 40)])
    shades = [color, AZUL_CLARO, TEAL, (180, 220, 255)]
    for i, pts in enumerate(pts_sets):
        c = shades[i % len(shades)]
        d.polygon(pts, fill=c + (180,))


def logo_ca(d, y=72):
    d.rounded_rectangle([72, y, 132, y + 60], radius=8, fill=AZUL)
    d.rectangle([118, y + 8, 128, y + 22], fill=DORADO)
    d.text((148, y + 6), 'CAJA LOS ANDES', fill=NAVY, font=font(F_BOLD, 28))
    d.text((148, y + 38), 'Programa de Formación en IA', fill=GRIS, font=font(F_REG, 18))


def wrap(draw, text, x, y, max_w, fnt, fill, spacing=8, align='left'):
    words = text.split()
    lines, line = [], ''
    for w in words:
        test = (line + ' ' + w).strip()
        if draw.textlength(test, font=fnt) > max_w and line:
            lines.append(line)
            line = w
        else:
            line = test
    if line:
        lines.append(line)
    yy = y
    for ln in lines:
        if align == 'center':
            tw = draw.textlength(ln, font=fnt)
            draw.text((x - tw / 2, yy), ln, fill=fill, font=fnt)
        else:
            draw.text((x, yy), ln, fill=fill, font=fnt)
        yy += fnt.size + spacing
    return yy


def badge(d, text, x, y, bg=AZUL):
    f = font(F_BOLD, 20)
    tw = d.textlength(text, font=f) + 36
    d.rounded_rectangle([x, y, x + tw, y + 40], radius=20, fill=bg)
    d.text((x + 18, y + 8), text, fill=BLANCO, font=f)


def save(img, name):
    path = os.path.join(OUT, name)
    img.save(path, 'PNG', optimize=True)
    print('OK', path)


# ── 01 Hero ──────────────────────────────────────────────
def img_hero():
    img = Image.new('RGB', (W, H), BLANCO)
    gradient_bg(img, NAVY, (0, 60, 140))
    d = ImageDraw.Draw(img, 'RGBA')
    waves_corner(d, 'br')
    d.ellipse([680, -80, 1180, 420], fill=AZUL + (60,))
    d.ellipse([-100, 700, 400, 1200], fill=TEAL + (50,))
    logo_ca(d, 80)
    badge(d, '100% ONLINE · 8 MESES', 72, 170, TEAL)
    wrap(d, 'Impulsa tu futuro laboral aprendiendo', 72, 240, W - 144, font(F_REG, 34), BLANCO)
    wrap(d, 'Inteligencia Artificial y Productividad Digital', 72, 330, W - 144, font(F_BOLD, 44), DORADO)
    wrap(d, 'Beneficio exclusivo para afiliados de Caja Los Andes', 72, 460, W - 144, font(F_REG, 26), (200, 220, 255))
    d.rounded_rectangle([72, 560, W - 72, 680], radius=16, fill=BLANCO + (230,))
    stats = [('100%', 'Online'), ('8', 'Meses'), ('$15.000', 'Copago afiliado')]
    for i, (val, lbl) in enumerate(stats):
        cx = 180 + i * 300
        d.text((cx, 590), val, fill=DORADO, font=font(F_BOLD, 42), anchor='mm')
        d.text((cx, 640), lbl, fill=BLANCO, font=font(F_REG, 22), anchor='mm')
    d.text((W // 2, 760), 'Desafío Latam · CLA', fill=(180, 200, 230), font=font(F_REG, 22), anchor='mm')
    d.rounded_rectangle([240, 820, W - 240, 900], radius=28, fill=AZUL)
    d.text((W // 2, 860), 'Inscríbete con tu beneficio Caja Los Andes', fill=BLANCO, font=font(F_BOLD, 26), anchor='mm')
    save(img, '01-hero-programa-1080x1080.png')


# ── 02 Beneficios ────────────────────────────────────────
def img_beneficios():
    img = Image.new('RGB', (W, H), ICE2)
    d = ImageDraw.Draw(img)
    d.rectangle([0, 0, W, 200], fill=NAVY)
    logo_ca(d, 56)
    d.text((72, 150), '¿Por qué inscribirte?', fill=BLANCO, font=font(F_BOLD, 36))
    items = [
        ('Herramientas para tu día a día', 'Aprende herramientas digitales aplicables directamente a tu trabajo.'),
        ('IA generativa en la práctica', 'Desarrolla habilidades en el uso de inteligencia artificial generativa.'),
        ('Más productividad', 'Mejora tu desempeño profesional con nuevas técnicas y automatización.'),
        ('Listo para lo digital', 'Prepárate para un mundo laboral digital y automatizado.'),
    ]
    colors = [AZUL, TEAL, NAVY, AZUL_CLARO]
    y = 240
    for i, (title, desc) in enumerate(items):
        col = colors[i]
        d.rounded_rectangle([56, y, W - 56, y + 180], radius=20, fill=BLANCO)
        d.rectangle([56, y, 68, y + 180], fill=col)
        d.text((96, y + 28), title, fill=NAVY, font=font(F_BOLD, 28))
        wrap(d, desc, 96, y + 72, W - 160, font(F_REG, 22), GRIS, spacing=6)
        y += 200
    save(img, '02-beneficios-1080x1080.png')


# ── 03 Fase 1 ───────────────────────────────────────────
def img_fase1():
    img = Image.new('RGB', (W, H), BLANCO)
    d = ImageDraw.Draw(img, 'RGBA')
    gradient_bg(img, ICE, BLANCO)
    d = ImageDraw.Draw(img, 'RGBA')
    waves_corner(d, 'tl')
    logo_ca(d)
    badge(d, 'FASE 1', 72, 160, AZUL)
    d.text((72, 220), 'Exploración Tecnológica', fill=NAVY, font=font(F_BOLD, 44))
    d.text((72, 290), 'Webinars de exploración tecnológica', fill=AZUL, font=font(F_REG, 28))
    bullets = [
        'Comprender el impacto de la Inteligencia Artificial',
        'Explorar herramientas digitales',
        'Identificar necesidades de adaptación tecnológica',
        '6 sesiones en vivo · 100% online',
        'Duración: ~2 meses (12 horas)',
    ]
    y = 380
    for b in bullets:
        d.ellipse([72, y + 6, 88, y + 22], fill=TEAL)
        d.text((104, y), b, fill=GRIS_OSC, font=font(F_REG, 24))
        y += 52
    d.rounded_rectangle([72, 720, W - 72, 860], radius=16, fill=NAVY)
    d.text((W // 2, 760), 'Requisito Fase 2', fill=DORADO, font=font(F_BOLD, 22), anchor='mm')
    d.text((W // 2, 800), '75% asistencia + evaluación inicial', fill=BLANCO, font=font(F_REG, 26), anchor='mm')
    d.text((W // 2, 840), 'Diploma de Participación (≥50%) · Aprobación (≥75%)', fill=(180, 200, 230), font=font(F_REG, 20), anchor='mm')
    save(img, '03-fase1-exploracion-1080x1080.png')


# ── 04 Fase 2 ───────────────────────────────────────────
def img_fase2():
    img = Image.new('RGB', (W, H), BLANCO)
    gradient_bg(img, NAVY, (0, 50, 120))
    d = ImageDraw.Draw(img, 'RGBA')
    waves_corner(d, 'br')
    logo_ca(d)
    badge(d, 'FASE 2', 72, 160, TEAL)
    d.text((72, 220), 'Transformación Digital', fill=BLANCO, font=font(F_BOLD, 44))
    d.text((72, 280), 'con IA y Automatización', fill=DORADO, font=font(F_BOLD, 38))
    d.text((72, 350), 'Formación base · 32 horas · asincrónico', fill=(200, 220, 255), font=font(F_REG, 26))
    topics = ['Fundamentos de IA', 'ChatGPT y Claude', 'Automatización de procesos', 'Aplicaciones para productividad']
    y = 430
    for t in topics:
        d.rounded_rectangle([72, y, W - 72, y + 72], radius=12, fill=BLANCO + (30,))
        d.text((96, y + 20), '✓  ' + t, fill=BLANCO, font=font(F_REG, 26))
        y += 88
    d.rounded_rectangle([72, 820, W - 72, 920], radius=16, fill=AZUL)
    d.text((W // 2, 870), 'Diploma de Aprobación al completar el módulo', fill=BLANCO, font=font(F_BOLD, 24), anchor='mm')
    save(img, '04-fase2-transformacion-1080x1080.png')


# ── 05 Fase 3 ───────────────────────────────────────────
def img_fase3():
    img = Image.new('RGB', (W, H), ICE2)
    d = ImageDraw.Draw(img)
    d.rectangle([0, 0, W, 180], fill=NAVY)
    logo_ca(d, 48)
    badge(d, 'FASE 3', W - 200, 100, TEAL)
    d.text((72, 220), 'Especialización Aplicada', fill=NAVY, font=font(F_BOLD, 42))
    d.text((72, 280), '40 horas · 100% online · 4 rutas', fill=GRIS, font=font(F_REG, 24))
    specs = [
        ('Automatización con IA', 'Eficiencia en tareas administrativas'),
        ('IA para Productividad Diaria', 'Optimización y gestión del tiempo'),
        ('Data Analytics', 'Análisis de datos con IA y dashboards'),
        ('IA para Marketing y Ventas', 'Marketing digital y contenido'),
    ]
    y = 340
    for i, (title, sub) in enumerate(specs):
        col = [AZUL, TEAL, NAVY, AZUL_CLARO][i]
        d.rounded_rectangle([56, y, W - 56, y + 130], radius=16, fill=BLANCO)
        d.rectangle([56, y, 72, y + 130], fill=col)
        d.text((96, y + 24), title, fill=NAVY, font=font(F_BOLD, 26))
        d.text((96, y + 68), sub, fill=GRIS, font=font(F_REG, 20))
        y += 150
    d.text((W // 2, 980), 'Nota mínima 6,0 · Diploma de Aprobación', fill=NAVY, font=font(F_BOLD, 22), anchor='mm')
    save(img, '05-fase3-especializacion-1080x1080.png')


# ── 06 Valor / copago ────────────────────────────────────
def img_valor():
    img = Image.new('RGB', (W, H), NAVY)
    d = ImageDraw.Draw(img, 'RGBA')
    d.ellipse([600, -100, 1100, 400], fill=AZUL + (80,))
    logo_ca(d)
    d.text((W // 2, 220), 'Beneficio exclusivo afiliados', fill=BLANCO, font=font(F_REG, 28), anchor='mm')
    d.text((W // 2, 300), 'Valor referencial', fill=(180, 200, 230), font=font(F_REG, 24), anchor='mm')
    d.text((W // 2, 370), '$560.000', fill=(150, 170, 200), font=font(F_BOLD, 52), anchor='mm')
    d.line([(300, 410), (780, 410)], fill=GRIS, width=3)
    d.text((W // 2, 460), 'Tu copago único', fill=DORADO, font=font(F_BOLD, 32), anchor='mm')
    d.text((W // 2, 540), '$15.000', fill=BLANCO, font=font(F_BOLD, 96), anchor='mm')
    d.text((W // 2, 640), 'Beca del 95% del valor total', fill=TEAL, font=font(F_BOLD, 28), anchor='mm')
    d.rounded_rectangle([160, 720, W - 160, 820], radius=28, fill=AZUL)
    d.text((W // 2, 770), 'Inscribirme ahora', fill=BLANCO, font=font(F_BOLD, 32), anchor='mm')
    d.text((W // 2, 900), 'Programa de 8 meses · Certificación incluida', fill=(180, 200, 230), font=font(F_REG, 22), anchor='mm')
    save(img, '06-copago-beneficio-1080x1080.png')


# ── 07 Módulos ───────────────────────────────────────────
def img_modulos():
    img = Image.new('RGB', (W, H), BLANCO)
    d = ImageDraw.Draw(img)
    d.rectangle([0, 0, W, 160], fill=AZUL)
    d.text((W // 2, 80), 'Contenidos del programa', fill=BLANCO, font=font(F_BOLD, 36), anchor='mm')
    mods = [
        'Fundamentos de IA',
        'ChatGPT y Claude',
        'Automatización',
        'Prompts productivos',
        'Análisis de datos',
        'IA aplicada al negocio',
        'Sin necesidad de code',
    ]
    y = 190
    for i, m in enumerate(mods):
        bg = ICE if i % 2 == 0 else BLANCO
        d.rounded_rectangle([48, y, W - 48, y + 100], radius=14, fill=bg, outline=(220, 230, 240))
        d.text((80, y + 32), f'{i + 1}.', fill=AZUL, font=font(F_BOLD, 28))
        d.text((130, y + 32), m, fill=NAVY, font=font(F_REG, 26))
        y += 112
    save(img, '07-modulos-programa-1080x1080.png')


# ── 08 Timeline ──────────────────────────────────────────
def img_timeline():
    img = Image.new('RGB', (W, H), ICE2)
    d = ImageDraw.Draw(img)
    d.rectangle([0, 0, W, 150], fill=NAVY)
    d.text((W // 2, 75), 'Fechas clave del programa', fill=BLANCO, font=font(F_BOLD, 34), anchor='mm')
    events = [
        ('Inscripciones', 'Formulario web abierto'),
        ('Matriculación', 'Validación afiliados + copago $15.000'),
        ('Fase 1', 'Webinars en vivo · exploración tecnológica'),
        ('Fase 2', 'Curso e-learning · 32 horas asincrónicas'),
        ('Fase 3', 'Bootcamp especialización · 40 horas'),
    ]
    y = 200
    for i, (title, desc) in enumerate(events):
        d.ellipse([72, y + 8, 104, y + 40], fill=AZUL)
        d.text((88, y + 16), str(i + 1), fill=BLANCO, font=font(F_BOLD, 18), anchor='mm')
        if i < len(events) - 1:
            d.line([(88, y + 44), (88, y + 130)], fill=AZUL, width=3)
        d.rounded_rectangle([120, y, W - 56, y + 110], radius=14, fill=BLANCO)
        d.text((144, y + 20), title, fill=NAVY, font=font(F_BOLD, 26))
        d.text((144, y + 58), desc, fill=GRIS, font=font(F_REG, 20))
        y += 150
    save(img, '08-fechas-clave-1080x1080.png')


# ── 09 Elegibilidad ──────────────────────────────────────
def img_elegibilidad():
    img = Image.new('RGB', (W, H), BLANCO)
    d = ImageDraw.Draw(img)
    gradient_bg(img, NAVY, (0, 50, 110))
    d = ImageDraw.Draw(img)
    logo_ca(d, 60)
    d.text((72, 160), '¿Quiénes pueden participar?', fill=BLANCO, font=font(F_BOLD, 36))
    cards = [
        'Afiliados vigentes de Caja Los Andes',
        'Cargas autorizadas de afiliados',
        'Completar formulario de inscripción',
        'Realizar copago único de $15.000',
    ]
    y = 260
    for c in cards:
        d.rounded_rectangle([56, y, W - 56, y + 120], radius=16, fill=BLANCO + (240,) if False else (255, 255, 255))
        d.rounded_rectangle([56, y, W - 56, y + 120], radius=16, fill=(255, 255, 255))
        d.ellipse([80, y + 40, 112, y + 72], fill=TEAL)
        d.text((96, y + 48), '✓', fill=BLANCO, font=font(F_BOLD, 22), anchor='mm')
        wrap(d, c, 132, y + 38, W - 200, font(F_REG, 24), NAVY, spacing=4)
        y += 140
    d.text((W // 2, 880), 'Validación de afiliación vía RUT', fill=(200, 220, 255), font=font(F_REG, 22), anchor='mm')
    save(img, '09-elegibilidad-1080x1080.png')


# ── 10 Certificación ─────────────────────────────────────
def img_certificacion():
    img = Image.new('RGB', (W, H), BLANCO)
    d = ImageDraw.Draw(img, 'RGBA')
    waves_corner(d, 'tl')
    waves_corner(d, 'br')
    d = ImageDraw.Draw(img)
    logo_ca(d, 80)
    d.text((W // 2, 200), 'Certificación del programa', fill=NAVY, font=font(F_BOLD, 40), anchor='mm')
    d.text((W // 2, 260), 'Diplomas oficiales por fase completada', fill=GRIS, font=font(F_REG, 24), anchor='mm')
    diplomas = [
        ('Diploma de Participación', 'Fase 1 · asistencia ≥ 50%'),
        ('Diploma de Aprobación', 'Fase 1 · asistencia ≥ 75%'),
        ('Diploma de Aprobación', 'Fase 2 · módulo completado'),
        ('Diploma de Aprobación', 'Fase 3 · nota ≥ 6,0'),
        ('Certificado Final', '3 fases aprobadas'),
    ]
    y = 320
    for title, sub in diplomas:
        d.rounded_rectangle([80, y, W - 80, y + 100], radius=14, fill=ICE)
        d.text((W // 2, y + 28), title, fill=AZUL, font=font(F_BOLD, 26), anchor='mm')
        d.text((W // 2, y + 62), sub, fill=GRIS_OSC, font=font(F_REG, 20), anchor='mm')
        y += 120
    d.text((W // 2, 940), 'Caja Los Andes · Desafío Latam', fill=GRIS, font=font(F_REG, 20), anchor='mm')
    save(img, '10-certificacion-diplomas-1080x1080.png')


if __name__ == '__main__':
    img_hero()
    img_beneficios()
    img_fase1()
    img_fase2()
    img_fase3()
    img_valor()
    img_modulos()
    img_timeline()
    img_elegibilidad()
    img_certificacion()
    print('Done:', OUT)
