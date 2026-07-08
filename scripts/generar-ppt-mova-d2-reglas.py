#!/usr/bin/env python3
"""Genera PPT: MOVA · Día 2 — Reglas mova_auth (auditoría)."""

from pathlib import Path

from pptx import Presentation
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE
from pptx.enum.text import PP_ALIGN
from pptx.util import Inches, Pt

OUT = Path(__file__).resolve().parent.parent / "index/clientes/mkof/MOVA-D2-Reglas-mova_auth.pptx"

C_BG = RGBColor(0xE8, 0xF6, 0xF8)
C_ACCENT = RGBColor(0x4A, 0x7A, 0x80)
C_ACCENT_DARK = RGBColor(0x2A, 0x4A, 0x4E)
C_WHITE = RGBColor(0xFF, 0xFF, 0xFF)
C_TEXT = RGBColor(0x1F, 0x23, 0x28)
C_MUTED = RGBColor(0x65, 0x6D, 0x76)
C_OK = RGBColor(0x1A, 0x7F, 0x37)
C_WARN = RGBColor(0xBF, 0x3F, 0x00)
C_HIGHLIGHT = RGBColor(0xFF, 0xF8, 0xC5)
C_PURPLE = RGBColor(0x6F, 0x42, 0xC1)

SLIDE_W = Inches(13.333)
SLIDE_H = Inches(7.5)

MODULOS = [
    ("Portal MOVA", "/mova/", "Google OAuth", "Sí", "Hoy no pasa"),
    ("mova_auth", "/mova_auth/", "PHP correo+clave", "Es el gate", "Parcial"),
    ("MOVA ERP", "/mova/erp/", "Contraseña local", "Sí", "Login aparte"),
    ("AXON", "/axon/", "Sin login visible", "Sí", "Validar D5"),
    ("RRHH", "/rrhh/", "403 Forbidden", "Sí", "Sin acceso público"),
    ("Documentos", "/documentos/", "Público", "No", "Excepción"),
]

CHECKLIST = [
    ("Regla de oro acordada con equipo técnico", False),
    ("Tabla de módulos revisada", False),
    ("Excepciones públicas confirmadas", False),
    ("Documento compartido (PDF/PPT)", False),
    ("Tarea mkof/02 marcada completada", False),
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
    add_textbox(slide, Inches(0.8), Inches(1.4), Inches(11.5), Inches(0.5), "MOVA · Día 2 — Auditoría", size=20, color=RGBColor(0xA8, 0xD8, 0xDC))
    add_textbox(slide, Inches(0.8), Inches(2.0), Inches(11.5), Inches(1.0), "Reglas mova_auth", size=44, bold=True, color=C_WHITE)
    add_textbox(slide, Inches(0.8), Inches(3.1), Inches(11.5), Inches(0.7), "acme-chile.cl · único validador de sesión", size=22, color=C_BG)
    add_textbox(slide, Inches(0.8), Inches(4.0), Inches(11.5), Inches(0.5), "Tarea organizador: index.html?tarea=mkof/02", size=16, color=RGBColor(0xA8, 0xD8, 0xDC))
    add_textbox(slide, Inches(0.8), Inches(4.6), Inches(11.5), Inches(0.5), "8 jul 2026 · GRUPO MAKING OF", size=14, color=C_MUTED)
    add_textbox(slide, Inches(0.8), Inches(5.8), Inches(11.5), Inches(0.6), "Solo documentar y acordar — NO tocar código en servidor", size=17, bold=True, color=C_HIGHLIGHT)


def slide_contexto(prs):
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    set_slide_bg(slide)
    add_header_bar(slide, "Contexto — hallazgo Día 1", "Inventario completado · login fragmentado")
    items = [
        "Portal /mova/ → Google OAuth (no pasa por mova_auth).",
        "mova_auth/login.php → correo+clave (parcial, no gate del panel).",
        "mova/erp/ → contraseña local independiente.",
        "Ningún módulo M usa mova_auth como único validador.",
        "Antes de implementar (D3+), el equipo debe acordar las reglas por escrito.",
    ]
    y = Inches(1.5)
    for b in items:
        add_textbox(slide, Inches(0.85), y, Inches(11.5), Inches(0.55), f"•  {b}", size=17, color=C_TEXT)
        y += Inches(0.58)


def slide_regla_oro(prs):
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    set_slide_bg(slide)
    add_header_bar(slide, "Regla de oro", "Propuesta para acuerdo del equipo")
    box = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.75), Inches(1.5), Inches(11.8), Inches(1.35))
    box.fill.solid()
    box.fill.fore_color.rgb = C_HIGHLIGHT
    box.line.color.rgb = C_WARN
    add_textbox(slide, Inches(0.95), Inches(1.7), Inches(11.4), Inches(1.0),
                "Si el usuario no pasó por mova_auth con sesión válida,\nno entra a ningún módulo M.",
                size=22, bold=True, color=C_ACCENT_DARK, align=PP_ALIGN.CENTER)
    pasos = [
        "1. Todo módulo privado incluye guard.php al inicio.",
        "2. Sesión PHP server-side — sin JWT en localStorage.",
        "3. Sin sesión → redirect a /mova_auth/login.php?redirect=…",
        "4. Tras login → vuelve al módulo pedido.",
        "5. Sin logins paralelos por módulo (salvo excepciones documentadas).",
    ]
    y = Inches(3.2)
    for p in pasos:
        add_textbox(slide, Inches(0.85), y, Inches(11.5), Inches(0.45), p, size=16, color=C_TEXT)
        y += Inches(0.5)
    gate = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(4.5), Inches(5.85), Inches(4.3), Inches(0.65))
    gate.fill.solid()
    gate.fill.fore_color.rgb = C_PURPLE
    gate.line.fill.background()
    add_textbox(slide, Inches(4.5), Inches(6.0), Inches(4.3), Inches(0.4), "mova_auth = única puerta", size=16, bold=True, color=C_WHITE, align=PP_ALIGN.CENTER)


def slide_tabla(prs):
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    set_slide_bg(slide)
    add_header_bar(slide, "¿Quién debe pasar por mova_auth?", "Basado en inventario D1")
    headers = ["Módulo", "URL", "Auth hoy", "¿mova_auth?", "Notas"]
    xs = [Inches(0.6), Inches(2.4), Inches(5.2), Inches(8.0), Inches(9.8)]
    for i, h in enumerate(headers):
        add_textbox(slide, xs[i], Inches(1.35), Inches(2.2), Inches(0.35), h, size=11, bold=True, color=C_ACCENT_DARK)
    y = Inches(1.75)
    for mod, url, auth, mova, nota in MODULOS:
        col = C_OK if mova == "Sí" else C_PURPLE if "gate" in mova else C_WARN if mova == "No" else C_TEXT
        add_textbox(slide, xs[0], y, Inches(1.7), Inches(0.32), mod, size=10, bold=True, color=C_TEXT)
        add_textbox(slide, xs[1], y, Inches(2.7), Inches(0.32), url, size=9, color=C_MUTED)
        add_textbox(slide, xs[2], y, Inches(2.6), Inches(0.32), auth, size=9, color=C_TEXT)
        add_textbox(slide, xs[3], y, Inches(1.6), Inches(0.32), mova, size=10, bold=True, color=col)
        add_textbox(slide, xs[4], y, Inches(2.8), Inches(0.32), nota, size=9, color=C_TEXT)
        y += Inches(0.4)
    add_textbox(slide, Inches(0.6), Inches(5.5), Inches(12), Inches(0.5),
                "Submódulos bajo /mova/ (facturas, oc, agencia…) heredan la misma regla: deben pasar por mova_auth.",
                size=13, color=C_ACCENT_DARK)


def slide_excepciones(prs):
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    set_slide_bg(slide)
    add_header_bar(slide, "Excepciones y contenido público", "No requieren mova_auth")
    items = [
        ("/documentos/", "Playbooks HTML públicos (auditoria_mova.html, etc.)"),
        ("Assets estáticos", "CSS, JS, imágenes sin datos sensibles"),
        ("login.php", "Página de entrada — no se protege con guard"),
        ("logout.php", "Cierre de sesión"),
        ("validate.php", "API JSON 200/401 para AJAX"),
    ]
    y = Inches(1.55)
    for tit, desc in items:
        add_textbox(slide, Inches(0.85), y, Inches(3.5), Inches(0.35), tit, size=14, bold=True, color=C_ACCENT_DARK)
        add_textbox(slide, Inches(4.2), y, Inches(8.2), Inches(0.35), desc, size=13, color=C_TEXT)
        y += Inches(0.55)
    box = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.75), Inches(4.8), Inches(11.8), Inches(1.0))
    box.fill.solid()
    box.fill.fore_color.rgb = RGBColor(0xFF, 0xE8, 0xD6)
    box.line.color.rgb = C_WARN
    add_textbox(slide, Inches(0.95), Inches(5.0), Inches(11.4), Inches(0.7),
                "Prohibido post-acuerdo: Google OAuth directo en módulo · JWT en localStorage · logins duplicados por módulo.",
                size=14, bold=True, color=C_WARN)


def slide_checklist(prs):
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    set_slide_bg(slide)
    add_header_bar(slide, "Checklist cierre Día 2", "Compartir con equipo técnico")
    y = Inches(1.5)
    for label, ok in CHECKLIST:
        mark = "✓" if ok else "○"
        col = C_OK if ok else C_WARN
        add_textbox(slide, Inches(0.85), y, Inches(0.5), Inches(0.4), mark, size=20, bold=True, color=col)
        add_textbox(slide, Inches(1.35), y, Inches(10.5), Inches(0.4), label, size=18, color=C_TEXT)
        y += Inches(0.52)
    add_textbox(slide, Inches(0.85), Inches(5.5), Inches(11.5), Inches(0.5),
                "Pendiente: acuerdo formal (correo/acta) · Responsable: _______ · Fecha: _______", size=14, color=C_MUTED)
    add_textbox(slide, Inches(0.85), Inches(6.1), Inches(11.5), Inches(0.45),
                "Próximo: Día 3 — Carpetas y archivos núcleo · mkof/03", size=15, bold=True, color=C_ACCENT_DARK)


def main():
    prs = Presentation()
    prs.slide_width = SLIDE_W
    prs.slide_height = SLIDE_H
    slide_title(prs)
    slide_contexto(prs)
    slide_regla_oro(prs)
    slide_tabla(prs)
    slide_excepciones(prs)
    slide_checklist(prs)
    OUT.parent.mkdir(parents=True, exist_ok=True)
    prs.save(str(OUT))
    print(f"PPT generado: {OUT}")
    print(f"Tamaño: {OUT.stat().st_size // 1024} KB")


if __name__ == "__main__":
    main()
