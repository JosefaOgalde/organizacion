# ECR — Sección «Descubre las tendencias ECR GROUP®»

Corrección del filtro de categorías para que actualice **bloque izquierdo** y **carrusel central** a la vez.

Sitio: https://ecrgroup.cl/blog/

---

## Diagnóstico

La página usa **dos widgets Taxonomy Filter** de Elementor Pro:

| Widget | ID HTML | Loop conectado | Rol |
|--------|---------|----------------|-----|
| Filtro visible | `#filtro-principal` | `7f45e18` | Bloque grande (izquierda) |
| Filtro oculto | `#filtro-oculto` | ~~`7c489f6`~~ → debe ser `bc0cdd5` | Carrusel (centro) |

El script de sincronización hace click en `#filtro-oculto` cuando el usuario elige una categoría en `#filtro-principal`. Eso funcionaba antes del carrusel.

**Problema:** al convertir la columna central en carrusel con paginación AJAX, el loop pasó a ser `bc0cdd5`, pero `#filtro-oculto` sigue apuntando al loop antiguo `7c489f6` (ya no existe en la página). Por eso solo se actualiza el bloque izquierdo.

---

## Paso 1 — Elementor (obligatorio)

1. Editar la página **Blog** en Elementor.
2. Buscar el widget **Taxonomy Filter** oculto (`#filtro-oculto`, clase `elementor-hidden-*`).
3. En **Contenido → Query → Selected Loop Grid** (o «Elemento seleccionado»), elegir el loop del **carrusel central** (`bc0cdd5`, plantilla 1144, paginación Anterior/Siguiente).
4. Guardar y publicar.

Comprobar en el HTML publicado que `#filtro-oculto` tenga:

```html
data-settings="{&quot;selected_element&quot;:&quot;bc0cdd5&quot;, ...}"
```

---

## Paso 2 — Script de sincronización (recomendado)

Reemplazar el bloque `<script>` del widget HTML junto a `#filtro-principal` por el contenido de [`filtro-sync.js`](./filtro-sync.js).

Mejoras respecto al script actual:

- Sincroniza por `data-filter` (no por índice del botón), así funciona aunque «Sin categoría» esté oculto.
- Re-bindea después de que Elementor reconstruya los botones.

---

## Paso 3 — Script del carrusel (recomendado)

Reemplazar el bloque `<script>` del widget HTML debajo del loop `bc0cdd5` por el contenido de [`carrusel-paginacion.js`](./carrusel-paginacion.js).

Incluye:

- Botones Anterior/Siguiente deshabilitados en la primera/última página.
- Clase anti-parpadeo durante la recarga AJAX.
- **Re-aplicar paginación cuando cambia el filtro** (`elementor/loop/query_filter_end`).

---

## Paso 4 — Bug menor en script superior (opcional)

En el script del loop `8723a53` («Revisa nuestros artículos»), la función se llama `arreglarPaginacionArriba` pero se invoca como `forzarBotonesArriba()`. Renombrar la llamada o la función para que coincidan.

---

## Verificación

1. Abrir https://ecrgroup.cl/blog/
2. Ir a «Descubre las tendencias ECR GROUP®».
3. Clic en **Prensa** → bloque izquierdo y carrusel deben mostrar solo posts de Prensa.
4. Clic en **Editorial** → ambos cambian.
5. Probar **Anterior / Siguiente** del carrusel con un filtro activo.

---

## IDs de referencia (jun 2026)

| Elemento | `data-id` |
|----------|-----------|
| Filtro visible | `49c7550` / `#filtro-principal` |
| Filtro oculto | `6f203ae` / `#filtro-oculto` |
| Bloque izquierdo | `7f45e18` |
| Carrusel central | `bc0cdd5` |
| Grid superior «Revisa nuestros artículos» | `8723a53` |
