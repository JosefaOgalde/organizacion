# Landings referencia · MÓVIL (390px)

Diagramación mobile de las **7 pantallas** del carrusel desktop:

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
