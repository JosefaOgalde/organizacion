# Landings referencia · carrusel ficha JM

Mockups del carrusel en la landing del cliente.

## Archivos del carrusel (7)

| Archivo | Pantalla |
|---------|----------|
| `01-inicio-referencia.png` | Inicio |
| `02-esencial-referencia.png` | Esencial |
| `03-gold-referencia.png` | Gold |
| `04-deluxe-referencia.png` | Deluxe |
| `05-carrito-referencia.png` | Carrito |
| `06-ayuda-referencia.png` | Ayuda |
| `07-productos-referencia.png` | Productos |

## Agregar o reemplazar PNG

1. Copia tus `.png` en **esta carpeta**.
2. Regenera el manifiesto y el JSON (lee **todos** los `.png` de esta carpeta):

```bash
python3 scripts/sync-jm-landings-carrusel.py
```

Esto actualiza `carrusel.manifest.js` y `carrusel.json`. La landing carga `carrusel.json` al abrir y muestra **todas** las imágenes listadas.

3. Recarga la landing con **Ctrl+Shift+R**:
   `http://localhost:3000/index/clientes/joyasmercury/`

El script detecta todos los PNG, actualiza `carrusel.manifest.js` y sube la versión de caché.

## Wireframe interactivo

```
/index/clientes/JoyasMercury/interfaces/referencia-landings/referencia-landings.html?pagina=inicio
/index/clientes/JoyasMercury/interfaces/referencia-landings/referencia-landings.html?pagina=coleccion&coleccion=esencial
```
