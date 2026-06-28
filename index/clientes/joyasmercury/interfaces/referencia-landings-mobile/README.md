# Landings referencia · MÓVIL (390px)

Capturas de referencia **tal cual** del mockup mobile del cliente (7 pantallas). Se usan en el carrusel unificado Desktop / Móvil de la landing.

| Archivo | Pantalla |
|---------|----------|
| `01-inicio-referencia-mobile.png` | Inicio |
| `02-esencial-referencia-mobile.png` | Esencial |
| `03-gold-referencia-mobile.png` | Gold |
| `04-deluxe-referencia-mobile.png` | Deluxe |
| `05-carrito-referencia-mobile.png` | Carrito |
| `06-ayuda-referencia-mobile.png` | Ayuda |
| `07-productos-referencia-mobile.png` | Productos |

## Origen wireframes (para regenerar)

Si editas el HTML/CSS mobile, puedes volver a capturar desde:

| Archivo | Pantalla | Wireframe fuente |
|---------|----------|------------------|
| `01-inicio-referencia-mobile.png` | Inicio | `mockups-inicio/wireframe-inicio.html` |
| `02-esencial-referencia-mobile.png` | Esencial | `mockups-coleccion/wireframe-coleccion.html` |
| `03-gold-referencia-mobile.png` | Gold | idem |
| `04-deluxe-referencia-mobile.png` | Deluxe | idem |
| `05-carrito-referencia-mobile.png` | Carrito | `mockups-carrito/wireframe-carrito-landing.html` |
| `06-ayuda-referencia-mobile.png` | Ayuda | `mockups-ayuda/wireframe-ayuda-landing.html` |
| `07-productos-referencia-mobile.png` | Productos | `mockups-producto/wireframe-producto-landing.html` |

## Generar / actualizar capturas

```bash
python3 scripts/capturar-jm-referencia-landings-mobile.py
python3 scripts/sync-jm-landings-carrusel-mobile.py
```

Requisito: `pip install playwright && playwright install chromium`

## Ver en la landing

`http://localhost:3000/index/clientes/joyasmercury/` → sección **Landings referencia · Móvil**

## Editar diagramas

Abre el wireframe HTML correspondiente, ajusta el CSS mobile y vuelve a capturar.
