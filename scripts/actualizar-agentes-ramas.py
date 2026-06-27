#!/usr/bin/env python3
"""Actualiza data/agentes-ramas.json con ramas cursor/* del repo."""
import json
import subprocess
from pathlib import Path
from datetime import date

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'data' / 'agentes-ramas.json'

# Ramas conocidas → agente (prefijo en nombre de rama)
MAPEO = [
    ('joyas-mercury', 'joyas-mercury'),
    ('cla-', 'adl-cla'),
    ('organizador-', 'organizacion'),
    ('vista-calendario', 'organizacion'),
    ('clientes-portal', 'organizacion'),
    ('fix-rutas', 'organizacion'),
]


def agente_por_rama(nombre):
    base = nombre.replace('cursor/', '')
    for prefijo, agente_id in MAPEO:
        if prefijo in base:
            return agente_id
    return 'organizacion'


def listar_ramas():
    r = subprocess.run(
        ['git', 'branch', '-a'],
        cwd=ROOT,
        capture_output=True,
        text=True,
        check=True,
    )
    ramas = set()
    for line in r.stdout.splitlines():
        line = line.strip().lstrip('* ')
        if 'cursor/' not in line:
            continue
        line = line.replace('remotes/origin/', '').strip()
        if line.startswith('cursor/'):
            ramas.add(line)
    return sorted(ramas)


def main():
    data = json.loads(OUT.read_text(encoding='utf-8'))
    por_agente = {a['id']: a for a in data['agentes']}
    nombres_existentes = set()
    for a in data['agentes']:
        for r in a.get('ramas', []):
            nombres_existentes.add(r['nombre'])

    for nombre in listar_ramas():
        if nombre in nombres_existentes:
            continue
        aid = agente_por_rama(nombre)
        agente = por_agente.get(aid)
        if not agente:
            continue
        agente.setdefault('ramas', []).append({
            'nombre': nombre,
            'titulo': nombre.split('/')[-1].replace('-', ' '),
            'pr': None,
            'estado': 'activa',
        })
        nombres_existentes.add(nombre)

    data['actualizado'] = date.today().isoformat()
    OUT.write_text(json.dumps(data, indent=2, ensure_ascii=False) + '\n', encoding='utf-8')
    print('Actualizado', OUT)


if __name__ == '__main__':
    main()
