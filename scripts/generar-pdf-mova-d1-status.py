#!/usr/bin/env python3
"""Genera PDF: MOVA · Día 1 — Status inventario.

Por defecto convierte el PPT a PDF con LibreOffice (idéntico al .pptx).
El HTML slide-deck solo se usa como respaldo (--html-fallback).

En Windows (con PowerPoint instalado), usa en su lugar:
  powershell -File scripts\\generar-pdf-mova-d1-status.ps1

Con tu PPT final en Downloads:
  copy C:\\Users\\josef\\Downloads\\MOVA-D1-Inventario-Status.pptx index\\clientes\\mkof\\
  python scripts\\generar-pdf-mova-d1-status.py
"""

from __future__ import annotations

import argparse
import http.server
import shutil
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

SLIDE_WIDTH = "13.333in"
SLIDE_HEIGHT = "7.5in"

SOFFICE_CANDIDATES = (
    "soffice",
    "libreoffice",
    "soffice.exe",
    r"C:\Program Files\LibreOffice\program\soffice.exe",
    r"C:\Program Files (x86)\LibreOffice\program\soffice.exe",
)


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


def find_soffice() -> str | None:
    for cmd in SOFFICE_CANDIDATES:
        if Path(cmd).exists():
            return cmd
        if shutil.which(cmd):
            return cmd
    return None


def count_ppt_slides(path: Path) -> int | None:
    try:
        from pptx import Presentation
        return len(Presentation(str(path)).slides)
    except Exception:
        return None


def convert_pptx_to_pdf(pptx: Path, out_pdf: Path) -> bool:
    soffice = find_soffice()
    if not soffice:
        return False

    out_pdf.parent.mkdir(parents=True, exist_ok=True)
    tmp_dir = out_pdf.parent
    try:
        subprocess.run(
            [
                soffice,
                "--headless",
                "--convert-to",
                "pdf",
                "--outdir",
                str(tmp_dir),
                str(pptx.resolve()),
            ],
            check=True,
            capture_output=True,
            timeout=180,
        )
    except (subprocess.CalledProcessError, subprocess.TimeoutExpired, FileNotFoundError) as exc:
        print(f"  Error LibreOffice: {exc}", file=sys.stderr)
        return False

    generated = tmp_dir / f"{pptx.stem}.pdf"
    if not generated.exists():
        return False
    if generated.resolve() != out_pdf.resolve():
        generated.replace(out_pdf)
    return out_pdf.exists()


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
    parser = argparse.ArgumentParser(
        description="Genera PDF idéntico al PPT MOVA D1 (convierte el .pptx)"
    )
    parser.add_argument(
        "--pptx",
        type=Path,
        default=PPT_PATH,
        help="Ruta al PPT fuente (default: index/clientes/mkof/MOVA-D1-Inventario-Status.pptx)",
    )
    parser.add_argument(
        "--html-fallback",
        action="store_true",
        help="Usar HTML slide-deck solo si LibreOffice no está disponible (no recomendado)",
    )
    parser.add_argument(
        "--force-html",
        action="store_true",
        help="Forzar generación desde HTML (aproximación visual, no idéntica al PPT)",
    )
    args = parser.parse_args()

    if not args.pptx.exists():
        print(f"Error: no existe el PPT: {args.pptx}", file=sys.stderr)
        print("Copia tu archivo:", file=sys.stderr)
        print("  copy C:\\Users\\josef\\Downloads\\MOVA-D1-Inventario-Status.pptx index\\clientes\\mkof\\", file=sys.stderr)
        sys.exit(1)

    slides = count_ppt_slides(args.pptx)
    if slides is not None:
        print(f"PPT fuente: {args.pptx} ({slides} slides)")

    if not args.force_html:
        print("Convirtiendo PPT → PDF con LibreOffice (salida idéntica al .pptx)…")
        if convert_pptx_to_pdf(args.pptx, OUT_PDF):
            print(f"PDF generado: {OUT_PDF}")
            print(f"Tamaño: {OUT_PDF.stat().st_size // 1024} KB")
            print("Método: conversión directa del PPT")
            return
        print("LibreOffice no encontrado.", file=sys.stderr)
        if not args.html_fallback:
            print(file=sys.stderr)
            print("En Windows con PowerPoint instalado, usa:", file=sys.stderr)
            print("  powershell -File scripts\\generar-pdf-mova-d1-status.ps1", file=sys.stderr)
            print(file=sys.stderr)
            print("O instala LibreOffice: https://www.libreoffice.org/download/", file=sys.stderr)
            print("O fuerza HTML (no idéntico): python scripts\\generar-pdf-mova-d1-status.py --force-html", file=sys.stderr)
            sys.exit(2)

    port = free_port()
    httpd = serve_root(port)
    url = f"http://127.0.0.1:{port}{HTML_PATH}"
    try:
        print("Generando PDF desde HTML (respaldo — puede diferir del PPT)…")
        render_html_pdf(url, OUT_PDF)
    finally:
        httpd.shutdown()

    print(f"PDF generado: {OUT_PDF}")
    print(f"Tamaño: {OUT_PDF.stat().st_size // 1024} KB")
    print("Método: HTML fallback (no idéntico al PPT)")


if __name__ == "__main__":
    main()
