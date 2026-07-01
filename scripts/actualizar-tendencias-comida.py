#!/usr/bin/env python3
"""Genera data/tendencias-comida-chile.json desde seed curado con fechas verificables."""
from __future__ import annotations

import json
import re
from datetime import datetime, timezone, timedelta
from pathlib import Path

from tendencias_comida_seed import STORIES

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'data/tendencias-comida-chile.json'
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


def publicado_en_de_story(story: dict) -> list[dict]:
    plats = story.get('plataformas', {})
    vistos: set[str] = set()
    out: list[dict] = []
    if isinstance(plats, dict):
        for red, detalle in plats.items():
            if detalle is False or red in vistos:
                continue
            vistos.add(red)
            out.append({'red': red, 'detalle': detalle or ''})
    elif isinstance(story.get('publicadoEn'), list):
        for x in story['publicadoEn']:
            red = x.get('red') or x.get('plataforma')
            if not red or red in vistos:
                continue
            vistos.add(red)
            out.append({'red': red, 'detalle': x.get('detalle') or x.get('nota') or ''})
    return out


def expandir_stories() -> list[dict]:
    items: list[dict] = []
    prioridad = 1
    for story in STORIES:
        fuente = story['fuente']
        fecha_url = fecha_desde_url(fuente)
        fecha = fecha_url or story['fecha']
        if fecha_url and fecha_url != story['fecha']:
            print(f'  · fecha corregida {story["slug"]}: {story["fecha"]} → {fecha_url}')
        publicado_en = publicado_en_de_story(story)
        items.append({
            'id': story['slug'],
            'titulo': story['titulo'],
            'formato': story['formato'],
            'fechaFuente': fecha,
            'publicadoEn': publicado_en,
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


def main() -> None:
    tendencias = expandir_stories()
    payload = {
        'schemaVersion': 2,
        'actualizado': ahora_chile(),
        'nicho': 'recetas-comida-chile',
        'region': 'Chile',
        'plataformas': ['tiktok', 'instagram', 'youtube', 'pinterest'],
        'resumen': (
            'Una fila por tendencia; el campo publicadoEn indica en qué redes circuló el video.'
        ),
        'tendencias': tendencias,
    }
    OUT.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(f'✓ {len(tendencias)} tendencias únicas → {OUT.relative_to(ROOT)}')


if __name__ == '__main__':
    main()
