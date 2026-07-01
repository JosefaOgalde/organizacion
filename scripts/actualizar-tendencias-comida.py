#!/usr/bin/env python3
"""Actualiza data/tendencias-comida-chile.json con tendencias de comida Chile.

Uso:
  python3 scripts/actualizar-tendencias-comida.py

El feed se carga automáticamente en index/clientes/Herramientas/Tendencias.html.
Para integrar APIs reales (TikTok Creative Center, etc.), extiende fetch_tendencias().
"""
from __future__ import annotations

import json
from datetime import datetime, timezone, timedelta
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'data' / 'tendencias-comida-chile.json'

# Chile UTC-4 (invierno) / UTC-3 (verano) — simplificado
CHILE_OFFSET = timedelta(hours=-4)


def ahora_chile() -> str:
    tz = timezone(CHILE_OFFSET)
    return datetime.now(tz).strftime('%Y-%m-%dT%H:%M:%S%z').replace('+0000', '-04:00')


def cargar_actual() -> dict:
    if OUT.exists():
        return json.loads(OUT.read_text(encoding='utf-8'))
    return {}


def fetch_tendencias() -> list[dict]:
    """Punto de extensión: conectar APIs o scrapers de TikTok / Instagram / YouTube.

    Por ahora conserva el catálogo curado y reordena por prioridad.
  """
    data = cargar_actual()
    items = data.get('tendencias', [])
    return sorted(items, key=lambda x: x.get('prioridad', 99))


def main() -> None:
    prev = cargar_actual()
    tendencias = fetch_tendencias()

    payload = {
        'actualizado': ahora_chile(),
        'nicho': 'recetas-comida-chile',
        'region': 'Chile',
        'plataformas': ['tiktok', 'instagram', 'youtube'],
        'resumen': prev.get(
            'resumen',
            'Tendencias virales de comida y recetas con señal fuerte en Chile — sin búsqueda manual.',
        ),
        'tendencias': tendencias,
    }

    OUT.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(f'✓ {len(tendencias)} tendencias → {OUT.relative_to(ROOT)}')
    print(f'  actualizado: {payload["actualizado"]}')


if __name__ == '__main__':
    main()
