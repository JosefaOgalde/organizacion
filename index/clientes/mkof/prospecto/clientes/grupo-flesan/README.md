# Grupo Flesan — Prospecto MKOF

Diagnóstico **general** (menos detalle que Clínica Indisa). Foco: marca / webs / RRSS para oferta de servicios.

## Abrir

Siempre el flujo unificado:

```bat
git pull
ABRIR-LARAVEL.bat
```

URL: `http://127.0.0.1:8000/index/clientes/mkof/prospecto/clientes/grupo-flesan/?disco=1`

Atajo opcional (igual termina en ABRIR-LARAVEL): `VER-GRUPO-FLESAN.bat`

## Estructura

```
grupo-flesan/
├── index.html              ← hub
├── meta.json
├── DIAGNOSTICO-GENERAL.md  ← lectura principal
├── fuentes.json
├── data/
│   ├── webs-marcas.json
│   ├── ecosistema-rrss.json
│   ├── competencia.json
│   └── oportunidades.json
└── RRSS/                   ← detalle IG cuando llegue
```

## Pendiente

1. Detalle Instagram (usuaria)
2. Copiar PDFs Manual de Marca / Valores al repo
