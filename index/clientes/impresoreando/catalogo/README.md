# Catálogo Impresoreando · 1080×1350

Carrusel listo para Instagram (Stories / posts verticales).

## Contenido

1. **Portada** — logo oficial + “Todo es a pedido” + @impresoreando  
2. **10 productos** — nombre · SKU · imagen referencial  
3. **Cierre** — “Pide los tuyos en impresoreando” · perfil Instagram · a pedido  

## Ver en el navegador

Con `SERVIR.bat` / `ABRIR-IMPRESOREANDO.bat`:

http://localhost:3000/index/clientes/impresoreando/catalogo/

## Descargar PDF

- Archivo listo: [`export/catalogo-impresoreando.pdf`](export/catalogo-impresoreando.pdf) (12 páginas · 1080×1350)
- En la UI del catálogo: botón **Descargar PDF**
- Alternativa: **Imprimir / PDF** (diálogo del navegador → Guardar como PDF)

Regenerar PDF desde los PNG:

```bat
node index/clientes/impresoreando/catalogo/exportar-pdf.js
```

(requiere `pip install img2pdf`)

## Exportar PNG

Con `SERVIR.bat` / `python -m http.server` en la raíz del repo:

```bat
set CAT_BASE=http://127.0.0.1:3000/index/clientes/impresoreando
node index/clientes/impresoreando/catalogo/exportar-pngs.js
node index/clientes/impresoreando/catalogo/exportar-pdf.js
```

Salida: `catalogo/export/*.png` + `catalogo-impresoreando.pdf`.

## Reemplazar fotos reales

Sustituí los SVG de `refs/` por fotos del producto (mismo nombre de archivo, o editá `productos.js` → campo `ref`) y volvé a exportar PNG + PDF.
