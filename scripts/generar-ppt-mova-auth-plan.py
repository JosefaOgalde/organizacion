#!/usr/bin/env python3
"""Genera PPT: MOVA · Plan login mova_auth — 7 días hábiles (acme-chile.cl)."""

from pathlib import Path

from pptx import Presentation
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE
from pptx.enum.text import MSO_ANCHOR, PP_ALIGN
from pptx.util import Inches, Pt

OUT = Path(__file__).resolve().parent.parent / "index/clientes/mkof/MOVA-Auth-Plan-Ejecucion.pptx"

C_BG = RGBColor(0xE8, 0xF6, 0xF8)
C_ACCENT = RGBColor(0x4A, 0x7A, 0x80)
C_ACCENT_DARK = RGBColor(0x2A, 0x4A, 0x4E)
C_WHITE = RGBColor(0xFF, 0xFF, 0xFF)
C_TEXT = RGBColor(0x1F, 0x23, 0x28)
C_MUTED = RGBColor(0x65, 0x6D, 0x76)
C_HIGHLIGHT = RGBColor(0xFF, 0xF8, 0xC5)
C_OK = RGBColor(0x1A, 0x7F, 0x37)
C_BORDER = RGBColor(0xD0, 0xD7, 0xDE)
SITIO = "https://acme-chile.cl/"
INICIO = "6 jul 2026"
CIERRE = "14 jul 2026"

SLIDE_W = Inches(13.333)
SLIDE_H = Inches(7.5)

DIAS = [
    ("1", "Inventario módulos M", "lun 6 jul",
     "cPanel → public_html en GoDaddy. Listar MAESTRO, INGRESOS, EGRESOS y cada URL bajo acme-chile.cl.",
     "Tabla: Módulo | URL | Cómo valida | ¿JWT? | ¿n8n? | Responsable",
     "Entregable: hoja «Inventario-MOVA-modulos»",
     ["Acceso cPanel OK", "Todas las URLs anotadas", "JWT/localStorage marcados", "Tabla compartida"]),
    ("2", "Acuerdo + diseño mova_auth", "mar 7 jul",
     "Regla escrita: ningún módulo valida solo. Definir 6 archivos PHP y módulo sandbox para día 5.",
     "Único validador = mova_auth + guard.php",
     "Entregable: doc «Reglas-mova_auth»",
     ["Regla acordada", "Lista de archivos PHP", "Sandbox elegido"]),
    ("3", "Carpeta + archivos en servidor", "mié 8 jul",
     "Crear public_html/mova_auth/ y subir config, session, login, validate, guard, logout.",
     "login.php debe abrir en HTTPS",
     "Entregable: 6 archivos PHP en servidor",
     ["Carpeta creada", "login.php responde", "config fuera de Git público"]),
    ("4", "Login único + cookie httpOnly", "jue 9 jul",
     "Sesión PHP. Google opcional (tokeninfo + whitelist). Cookie Secure + HttpOnly. Sin JWT.",
     "DevTools → cookie HttpOnly ✓",
     "Entregable: login con redirect al módulo",
     ["Login funciona", "Redirect OK", "Sin JWT en localStorage"]),
    ("5", "validate.php + 1er módulo", "vie 10 jul",
     "validate.php JSON 200/401. Migrar módulo sandbox con require guard.php al inicio.",
     "fetch con credentials: include",
     "Entregable: 1 módulo M migrado",
     ["validate.php OK", "Sandbox con guard.php", "Prueba manual OK"]),
    ("6", "Migrar resto + quitar JWT", "lun 13 jul",
     "Un módulo a la vez. Eliminar validación duplicada y localStorage con tokens.",
     "Sin bucles redirect infinito",
     "Entregable: todos los M con guard.php",
     ["Inventario 100% migrado", "localStorage limpio", "Sin regresiones"]),
    ("7", "Pruebas y cierre 2.1 + 2.2", "mar 14 jul",
     "Por módulo: sin login→redirect, con login→entra, logout, incógnito. Actualizar ficha MOVA.",
     "Cerrar hitos en Gantt",
     "Entregable: mova_auth operativo documentado",
     ["4 pruebas/módulo OK", "Ficha MOVA actualizada", "Hitos 2.1 y 2.2 cerrados"]),
]


def set_slide_bg(slide, color=C_BG):
    fill = slide.background.fill
    fill.solid()
    fill.fore_color.rgb = color


def add_textbox(slide, left, top, width, height, text, size=18, bold=False, color=C_TEXT, align=PP_ALIGN.LEFT):
    box = slide.shapes.add_textbox(left, top, width, height)
    tf = box.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = text
    p.font.size = Pt(size)
    p.font.bold = bold
    p.font.color.rgb = color
    p.alignment = align
    return box


def add_header_bar(slide, title, subtitle=""):
    bar = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0), Inches(0), SLIDE_W, Inches(1.05))
    bar.fill.solid()
    bar.fill.fore_color.rgb = C_ACCENT
    bar.line.fill.background()
    add_textbox(slide, Inches(0.55), Inches(0.18), Inches(11), Inches(0.5), title, size=24, bold=True, color=C_WHITE)
    if subtitle:
        add_textbox(slide, Inches(0.55), Inches(0.62), Inches(11), Inches(0.35), subtitle, size=13, color=C_BG)


def slide_title(prs):
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    set_slide_bg(slide, C_ACCENT_DARK)
    add_textbox(slide, Inches(0.8), Inches(1.5), Inches(11.5), Inches(0.5), "MOVA · Login unificado", size=20, color=RGBColor(0xA8, 0xD8, 0xDC))
    add_textbox(slide, Inches(0.8), Inches(2.1), Inches(11.5), Inches(1.0), "Plan 7 días hábiles", size=44, bold=True, color=C_WHITE)
    add_textbox(slide, Inches(0.8), Inches(3.2), Inches(11.5), Inches(0.7), "mova_auth · acme-chile.cl", size=28, color=C_BG)
    add_textbox(slide, Inches(0.8), Inches(4.1), Inches(11.5), Inches(0.5), f"{INICIO} → {CIERRE} · Hitos 2.1 + 2.2", size=16, color=RGBColor(0xA8, 0xD8, 0xDC))
    add_textbox(slide, Inches(0.8), Inches(6.2), Inches(11.5), Inches(0.4), "GRUPO MAKING OF · Organizador: index.html?tarea=mkof/01", size=13, color=C_MUTED)


def slide_contexto(prs):
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    set_slide_bg(slide)
    add_header_bar(slide, "Contexto", SITIO)
    bullets = [
        "Sitio en producción: acme-chile.cl (GoDaddy + Cloudflare).",
        "Problema: login fragmentado — Google + mova_auth + JWT en localStorage.",
        "Meta: un solo login, cookie httpOnly, mova_auth valida todos los módulos M.",
        "7 pasos = 7 días hábiles (sin migrar de hosting).",
        "Día 1: solo inventario — no tocar código.",
    ]
    y = Inches(1.5)
    for b in bullets:
        add_textbox(slide, Inches(0.9), y, Inches(11.5), Inches(0.55), f"•  {b}", size=19, color=C_TEXT)
        y += Inches(0.6)


def slide_mapa(prs):
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    set_slide_bg(slide)
    add_header_bar(slide, "Mapa 7 días", "12 pasos originales comprimidos en 7")
    y = Inches(1.4)
    for num, titulo, fecha, *_ in DIAS:
        add_textbox(slide, Inches(0.8), y, Inches(1.2), Inches(0.35), f"Día {num}", size=14, bold=True, color=C_ACCENT)
        add_textbox(slide, Inches(2.0), y, Inches(6.5), Inches(0.35), titulo, size=15, bold=True, color=C_TEXT)
        add_textbox(slide, Inches(9.0), y, Inches(3.5), Inches(0.35), fecha, size=13, color=C_MUTED)
        y += Inches(0.72)


def slide_dia1_detalle(prs):
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    set_slide_bg(slide)
    add_header_bar(slide, "Día 1 — Qué debes tener hoy", f"{SITIO} · sin tocar código")
    add_textbox(slide, Inches(0.75), Inches(1.35), Inches(11.5), Inches(0.45), "Entregable del día", size=16, bold=True, color=C_ACCENT_DARK)
    add_textbox(slide, Inches(0.75), Inches(1.85), Inches(11.5), Inches(0.5),
                "Hoja «Inventario-MOVA-modulos» (Google Sheets o .md en el repo)", size=17, color=C_TEXT)
    add_textbox(slide, Inches(0.75), Inches(2.55), Inches(11.5), Inches(0.4), "Columnas obligatorias", size=15, bold=True, color=C_ACCENT)
    cols = "Módulo | URL completa | ¿Cómo valida hoy? | ¿JWT/localStorage? | ¿Llama n8n? | Responsable"
    add_textbox(slide, Inches(0.9), Inches(3.0), Inches(11.2), Inches(0.55), cols, size=14, color=C_TEXT)
    add_textbox(slide, Inches(0.75), Inches(3.75), Inches(11.5), Inches(0.4), "Pasos hoy", size=15, bold=True, color=C_ACCENT)
    pasos = [
        "1. Entrar a cPanel → Administrador de archivos → public_html",
        "2. Listar cada carpeta/módulo MOVA y su URL en acme-chile.cl",
        "3. Por módulo: anotar si usa Google OAuth, mova_auth u otro",
        "4. Buscar localStorage / JWT en el código (o preguntar al dev)",
        "5. Marcar en rojo lo que NO pase por mova_auth",
        "6. Compartir la tabla con el equipo antes del Día 2",
    ]
    y = Inches(4.2)
    for p in pasos:
        add_textbox(slide, Inches(0.9), y, Inches(11), Inches(0.38), p, size=13, color=C_TEXT)
        y += Inches(0.4)


def slide_dia(prs, num, titulo, fecha, texto, destacar, entregable, checklist):
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    set_slide_bg(slide)
    add_header_bar(slide, f"Día {num} · {fecha}", titulo)
    circle = slide.shapes.add_shape(MSO_SHAPE.OVAL, Inches(0.55), Inches(1.35), Inches(0.55), Inches(0.55))
    circle.fill.solid()
    circle.fill.fore_color.rgb = C_ACCENT
    circle.line.fill.background()
    tf = circle.text_frame
    tf.vertical_anchor = MSO_ANCHOR.MIDDLE
    p = tf.paragraphs[0]
    p.text = str(num)
    p.font.size = Pt(20)
    p.font.bold = True
    p.font.color.rgb = C_WHITE
    p.alignment = PP_ALIGN.CENTER

    add_textbox(slide, Inches(1.25), Inches(1.3), Inches(10), Inches(0.5), titulo, size=22, bold=True, color=C_ACCENT_DARK)
    add_textbox(slide, Inches(0.75), Inches(1.95), Inches(11.5), Inches(1.2), texto, size=16, color=C_TEXT)

    hl = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.7), Inches(3.25), Inches(11.8), Inches(0.75))
    hl.fill.solid()
    hl.fill.fore_color.rgb = C_HIGHLIGHT
    hl.line.color.rgb = RGBColor(0xD4, 0xA7, 0x2C)
    add_textbox(slide, Inches(0.9), Inches(3.4), Inches(11.4), Inches(0.5), f"👆 {destacar}", size=13, bold=True, color=C_ACCENT_DARK)

    add_textbox(slide, Inches(0.75), Inches(4.15), Inches(11.5), Inches(0.4), f"Entregable: {entregable}", size=14, bold=True, color=C_OK)
    y = Inches(4.65)
    for item in checklist:
        add_textbox(slide, Inches(0.95), y, Inches(11), Inches(0.35), f"☐  {item}", size=13, color=C_TEXT)
        y += Inches(0.38)


def slide_organizador(prs):
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    set_slide_bg(slide, C_ACCENT_DARK)
    add_textbox(slide, Inches(0.8), Inches(2.2), Inches(11.5), Inches(0.7), "Tareas en el organizador", size=32, bold=True, color=C_WHITE)
    add_textbox(slide, Inches(0.8), Inches(3.2), Inches(11.5), Inches(1.5),
                "7 tareas [MOVA] D1…D7 en el calendario\n\nindex.html?tarea=mkof/01\n\nRecarga el organizador tras git pull", size=20, color=C_BG)


def main():
    prs = Presentation()
    prs.slide_width = SLIDE_W
    prs.slide_height = SLIDE_H
    slide_title(prs)
    slide_contexto(prs)
    slide_mapa(prs)
    slide_dia1_detalle(prs)
    for d in DIAS:
        slide_dia(prs, *d)
    slide_organizador(prs)
    OUT.parent.mkdir(parents=True, exist_ok=True)
    prs.save(str(OUT))
    print(f"Generado: {OUT}")
    print(f"Diapositivas: {len(prs.slides)}")


if __name__ == "__main__":
    main()
