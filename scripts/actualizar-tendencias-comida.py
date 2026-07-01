#!/usr/bin/env python3
"""Genera data/tendencias-comida-chile.json desde seed curado con fechas verificables."""
from __future__ import annotations

import json
import re
from datetime import datetime, timezone, timedelta
from pathlib import Path

from tendencias_comida_seed import STORIES

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


def expandir_stories() -> list[dict]:
    items: list[dict] = []
    prioridad = 1
    for story in STORIES:
        fuente = story['fuente']
        fecha_url = fecha_desde_url(fuente)
        fecha = fecha_url or story['fecha']
        if fecha_url and fecha_url != story['fecha']:
            print(f'  · fecha corregida {story["slug"]}: {story["fecha"]} → {fecha_url}')
        plataformas = story.get('plataformas', {})
        for plat, formato_extra in plataformas.items():
            titulo = story['titulo']
            formato = story['formato']
            if isinstance(formato_extra, str) and formato_extra:
                formato = f'{formato} · {formato_extra}'
            items.append({
                'id': f'{plat}-{story["slug"]}',
                'plataforma': plat,
                'titulo': titulo,
                'formato': formato,
                'fechaFuente': fecha,
                'kpis': {
                    'vistas': story.get('vistas', '—'),
                    'engagement': story.get('engagement', '—'),
                    'crecimiento': story.get('crecimiento', '—'),
                    'senal': story.get('senal', 'medio'),
                },
                'hashtags': story.get('hashtags', []),
                'ingredientes': story.get('ingredientes', []),
                'resumenReceta': story.get('resumenReceta', ''),
                'fuente': fuente,
                'prioridad': prioridad,
            })
            prioridad += 1
    return sorted(items, key=lambda x: x.get('fechaFuente', ''), reverse=True)


def contar_por_plataforma(items: list[dict], desde: str, hasta: str) -> dict[str, int]:
    counts = {p: 0 for p in ['tiktok', 'instagram', 'youtube', 'pinterest']}
    for t in items:
        f = t.get('fechaFuente', '')
        if desde <= f <= hasta and t.get('plataforma') in counts:
            counts[t['plataforma']] += 1
    return counts


def main() -> None:
    tendencias = expandir_stories()
    payload = {
        'actualizado': ahora_chile(),
        'nicho': 'recetas-comida-chile',
        'region': 'Chile',
        'plataformas': ['tiktok', 'instagram', 'youtube', 'pinterest'],
        'resumen': (
            'Tendencias de comida e ingredientes en Chile — fechas tomadas de la URL '
            'o fecha editorial verificada de la noticia enlazada.'
        ),
        'tendencias': tendencias,
    }
    OUT.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(f'✓ {len(tendencias)} tendencias → {OUT.relative_to(ROOT)}')
    # Referencia: junio 2026 (filtro "mes" típico si hoy es 2026-07-01)
    junio = contar_por_plataforma(tendencias, '2026-06-01', '2026-06-30')
    print(f'  Junio 2026 por red: {junio}')
    trim = contar_por_plataforma(tendencias, '2026-04-02', '2026-07-01')
    print(f'  Últimos ~90 días por red: {trim}')


if __name__ == '__main__':
    main()
