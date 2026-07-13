# Joyas Mercury · landing cliente

Todo el trabajo de **joyasmercury.cl** (Fase 2) vive en esta carpeta.

## Entrada principal

```
http://localhost:3000/index/clientes/joyasmercury/
```

Incluye: **wireframes desktop y mobile** (7 pantallas cada uno), identidad, menú objetivo, Gantt y checklist.

## Atajos

| Página | URL |
|--------|-----|
| Landing | `/index/clientes/joyasmercury/` |
| Wireframes desktop (pantalla completa) | `/index/clientes/joyasmercury/wireframes.html` |
| Wireframes mobile (pantalla completa) | `/index/clientes/joyasmercury/wireframes/mobile.html` |
| Wireframes desktop (edición) | `/index/clientes/joyasmercury/wireframes/desktop.html` |

## Wireframes desktop (7 pantallas)

Carpeta: `interfaces/referencia-landings/`

| # | Archivo | Pantalla |
|---|---------|----------|
| 1 | `01-inicio-referencia.png` | Inicio |
| 2 | `02-esencial-referencia.png` | Esencial |
| 3 | `03-gold-referencia.png` | Gold |
| 4 | `04-deluxe-referencia.png` | Deluxe |
| 5 | `05-carrito-referencia.png` | Carrito |
| 6 | `06-ayuda-referencia.png` | Ayuda |
| 7 | `07-productos-referencia.png` | Productos |

HTML fuente (capturas): `interfaces/referencia-landings/referencia-landings.html`

Regenerar manifiesto tras reemplazar PNG:

```bash
python3 scripts/sync-jm-landings-carrusel.py
```

## Wireframes mobile (7 pantallas · 390px)

Carpeta: `interfaces/referencia-landings-mobile/`

| # | Archivo | Pantalla | HTML fuente |
|---|---------|----------|-------------|
| 1 | `01-inicio-referencia-mobile.png` | Inicio | `mockups-inicio/wireframe-inicio.html` |
| 2 | `02-esencial-referencia-mobile.png` | Esencial | `mockups-coleccion/wireframe-coleccion.html?coleccion=esencial` |
| 3 | `03-gold-referencia-mobile.png` | Gold | `mockups-coleccion/wireframe-coleccion.html?coleccion=gold` |
| 4 | `04-deluxe-referencia-mobile.png` | Deluxe | `mockups-coleccion/wireframe-coleccion.html?coleccion=deluxe` |
| 5 | `05-carrito-referencia-mobile.png` | Carrito | `mockups-carrito/wireframe-carrito-landing.html` |
| 6 | `06-ayuda-referencia-mobile.png` | Ayuda | `mockups-ayuda/wireframe-ayuda-landing.html` |
| 7 | `07-productos-referencia-mobile.png` | Productos | `mockups-producto/wireframe-producto-landing.html` |

Regenerar capturas y manifiesto:

```bash
python3 scripts/capturar-jm-referencia-landings-mobile.py
python3 scripts/sync-jm-landings-carrusel-mobile.py
```

## Estructura

```
joyasmercury/
├── index.html          ← landing cliente (desktop + mobile)
├── wireframes.html     ← carrusel desktop pantalla completa
├── wireframes/
│   ├── desktop.html    ← carrusel desktop (edición)
│   └── mobile.html     ← carrusel mobile (edición)
├── identidad/          ← manual de marca, logos
├── interfaces/
│   ├── referencia-landings/        ← 7 PNG desktop + HTML fuente
│   ├── referencia-landings-mobile/ ← 7 PNG mobile
│   ├── mockups-inicio/             ← wireframe inicio mobile
│   ├── mockups-coleccion/          ← wireframe colección + paginación
│   ├── mockups-carrito/
│   ├── mockups-ayuda/
│   ├── mockups-producto/
│   └── README.md                   ← auditoría sitio (PNG estáticos)
└── dia-1/              ← guías auditoría menú
```

## Agente

`@joyas-mercury` · organiser: `index.html?tarea=joyas-mercury/01`

## Guías Fase 2

Ver [GUIAS-FASE2.md](GUIAS-FASE2.md) y [interfaces/README.md](interfaces/README.md).
