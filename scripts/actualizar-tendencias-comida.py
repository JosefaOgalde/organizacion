#!/usr/bin/env python3
"""Genera data/tendencias-comida-chile.json desde seed curado con fechas verificables."""
from __future__ import annotations

import argparse
import json
import re
import urllib.error
import urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime, timezone, timedelta
from pathlib import Path

from tendencias_comida_seed import STORIES

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'data/tendencias-comida-chile.json'
CHILE_OFFSET = timedelta(hours=-4)
FECHA_EN_URL = re.compile(r'/(20\d{2})[/-](\d{2})[/-](\d{2})')
USER_AGENT = 'Mozilla/5.0 (compatible; TendenciasHER/1.0)'

RED_PATTERNS: dict[str, list[re.Pattern[str]]] = {
    'tiktok': [
        re.compile(r'https?://(?:www\.)?tiktok\.com/@[\w.]+/video/\d+', re.I),
        re.compile(r'https?://vm\.tiktok\.com/\w+/?', re.I),
    ],
    'instagram': [
        re.compile(r'https?://(?:www\.)?instagram\.com/(?:p|reel|reels|tv)/[\w-]+/?', re.I),
    ],
    'youtube': [
        re.compile(r'https?://(?:www\.)?youtube\.com/watch\?v=[\w-]+', re.I),
        re.compile(r'https?://(?:www\.)?youtube\.com/shorts/[\w-]+', re.I),
        re.compile(r'https?://youtu\.be/[\w-]+', re.I),
        re.compile(r'https?://(?:www\.)?youtube\.com/embed/[\w-]+', re.I),
    ],
    'pinterest': [
        re.compile(r'https?://(?:[a-z]+\.)?pinterest\.(?:com|cl)/pin/\d+/?', re.I),
    ],
}
SKIP_TIKTOK_PROFILE = re.compile(
    r'/@(?:24horas|biobio|tvn|encancha)(?:tvn|cl)?(?:\?|$|/)',
    re.I,
)


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


def normalizar_plat(val) -> tuple[str, str]:
    if isinstance(val, dict):
        return val.get('detalle') or val.get('nota') or '', val.get('url') or ''
    if isinstance(val, str):
        return val, ''
    return '', ''


def limpiar_url(url: str) -> str:
    u = url.rstrip('\\').strip().split('"')[0].split("'")[0].split('&')[0]
    m = re.search(r'/embed/([\w-]+)', u)
    if m:
        return f'https://www.youtube.com/watch?v={m.group(1)}'
    m = re.search(r'/shorts/([\w-]+)', u)
    if m:
        return f'https://www.youtube.com/shorts/{m.group(1)}'
    return u.rstrip('/')


def es_url_publicacion(red: str, url: str) -> bool:
    """Solo URLs directas a la red; nunca la noticia periodística."""
    if not url:
        return False
    u = url.lower()
    if red == 'tiktok':
        return 'tiktok.com' in u and ('/video/' in u or 'vm.tiktok.com' in u)
    if red == 'instagram':
        return 'instagram.com' in u and re.search(r'/(p|reel|reels|tv)/', u)
    if red == 'youtube':
        return ('youtube.com' in u or 'youtu.be' in u) and (
            '/watch' in u or '/shorts/' in u or 'youtu.be/' in u
        )
    if red == 'pinterest':
        return 'pinterest.' in u and '/pin/' in u
    return False


def extraer_enlaces_desde_html(html: str) -> dict[str, str]:
    out: dict[str, str] = {}
    for red, patterns in RED_PATTERNS.items():
        for pat in patterns:
            for raw in pat.findall(html):
                url = limpiar_url(raw)
                if red == 'tiktok' and '/video/' not in url and SKIP_TIKTOK_PROFILE.search(url):
                    continue
                if red not in out:
                    out[red] = url
    return out


def fetch_html(url: str, timeout: int = 18) -> str:
    req = urllib.request.Request(url, headers={'User-Agent': USER_AGENT})
    with urllib.request.urlopen(req, timeout=timeout) as res:
        return res.read().decode('utf-8', errors='ignore')


def enlaces_desde_fuente(fuente: str, plataformas: set[str]) -> dict[str, str]:
    try:
        html = fetch_html(fuente)
    except (urllib.error.URLError, TimeoutError, OSError) as err:
        print(f'  · sin enlaces ({err.__class__.__name__}): {fuente[:70]}…')
        return {}
    found = extraer_enlaces_desde_html(html)
    matched = {red: url for red, url in found.items() if red in plataformas}
    return matched


def recolectar_enlaces(stories: list[dict], fetch: bool) -> dict[str, dict[str, str]]:
    if not fetch:
        return {}
    jobs = []
    for story in stories:
        plats = set((story.get('plataformas') or {}).keys())
        if plats:
            jobs.append((story['slug'], story['fuente'], plats))
    out: dict[str, dict[str, str]] = {}
    with ThreadPoolExecutor(max_workers=6) as pool:
        futures = {
            pool.submit(enlaces_desde_fuente, fuente, plats): slug
            for slug, fuente, plats in jobs
        }
        for fut in as_completed(futures):
            slug = futures[fut]
            try:
                links = fut.result()
                if links:
                    out[slug] = links
                    print(f'  · enlaces {slug}: {", ".join(links)}')
            except Exception as err:
                print(f'  · error enlaces {slug}: {err}')
    return out


def publicado_en_de_story(story: dict, enlaces_extra: dict[str, str] | None = None) -> list[dict]:
    plats = story.get('plataformas', {})
    enlaces_extra = enlaces_extra or {}
    vistos: set[str] = set()
    out: list[dict] = []
    if isinstance(plats, dict):
        for red, val in plats.items():
            if val is False or red in vistos:
                continue
            detalle, url = normalizar_plat(val)
            url = url or enlaces_extra.get(red, '')
            vistos.add(red)
            item: dict = {'red': red, 'detalle': detalle or ''}
            if url and es_url_publicacion(red, url):
                item['url'] = url
            out.append(item)
    elif isinstance(story.get('publicadoEn'), list):
        for x in story['publicadoEn']:
            red = x.get('red') or x.get('plataforma')
            if not red or red in vistos:
                continue
            vistos.add(red)
            item = {
                'red': red,
                'detalle': x.get('detalle') or x.get('nota') or '',
            }
            url = x.get('url') or enlaces_extra.get(red, '')
            if url and es_url_publicacion(red, url):
                item['url'] = url
            out.append(item)
    return out


def expandir_stories(enlaces_por_slug: dict[str, dict[str, str]]) -> list[dict]:
    items: list[dict] = []
    prioridad = 1
    for story in STORIES:
        fuente = story['fuente']
        fecha_url = fecha_desde_url(fuente)
        fecha = fecha_url or story['fecha']
        if fecha_url and fecha_url != story['fecha']:
            print(f'  · fecha corregida {story["slug"]}: {story["fecha"]} → {fecha_url}')
        publicado_en = publicado_en_de_story(story, enlaces_por_slug.get(story['slug']))
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
    parser = argparse.ArgumentParser(description='Genera el feed JSON de tendencias comida Chile.')
    parser.add_argument(
        '--sin-fetch',
        action='store_true',
        help='No descargar notas para extraer enlaces a publicaciones en redes.',
    )
    args = parser.parse_args()

    print('Extrayendo enlaces de publicación desde las notas…' if not args.sin_fetch else 'Sin fetch de enlaces (--sin-fetch).')
    enlaces = recolectar_enlaces(STORIES, fetch=not args.sin_fetch)
    tendencias = expandir_stories(enlaces)
    con_url = sum(1 for t in tendencias for x in t.get('publicadoEn', []) if x.get('url'))
    payload = {
        'schemaVersion': 2,
        'actualizado': ahora_chile(),
        'nicho': 'recetas-comida-chile',
        'region': 'Chile',
        'plataformas': ['tiktok', 'instagram', 'youtube', 'pinterest'],
        'resumen': (
            'Una fila por tendencia; publicadoEn indica redes y, si la nota lo enlaza, url de la publicación.'
        ),
        'tendencias': tendencias,
    }
    OUT.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(f'✓ {len(tendencias)} tendencias · {con_url} enlaces a publicaciones → {OUT.relative_to(ROOT)}')


if __name__ == '__main__':
    main()
