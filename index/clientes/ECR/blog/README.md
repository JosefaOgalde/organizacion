# ECR — Filtro + carrusel «Descubre las tendencias»

## Causa real (confirmada en producción)

En https://ecrgroup.cl/blog/ **ambos** filtros apuntaban al mismo loop:

| Widget | Loop conectado |
|--------|----------------|
| `#filtro-principal` | `7f45e18` (bloque izquierdo) |
| `#filtro-oculto` | `7f45e18` (¡el mismo!) |

El carrusel central es `bc0cdd5` y **ningún filtro** lo controlaba. Por eso solo cambiaba la izquierda.

## Solución

El script [`filtro-sync.js`](./filtro-sync.js) llama directamente a la API de Elementor:

`POST /wp-json/elementor-pro/v1/refresh-loop` con `widget_id: bc0cdd5`

Ya **no depende** de `#filtro-oculto`. Puedes dejar ese widget oculto o eliminarlo.

---

## Dónde pegar cada archivo

### 1. Filtro visible (debajo de `#filtro-principal`)

Widget HTML → pegar [`filtro-sync.js`](./filtro-sync.js) **completo**.

### 2. Loop Grid 3 — carrusel central (`bc0cdd5`)

**CSS personalizado** (Avanzado → CSS personalizado del Loop Grid):

→ [`loop-carrusel-completo.css`](./loop-carrusel-completo.css) **completo** (reemplaza el CSS anterior).

Imágenes: **168×96 px** en desktop, filas de **altura uniforme** (~108 px).

### 3. Widget HTML debajo del Loop Grid 3

**Reemplazar** el script actual (solo paginación) por:

→ [`carrusel-widget-completo.js`](./carrusel-widget-completo.js) **completo**

Incluye:

- `ECR_CARRUSEL_PAGINACION` — botones Anterior / Siguiente
- `ECR_BLOG_DECORATE` — **etiquetas Artículos / Prensa / Editorial** sobre la imagen + **fechas reales**

> En producción hoy solo está publicado `ECR_CARRUSEL_PAGINACION`. Por eso **no se ven las etiquetas** en el centro. Hay que pegar el widget completo.

### 4. Bloque izquierdo (`7f45e18`)

CSS estilo tarjeta grande + altura igual al carrusel → [`loop-izquierdo-equal-height.css`](./loop-izquierdo-equal-height.css)

> Si tienes `min-height: 550px` en el CSS del bloque izquierdo, **elimínalo** y usa este archivo.

### 5. Fila 3 columnas — misma altura (`227fd49`)

Contenedor que envuelve izquierda + carrusel + derecha → [`blog-columnas-misma-altura.css`](./blog-columnas-misma-altura.css)

Pegar en: **Contenedor fila** (227fd49) → Avanzado → CSS personalizado.

---

## Verificación rápida

1. Recargar https://ecrgroup.cl/blog/
2. En el carrusel central, cada imagen debe mostrar una pastilla (ej. **Articulos**, **Prensa**) arriba a la izquierda
3. Las fechas deben cambiar por artículo (no todas «1 Jul 2026»)
4. Las 3 columnas (izquierda, centro, derecha) deben tener **la misma altura**
5. Al filtrar por categoría, el carrusel actualiza y mantiene etiquetas + fechas

---

## IDs de referencia

| Elemento | `data-id` | Plantilla |
|----------|-----------|-----------|
| Filtro visible | `49c7550` / `#filtro-principal` | — |
| Contenedor 3 columnas | `227fd49` | — |
| Bloque izquierdo | `7f45e18` | 1135 |
| Carrusel centro | `bc0cdd5` | 1144 |
| Columna derecha | `aa293d3` | — |
| Contenedor imagen (badges) | `5e4f8fb` | — |
| Fecha | `bc5fe2f` | — |
