#!/usr/bin/env python3
"""Actualiza data/tendencias-comida-chile.json — valida fechaFuente desde la URL de la noticia."""
from __future__ import annotations

import json
import re
from datetime import datetime, timezone, timedelta
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'data' / 'tendencias-comida-chile.json'
CHILE_OFFSET = timedelta(hours=-4)
FECHA_EN_URL = re.compile(r'/(20\d{2})[/-](\d{2})[/-](\d{2})')


def ahora_chile() -> str:
    tz = timezone(CHILE_OFFSET)
    return datetime.now(tz).strftime('%Y-%m-%dT%H:%M:%S%z').replace('+0000', '-04:00')


def fecha_desde_url(url: str | None) -> str | None:
    if not url:
        return None
    m = FECHA_EN_URL.search(url)
    if not m:
        return None
    return f'{m.group(1)}-{m.group(2)}-{m.group(3)}'


def normalizar_item(item: dict) -> dict:
    out = dict(item)
    out.pop('porQueFunciona', None)
    out.pop('ejemploChile', None)
    if 'anguloContenido' in out and 'resumenReceta' not in out:
        out['resumenReceta'] = out.pop('anguloContenido')
    fuente = out.get('fuente')
    if not out.get('fechaFuente'):
        deducida = fecha_desde_url(fuente)
        if deducida:
            out['fechaFuente'] = deducida
    out.pop('fechaViral', None)
    return out


def cargar_actual() -> dict:
    if OUT.exists():
        return json.loads(OUT.read_text(encoding='utf-8'))
    return {}


def fetch_tendencias() -> list[dict]:
    data = cargar_actual()
    items = [normalizar_item(t) for t in data.get('tendencias', [])]
    # Solo entradas con fecha de fuente verificable
    items = [t for t in items if t.get('fechaFuente')]
    return sorted(items, key=lambda x: x.get('fechaFuente', ''), reverse=True)


def main() -> None:
    prev = cargar_actual()
    tendencias = fetch_tendencias()

    payload = {
        'actualizado': ahora_chile(),
        'nicho': 'recetas-comida-chile',
        'region': 'Chile',
        'plataformas': ['tiktok', 'instagram', 'youtube', 'pinterest'],
        'resumen': prev.get(
            'resumen',
            'Tendencias con fecha tomada de la noticia enlazada.',
        ),
        'tendencias': tendencias,
    }

    OUT.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(f'✓ {len(tendencias)} tendencias (con fechaFuente) → {OUT.relative_to(ROOT)}')


if __name__ == '__main__':
    main()
