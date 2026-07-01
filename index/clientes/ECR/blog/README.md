# ECR — Filtro + carrusel «Descubre las tendencias»

Sitio: https://ecrgroup.cl/blog/

---

## Cómo está armado en Elementor

```
[Filtro visible #filtro-principal]  →  Loop bloque izquierdo (tarjeta grande)
[Widget HTML — filtro-sync.js]
[Filtro oculto #filtro-oculto]      →  Loop Grid 3 (carrusel central, 3 posts)
    ├── [Loop Grid 3]
    └── [Widget HTML — carrusel-paginacion.js]
```

| Widget | CSS ID (Avanzado) | Rejilla de bucle |
|--------|-------------------|------------------|
| Filtro visible (botones azules) | `filtro-principal` | **Bloque izquierdo** (1 tarjeta grande) |
| Filtro oculto (gris, oculto con CSS) | `filtro-oculto` | **Loop Grid 3** (carrusel Anterior/Siguiente) |

El script del HTML visible dispara un click en el filtro oculto con la misma categoría. Si `#filtro-oculto` no apunta a Loop Grid 3, el carrusel no se mueve.

---

## Paso 1 — Revisar conexiones en Elementor

### Filtro visible (`#filtro-principal`)
1. Clic en los botones de categoría (Articulos, Editorial…).
2. **Contenido → Rejilla de bucle seleccionada** = loop del **bloque izquierdo** (NO Loop Grid 3).

### Filtro oculto (`#filtro-oculto`)
1. Clic en la fila de botones grises (debajo del widget HTML).
2. **Contenido → Rejilla de bucle seleccionada** = **Loop Grid 3** (el del carrusel).
3. **Avanzado → ID CSS** = `filtro-oculto`.

---

## Paso 2 — Reemplazar script del filtro (widget HTML imagen 1)

Sustituir todo el `<script>` actual por [`filtro-sync.js`](./filtro-sync.js).

**Cambio clave:** ya no usa `btns2[i]` (índice). Usa `data-filter`:

```javascript
// Antes (se rompe si ocultas "Sin categoría" en el visible)
if (btns2[i]) btns2[i].click();

// Ahora
var target = document.querySelector(
  '#filtro-oculto .e-filter-item[data-filter="' + filter + '"]'
);
if (target) target.click();
```

---

## Paso 3 — Reemplazar script del carrusel (widget HTML imagen 5)

Sustituir el script que usa `.elementor-widget-loop-grid').eq(1)` por [`carrusel-paginacion.js`](./carrusel-paginacion.js).

**Por qué:** `.eq(1)` asume que el carrusel es siempre el segundo loop de la página. Tras tus cambios, ese índice puede apuntar a otro bloque.

El script nuevo busca el **Loop Grid hermano anterior** al widget HTML donde está pegado.

---

## Paso 4 — CSS del carrusel

Tu CSS en el Loop Grid 3 está bien. No hace falta cambiarlo. La clase `bucle-bloqueado-abajo` la aplica el script de paginación durante el AJAX.

---

## Verificación

1. Publicar la página.
2. Clic **Prensa** → cambian bloque izquierdo **y** los 3 artículos del centro.
3. **Anterior / Siguiente** siguen funcionando con el filtro activo.

Si el izquierdo cambia pero el centro no → `#filtro-oculto` no está conectado a Loop Grid 3.

---

## IDs de referencia (producción jun 2026)

| Elemento | `data-id` |
|----------|-----------|
| Filtro visible | `49c7550` |
| Filtro oculto | `6f203ae` |
| Bloque izquierdo | `7f45e18` |
| Loop Grid 3 / carrusel | `bc0cdd5` |
