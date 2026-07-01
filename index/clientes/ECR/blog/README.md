# ECR — Filtro + carrusel «Descubre las tendencias»

## Causa real (confirmada en producción)

En https://ecrgroup.cl/blog/ **ambos** filtros apuntaban al mismo loop:

| Widget | Loop conectado |
|--------|----------------|
| `#filtro-principal` | `7f45e18` (bloque izquierdo) |
| `#filtro-oculto` | `7f45e18` (¡el mismo!) |

El carrusel central es `bc0cdd5` y **ningún filtro** lo controlaba. Por eso solo cambiaba la izquierda.

## Solución

El script [`filtro-sync.js`](./filtro-sync.js) ahora llama directamente a la API de Elementor:

`POST /wp-json/elementor-pro/v1/refresh-loop` con `widget_id: bc0cdd5`

Ya **no depende** de `#filtro-oculto`. Puedes dejar ese widget oculto o eliminarlo.

## Dónde pegar

1. Widget HTML bajo filtro visible → [`filtro-sync.js`](./filtro-sync.js) completo
2. Widget HTML bajo Loop Grid 3 → [`carrusel-paginacion.js`](./carrusel-paginacion.js) completo
