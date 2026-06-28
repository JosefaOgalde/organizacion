# Landings referencia · carrusel ficha JM

Mockups del carrusel **Inicio → Esencial → Gold → Deluxe** en la landing del cliente.

## Agregar o reemplazar tus PNG

1. Copia tus archivos `.png` en **esta carpeta** (`referencia-landings/`).
2. Regenera el manifiesto (detecta todos los PNG y sus títulos):

```bash
python3 scripts/sync-jm-landings-carrusel.py
```

3. Recarga la landing con **Ctrl+Shift+R**:
   `http://localhost:3000/index/clientes/joyasmercury/`

El script actualiza `carrusel.manifest.js` y sube la versión de caché para que el navegador muestre las imágenes nuevas.

## Archivos actuales del carrusel

| Archivo | Pantalla |
|---------|----------|
| `01-inicio-referencia.png` | Inicio |
| `02-esencial-referencia.png` | Esencial |
| `03-gold-referencia.png` | Gold |
| `04-deluxe-referencia.png` | Deluxe |

Puedes usar **otros nombres** (ej. `inicio.png`, `landing-gold.png`); el script de sync los detecta y ordena por nombre.

## Wireframe interactivo

```
/index/clientes/JoyasMercury/interfaces/referencia-landings/referencia-landings.html?pagina=inicio
/index/clientes/JoyasMercury/interfaces/referencia-landings/referencia-landings.html?pagina=coleccion&coleccion=esencial
```

## Regenerar capturas desde HTML

```bash
python3 scripts/capturar-jm-referencia-landings.py
python3 scripts/sync-jm-landings-carrusel.py
```
