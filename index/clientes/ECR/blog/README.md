# ECR — Filtro + carrusel «Descubre las tendencias»

> **Para continuar en otro equipo:** lee [`GUIA-CONTINUAR.md`](./GUIA-CONTINUAR.md)  
> **Copiar/pegar en Elementor:** [`filtro-widget.html`](./filtro-widget.html) y [`carrusel-widget.html`](./carrusel-widget.html)

**Sitio:** https://ecrgroup.cl/blog/  
**Rama Git:** `cursor/ecr-blog-filtro-carrusel-4d93`

---

## Resumen

El filtro de taxonomía de Elementor solo controlaba el bloque izquierdo (`7f45e18`). El carrusel central (`bc0cdd5`) se actualiza vía JavaScript + API `refresh-loop`.

Al filtrar, el script refresca **ambos** loops (izquierda + carrusel) con la categoría activa.

---

## Pegar en Elementor (2 widgets HTML)

| Ubicación | Archivo |
|-----------|---------|
| Debajo de `#filtro-principal` | [`filtro-widget.html`](./filtro-widget.html) |
| Debajo del Loop Grid `bc0cdd5` | [`carrusel-widget.html`](./carrusel-widget.html) |

Fuentes editables: [`filtro-sync.js`](./filtro-sync.js) y [`carrusel-widget-completo.js`](./carrusel-widget-completo.js)

---

## CSS

| Widget / contenedor | Archivo |
|---------------------|---------|
| Carrusel `bc0cdd5` | [`loop-carrusel-completo.css`](./loop-carrusel-completo.css) |
| Izquierdo `7f45e18` | [`loop-izquierdo-big-post-1094.css`](./loop-izquierdo-big-post-1094.css) |
| Fila 3 cols `227fd49` | [`blog-columnas-misma-altura.css`](./blog-columnas-misma-altura.css) |

---

## IDs de referencia

| Elemento | `data-id` | Plantilla |
|----------|-----------|-----------|
| Filtro visible | `49c7550` / `#filtro-principal` | — |
| Contenedor 3 columnas | `227fd49` | — |
| Bloque izquierdo | `7f45e18` | **1094** (Big post) |
| Carrusel centro | `bc0cdd5` | 1144 |
| Miniatura (badges) | `5e4f8fb` | — |
| Fecha carrusel | `bc5fe2f` | — |

---

## Verificación

1. Ctrl+F5 en `/blog/`
2. Filtrar por categoría → cambian izquierda y centro
3. Badges + fechas reales en carrusel
4. Paginar carrusel → badges y fechas se mantienen

Detalle completo, troubleshooting e historial: [`GUIA-CONTINUAR.md`](./GUIA-CONTINUAR.md)
