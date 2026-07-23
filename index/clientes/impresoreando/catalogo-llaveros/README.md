# Catálogo Llaveros · Impresoreando

Formato Instagram **1080×1350**. Portada **Llaveros** · **2 productos por página** · 24 llaveros · cierre.

## Ver

Con `ABRIR-LARAVEL.bat`:

- Vista interactiva: http://127.0.0.1:8000/index/clientes/impresoreando/catalogo-llaveros/
- **Páginas (si el PDF sale en blanco):** http://127.0.0.1:8000/index/clientes/impresoreando/catalogo-llaveros/ver.html
- Descargar PDF: http://127.0.0.1:8000/index/clientes/impresoreando/catalogo-llaveros/export/catalogo-llaveros.pdf

En el Explorer (Windows), abrí el archivo directo:

`index\clientes\impresoreando\catalogo-llaveros\export\catalogo-llaveros.pdf`

Si la URL del PDF da pantalla blanca: descargalo (botón derecho → Guardar) o usá `ver.html`. Traé la rama `cursor/catalogo-llaveros-4e97` con `git pull` si el archivo no está en tu PC.

## PDF

- Listo: [`export/catalogo-llaveros.pdf`](export/catalogo-llaveros.pdf) (14 páginas)
- Regenerar:

```bat
python index\clientes\impresoreando\catalogo-llaveros\generar-pdf-llaveros.py
```

## Fotos

Pon las fotos reales en `refs/` con estos nombres (jpg):

`01-dona.jpg` … `24-labios-pastillas.jpg`

Si un archivo ya existe, el generador **no lo pisa**. Luego regenerá el PDF.

Los ítems con **(debes seleccionar un diseño)** lo muestran en la ficha:

Mario Bloques · Tamagotchi Gato · Mac Classic · Nickelodeon · Retro Arcade · Chicas Superpoderosas · Huella porta foto · Vinilos · Cápsula porta pastilla.
