# Catálogo Impresoreando · 1080×1350

Carrusel listo para Instagram (Stories / posts verticales).

## Contenido

1. **Portada** — logo oficial + “Todo es a pedido” + @impresoreando  
2. **10 productos** — nombre · SKU · imagen referencial  
3. **Cierre** — “Pide los tuyos en impresoreando” · perfil Instagram · a pedido  

## Ver en el navegador

Con `SERVIR.bat` / `ABRIR-IMPRESOREANDO.bat`:

http://localhost:3000/index/clientes/impresoreando/catalogo/

## Exportar PNG

```bat
node index/clientes/impresoreando/catalogo/exportar-pngs.js
```

Salida: `catalogo/export/*.png` (1080×1350).

## Reemplazar fotos reales

Sustituí los SVG de `refs/` por fotos del producto (mismo nombre de archivo, o editá `productos.js` → campo `ref`).
