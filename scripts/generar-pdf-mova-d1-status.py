#!/usr/bin/env python3
"""Genera PDF: MOVA · Día 1 — Status inventario.

El PDF replica las 9 slides del PPT MOVA-D1-Inventario-Status.pptx
(una página landscape por slide). Fuente HTML: mova-d1-status-pdf.html

Uso con tu PPT final en Downloads:
  copy C:\\Users\\josef\\Downloads\\MOVA-D1-Inventario-Status.pptx index\\clientes\\mkof\\
  python scripts\\generar-pdf-mova-d1-status.py
"""

import argparse
import http.server
import socket
import subprocess
import sys
import threading
from pathlib import Path

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent.parent
HTML_PATH = "/index/clientes/mkof/mova-d1-status-pdf.html"
PPT_PATH = ROOT / "index/clientes/mkof/MOVA-D1-Inventario-Status.pptx"
OUT_PDF = ROOT / "index/clientes/mkof/MOVA-D1-Inventario-Status.pdf"

# Mismas dimensiones que el PPT widescreen (13.333" × 7.5")
SLIDE_WIDTH = "13.333in"
SLIDE_HEIGHT = "7.5in"


def free_port():
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.bind(("127.0.0.1", 0))
        return s.getsockname()[1]


def serve_root(port):
    import os
    os.chdir(ROOT)
    handler = http.server.SimpleHTTPRequestHandler
    httpd = http.server.ThreadingHTTPServer(("127.0.0.1", port), handler)
    thread = threading.Thread(target=httpd.serve_forever, daemon=True)
    thread.start()
    return httpd


def count_ppt_slides(path: Path) -> int | None:
    try:
        from pptx import Presentation
        return len(Presentation(str(path)).slides)
    except Exception:
        return None


def try_convert_pptx_to_pdf(pptx: Path, out_pdf: Path) -> bool:
    """Intenta LibreOffice si está instalado (opcional en Windows con LO)."""
    for cmd in ("soffice", "libreoffice"):
        try:
            subprocess.run(
                [cmd, "--headless", "--convert-to", "pdf", "--outdir", str(out_pdf.parent), str(pptx)],
                check=True,
                capture_output=True,
                timeout=120,
            )
            generated = out_pdf.parent / f"{pptx.stem}.pdf"
            if generated.exists() and generated != out_pdf:
                generated.replace(out_pdf)
            return out_pdf.exists()
        except (FileNotFoundError, subprocess.CalledProcessError, subprocess.TimeoutExpired):
            continue
    return False


def render_html_pdf(url: str, out_pdf: Path) -> None:
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1280, "height": 720})
        page.goto(url, wait_until="networkidle", timeout=60000)
        page.wait_for_timeout(600)
        out_pdf.parent.mkdir(parents=True, exist_ok=True)
        page.pdf(
            path=str(out_pdf),
            width=SLIDE_WIDTH,
            height=SLIDE_HEIGHT,
            print_background=True,
            margin={"top": "0", "bottom": "0", "left": "0", "right": "0"},
        )
        browser.close()


def main():
    parser = argparse.ArgumentParser(description="Genera PDF alineado al PPT D1 MOVA")
    parser.add_argument(
        "--from-pptx",
        action="store_true",
        help="Intentar convertir el .pptx con LibreOffice (si está instalado)",
    )
    parser.add_argument(
        "--pptx",
        type=Path,
        default=PPT_PATH,
        help="Ruta al PPT fuente",
    )
    args = parser.parse_args()

    slides = count_ppt_slides(args.pptx)
    if slides is not None:
        print(f"PPT fuente: {args.pptx} ({slides} slides)")
        if slides != 9:
            print(f"  Aviso: el HTML PDF espera 9 slides; el PPT tiene {slides}.", file=sys.stderr)

    if args.from_pptx and args.pptx.exists():
        print("Intentando conversión directa PPT → PDF (LibreOffice)…")
        if try_convert_pptx_to_pdf(args.pptx, OUT_PDF):
            print(f"PDF generado desde PPT: {OUT_PDF}")
            print(f"Tamaño: {OUT_PDF.stat().st_size // 1024} KB")
            return
        print("  LibreOffice no disponible — usando HTML slide deck.", file=sys.stderr)

    port = free_port()
    httpd = serve_root(port)
    url = f"http://127.0.0.1:{port}{HTML_PATH}"
    try:
        print(f"Generando PDF desde HTML (1 página = 1 slide PPT)…")
        render_html_pdf(url, OUT_PDF)
    finally:
        httpd.shutdown()

    print(f"PDF generado: {OUT_PDF}")
    print(f"Tamaño: {OUT_PDF.stat().st_size // 1024} KB")
    print(f"Slides en PDF: 9 (formato {SLIDE_WIDTH} × {SLIDE_HEIGHT})")


if __name__ == "__main__":
    main()
