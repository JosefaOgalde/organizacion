#!/usr/bin/env python3
"""Extrae texto del manual Joyas Mercury y genera JSON para la app."""
import json
import os
import sys

PDF = r"C:\Users\josef\Downloads\Manual de marca - Joyas Mercury.pdf"
OUT_TXT = r"C:\Users\josef\organizacion\joyas-mercury-manual-extraido.txt"
OUT_JSON = r"C:\Users\josef\organizacion\joyas-mercury-manual-seed.json"

def extract():
    if not os.path.exists(PDF):
        return {"error": "PDF no encontrado", "path": PDF}

    size = os.path.getsize(PDF)
    texto = ""
    pages = 0

    try:
        import pdfplumber
        with pdfplumber.open(PDF) as pdf:
            pages = len(pdf.pages)
            parts = []
            for i, page in enumerate(pdf.pages, 1):
                t = page.extract_text() or ""
                if t.strip():
                    parts.append(f"--- Página {i} ---\n{t.strip()}")
            texto = "\n\n".join(parts)
    except ImportError:
        try:
            from pypdf import PdfReader
            reader = PdfReader(PDF)
            pages = len(reader.pages)
            parts = []
            for i, page in enumerate(reader.pages, 1):
                t = page.extract_text() or ""
                if t.strip():
                    parts.append(f"--- Página {i} ---\n{t.strip()}")
            texto = "\n\n".join(parts)
        except ImportError:
            return {"error": "Instala pdfplumber o pypdf", "size_bytes": size}

  # limpiar espacios excesivos
    import re
    texto = re.sub(r"\n{3,}", "\n\n", texto).strip()

    with open(OUT_TXT, "w", encoding="utf-8") as f:
        f.write(texto)

    seed = {
        "clienteId": "cli-joyas-mercury",
        "nombreArchivo": "Manual de marca - Joyas Mercury.pdf",
        "size_bytes": size,
        "size_mb": round(size / (1024 * 1024), 2),
        "pages": pages,
        "char_count": len(texto),
        "manualMarcaTexto": texto[:80000],
        "preview": texto[:500]
    }
    with open(OUT_JSON, "w", encoding="utf-8") as f:
        json.dump(seed, f, ensure_ascii=False, indent=2)

    return seed

if __name__ == "__main__":
    result = extract()
    print(json.dumps(result, ensure_ascii=False, indent=2))
