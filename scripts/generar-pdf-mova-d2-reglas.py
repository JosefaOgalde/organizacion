#!/usr/bin/env python3
"""Genera PDF: MOVA · Día 2 — Reglas mova_auth (conversión directa del PPT)."""

import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PPT_PATH = ROOT / "index/clientes/mkof/MOVA-D2-Reglas-mova_auth.pptx"
OUT_PDF = ROOT / "index/clientes/mkof/MOVA-D2-Reglas-mova_auth.pdf"

SOFFICE_CANDIDATES = (
    "soffice",
    "libreoffice",
    r"C:\Program Files\LibreOffice\program\soffice.exe",
    r"C:\Program Files (x86)\LibreOffice\program\soffice.exe",
)


def find_soffice():
    import shutil
    for cmd in SOFFICE_CANDIDATES:
        if Path(cmd).exists():
            return cmd
        if shutil.which(cmd):
            return cmd
    return None


def main():
    if not PPT_PATH.exists():
        print("Generando PPT primero…", file=sys.stderr)
        subprocess.run([sys.executable, str(ROOT / "scripts/generar-ppt-mova-d2-reglas.py")], check=True)

    soffice = find_soffice()
    if not soffice:
        print("LibreOffice no encontrado. En Windows usa:", file=sys.stderr)
        print("  powershell -File scripts\\generar-pdf-mova-d2-reglas.ps1", file=sys.stderr)
        sys.exit(2)

    out_dir = OUT_PDF.parent
    out_dir.mkdir(parents=True, exist_ok=True)
    subprocess.run(
        [soffice, "--headless", "--convert-to", "pdf", "--outdir", str(out_dir), str(PPT_PATH)],
        check=True,
        timeout=180,
    )
    generated = out_dir / f"{PPT_PATH.stem}.pdf"
    if generated.exists() and generated != OUT_PDF:
        generated.replace(OUT_PDF)
    print(f"PDF generado: {OUT_PDF}")
    print(f"Tamaño: {OUT_PDF.stat().st_size // 1024} KB")


if __name__ == "__main__":
    main()
