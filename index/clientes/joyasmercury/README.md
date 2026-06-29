# Joyas Mercury · landing cliente

Todo el trabajo de **joyasmercury.cl** (Fase 2) vive en esta carpeta.

## Entrada principal

```
http://localhost:3000/index/clientes/joyasmercury/
```

Incluye: **wireframes desktop** (7 pantallas), identidad, menú objetivo, Gantt y checklist.

## Atajos

| Página | URL |
|--------|-----|
| Landing | `/index/clientes/joyasmercury/` |
| Wireframes desktop (pantalla completa) | `/index/clientes/joyasmercury/wireframes.html` |

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

Regenerar manifiesto tras reemplazar PNG:

```bash
python3 scripts/sync-jm-landings-carrusel.py
```

## Estructura

```
joyasmercury/
├── index.html          ← landing cliente
├── wireframes.html     ← carrusel desktop pantalla completa
├── identidad/          ← manual de marca, logos
├── interfaces/
│   ├── referencia-landings/   ← 7 PNG desktop + HTML fuente capturas
│   └── README.md              ← auditoría sitio (PNG estáticos)
└── dia-1/              ← guías auditoría menú
```

## Agente

`@joyas-mercury` · organiser: `index.html?tarea=joyas-mercury/01`

## Guías Fase 2

Ver [GUIAS-FASE2.md](GUIAS-FASE2.md) y [interfaces/README.md](interfaces/README.md).
