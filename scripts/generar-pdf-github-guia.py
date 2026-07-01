#!/usr/bin/env python3
"""Genera PDF de la guía GitHub MOVA con capturas reales del sitio."""

import http.server
import socket
import threading
from pathlib import Path

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent.parent
GUIA_URL_PATH = "/index/clientes/mkof/github-cuenta.html"
OUT_PDF = ROOT / "index/clientes/mkof/MOVA-GitHub-Paso1-Crear-Cuenta.pdf"


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


def main():
    port = free_port()
    httpd = serve_root(port)
    url = f"http://127.0.0.1:{port}{GUIA_URL_PATH}"

    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page(viewport={"width": 1100, "height": 1400})
            page.goto(url, wait_until="networkidle", timeout=120000)
            page.wait_for_timeout(2000)

            OUT_PDF.parent.mkdir(parents=True, exist_ok=True)
            page.pdf(
                path=str(OUT_PDF),
                format="A4",
                print_background=True,
                margin={"top": "14mm", "bottom": "14mm", "left": "12mm", "right": "12mm"},
            )
            browser.close()
    finally:
        httpd.shutdown()

    print(f"PDF generado: {OUT_PDF}")
    print(f"Tamaño: {OUT_PDF.stat().st_size // 1024} KB")


if __name__ == "__main__":
    main()
