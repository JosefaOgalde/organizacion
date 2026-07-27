# Tronwell · Ver cambios que no aparecen (banner / textos)

**Fecha:** 2026-07-27  
**Caso:** editas en Elementor (ej. banner *Cursos de inglés para adultos*) y el sitio público no refleja el cambio.

## 1) Confirmar que quedó publicado

1. En Elementor: **Publicar** / **Actualizar** (no solo Guardar borrador).
2. Si es plantilla Theme Builder (cabecera): editar la que tiene el **punto verde** y publicar.

## 2) Ver la versión fresca (sin caché)

Abrí en el navegador (incógnito):

```
https://tronwell.com/?nocache=1
```

Si la página del banner tiene slug propio, también:

```
https://tronwell.com/TU-URL/?nocache=1
```

Si **con** `?nocache=1` se ve bien y **sin** eso se ve viejo → el cambio **sí está publicado**; lo que falla es la **caché** (servidor/CDN), no Elementor.

## 3) Hard refresh local

- Windows: `Ctrl + F5` o `Ctrl + Shift + R`
- O ventana de **incógnito**

## 4) Purge en WordPress (por si acaso)

1. Plugin **LiteSpeed** (si aparece) → purgar todas las cachés.  
   *Nota (jul 2026): a veces no limpia la copia real del hosting.*
2. **Elementor → Herramientas → Regenerar archivos CSS** (no “Vaciar todo” a lo loco).
3. **Ajustes → Enlaces permanentes → Guardar** (sin cambiar nada).

## 5) Pedido al hosting (si sigue la URL limpia vieja)

> En tronwell.com el contenido nuevo ya se ve con `?nocache=1`, pero sin eso sale la versión antigua. ¿Pueden vaciar caché del servidor / Varnish / Cloudflare / CDN?

## Resumen rápido

| Prueba | Si se ve el cambio… |
|--------|---------------------|
| `?nocache=1` | Está publicado → falta purge hosting |
| Solo en el editor Elementor | Falta **Publicar** |
| Ni con nocache | Revisá que editaste la página/plantilla correcta |

Detalle cabecera (julio): rama `cursor/tronwell-cabecera-cache-63e4` / doc histórico de cabecera + caché.
