# ECR Blog — Guía para continuar en otro equipo

**Sitio:** https://ecrgroup.cl/blog/  
**Sección:** «Descubre las tendencias ECR GROUP®»  
**Última sesión:** junio 2026

---

## Repositorio Git

```bash
git clone https://github.com/JosefaOgalde/organizacion.git
cd organizacion
git checkout cursor/ecr-blog-filtro-carrusel-4d93
```

**Rama de trabajo:** `cursor/ecr-blog-filtro-carrusel-4d93`  
**Carpeta del proyecto:** `index/clientes/ECR/blog/`

---

## Estado actual (lo que ya funciona)

| Funcionalidad | Estado |
|---------------|--------|
| Íconos en botones del filtro | ✅ |
| Ocultar «Sin categoría» | ✅ |
| Badges sobre miniaturas del carrusel | ✅ |
| Fechas reales de publicación (no placeholder) | ✅ |
| Filtro cambia bloque izquierdo | ✅ (vía API) |
| Filtro cambia carrusel central | ✅ (vía API) |
| Paginación Anterior/Siguiente con filtro activo | ✅ |
| Badges se mantienen al paginar | ✅ (última versión) |

---

## Arquitectura

Elementor Pro no conectaba el filtro al carrusel central. Solo el bloque izquierdo estaba vinculado nativamente.

**Solución:** dos widgets HTML con JavaScript que llaman a la API de Elementor:

```
POST /wp-json/elementor-pro/v1/refresh-loop
```

| Widget HTML | Ubicación en Elementor | Archivo fuente |
|-------------|------------------------|----------------|
| **Filtro** | Debajo del filtro azul `#filtro-principal` | `filtro-sync.js` → `filtro-widget.html` |
| **Carrusel** | Debajo del Loop Grid central `bc0cdd5` | `carrusel-widget-completo.js` → `carrusel-widget.html` |

**Orden de carga en la página:** primero el widget del **filtro**, luego el del **carrusel** (el carrusel usa `window.ECR` definido por el filtro).

---

## IDs de Elementor (referencia)

| Elemento | ID / selector | Plantilla |
|----------|---------------|-----------|
| Filtro visible | `49c7550` / `#filtro-principal` / clase `filtro-principal` | — |
| Contenedor 3 columnas | `227fd49` | — |
| **Bloque izquierdo** | `7f45e18` | Big post **1094** |
| **Carrusel centro** | `bc0cdd5` | **1144** |
| Columna derecha | `aa293d3` | — |
| Miniatura carrusel (badges) | `5e4f8fb` | — |
| Fecha carrusel | `bc5fe2f` | — |
| Página del blog (post_id fallback) | `1072` | — |

---

## Dónde pegar cada cosa en Elementor

### 1. Widget HTML — debajo del filtro azul

- Abrir página Blog en Elementor
- Localizar widget HTML **debajo** de `#filtro-principal`
- **Borrar todo** y pegar contenido de: **`filtro-widget.html`**

### 2. Widget HTML — debajo del carrusel central

- Localizar widget HTML **debajo** del Loop Grid `bc0cdd5`
- **Borrar todo** y pegar contenido de: **`carrusel-widget.html`**

### 3. CSS — Loop Grid carrusel (`bc0cdd5`)

- Avanzado → CSS personalizado
- Pegar: **`loop-carrusel-completo.css`**

### 4. CSS — Loop Grid izquierdo (`7f45e18`)

- Avanzado → CSS personalizado
- Pegar: **`loop-izquierdo-big-post-1094.css`** (o `loop-izquierdo-equal-height.css`)

### 5. CSS — Contenedor fila 3 columnas (`227fd49`)

- Avanzado → CSS personalizado
- Pegar: **`blog-columnas-misma-altura.css`**

### 6. Configuración del filtro (Taxonomy Filter)

- Clase CSS: `filtro-principal`
- Taxonomía: **Categories**
- Loop conectado en Elementor: puede quedar en `7f45e18` (el JS refresca ambos por API)

---

## Archivos del repo (mapa)

```
index/clientes/ECR/blog/
├── GUIA-CONTINUAR.md          ← este archivo
├── README.md                  ← resumen técnico
├── filtro-sync.js             ← fuente script filtro
├── filtro-widget.html         ← copiar/pegar en Elementor (filtro)
├── carrusel-widget-completo.js← fuente script carrusel
├── carrusel-widget.html       ← copiar/pegar en Elementor (carrusel)
├── loop-carrusel-completo.css
├── loop-izquierdo-big-post-1094.css
├── loop-izquierdo-equal-height.css
├── blog-columnas-misma-altura.css
└── (archivos legacy / referencia)
```

---

## Cómo funciona el JavaScript

### `filtro-sync.js` (widget filtro)

1. Inyecta íconos SVG vía `ecr_get_term_icons` (solo una vez, no rompe handlers)
2. Oculta botón «Sin categoría»
3. Al clic en filtro → espera 150 ms → lee `getActiveSlug()` → refresca **izquierda** y **carrusel** por API
4. Expone `window.ECR.refreshCarruselLoop(slug, page)` para la paginación

### `carrusel-widget-completo.js` (widget carrusel)

1. **ECR_BLOG_DECORATE:** badges + fechas reales vía REST `/wp/v2/posts`
2. **ECR_CARRUSEL_PAGINACION:** intercepta Anterior/Siguiente y llama `ECR.refreshCarruselLoop` con filtro activo
3. Re-aplica badges tras cada cambio de DOM (paginación / filtro)

---

## Verificación rápida

1. Publicar en Elementor → recargar con **Ctrl+F5**
2. Clic en **Artículos** → cambian izquierda y centro
3. Clic en **Eventos** → ambos muestran posts de Eventos
4. En carrusel: badges visibles, fechas distintas por post
5. Clic **Siguiente** → badges y fechas se mantienen
6. Tres columnas con altura similar (CSS `227fd49`)

---

## Problemas conocidos y soluciones

| Síntoma | Causa | Solución |
|---------|-------|----------|
| Carrusel no filtra | Falta widget HTML del filtro o orden incorrecto | Pegar `filtro-widget.html` **antes** que `carrusel-widget.html` |
| Badges desaparecen al paginar | Versión antigua del script carrusel | Pegar `carrusel-widget.html` actualizado |
| Fechas «1 Jul 2026» | Placeholder en plantilla 1144 + JS no corre | Pegar `carrusel-widget.html` |
| Izquierda no cambia al filtrar | Lógica invertida de `aria-pressed` (corregida) | Pegar `filtro-widget.html` última versión |
| Error 400 `widget_id` | Bug Elementor Pro (IDs de 8 chars) | `bc0cdd5` tiene 7 → OK; si falla, recrear Loop Grid |
| Sitio colgado | Script antiguo con MutationObserver en bucle | Usar solo `carrusel-widget-completo.js` actual |

---

## Historial de commits (rama)

```
100c3b7 fix: restaurar filtro bloque izquierdo 7f45e18
d599b5e fix: paginación carrusel respeta filtro y mantiene badges
6426757 fix: sincronizar carrusel independiente de íconos
65692be Eliminar código muerto en script carrusel
b2e8931 Carrusel: batch API fechas, badges desde clases HTML
```

---

## Pendiente / mejoras opcionales

- [ ] Confirmar en producción que Eventos + paginación funcionan tras pegar última versión del filtro
- [ ] Quitar `min-height: 550px` del CSS izquierdo si aún existe
- [ ] Eliminar `#filtro-oculto` si sigue en la página (ya no se usa)
- [ ] En plantilla 1144: opcional cambiar shortcode fecha por etiqueta dinámica (el JS ya lo sobreescribe)

---

## Contacto técnico

- **API íconos:** `/wp-admin/admin-ajax.php?action=ecr_get_term_icons&taxonomy=category`
- **API posts:** `/wp-json/wp/v2/posts?include=...&_fields=id,date`
- **API Elementor:** `/wp-json/elementor-pro/v1/refresh-loop`
