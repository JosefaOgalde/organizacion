# Landings referencia · Desktop

Capturas **desktop** de las 7 pantallas del diseño Fase 2. Son las únicas visualizadas en la landing JM.

| Archivo | Pantalla |
|---------|----------|
| `01-inicio-referencia.png` | Inicio |
| `02-esencial-referencia.png` | Esencial |
| `03-gold-referencia.png` | Gold |
| `04-deluxe-referencia.png` | Deluxe |
| `05-carrito-referencia.png` | Carrito |
| `06-ayuda-referencia.png` | Ayuda |
| `07-productos-referencia.png` | Productos |

## Fuente HTML (regenerar inicio + colecciones)

```bash
python3 scripts/capturar-jm-referencia-landings.py
python3 scripts/sync-jm-landings-carrusel.py
```

Para Carrito, Ayuda y Productos: reemplaza los PNG directamente en esta carpeta y ejecuta `sync-jm-landings-carrusel.py`.

## Ver en la landing

`http://localhost:3000/index/clientes/joyasmercury/` → sección **Wireframes · Desktop**
