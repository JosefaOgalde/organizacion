# Joyas Mercury — Filtros catálogo (Esencial / Gold / Deluxe)

Handoff para continuidad entre agentes. **Última actualización: 11 jul 2026.**

**Pendientes priorizados:** `docs/JM-PENDIENTES-PRIORIDAD.md`

---

## Contexto

| Item | Valor |
|------|--------|
| **Cliente** | Joyas Mercury (Camila) — joyasmercury.cl |
| **Stack** | WordPress + WooCommerce + Astra + Elementor **Free** + UAE |
| **Tarea organizador** | D06 — `?tarea=joyas-mercury/06` |
| **Agente** | `@joyas-mercury` |
| **Restricción clave** | Sin Elementor Pro → **CSS solo en Astra** (Personalizar → CSS adicional). HTML vía widgets HTML en Elementor. **Sin JavaScript** (filtro 100 % CSS con `:has()` y anchors `#jm-f-*`). |

---

## Arquitectura del filtro

```
Contenedor (clase según colección)
├── Columna izquierda → Widget HTML (botones + anchors ocultos)
└── Columna derecha
    ├── Woo – Products (query = colección padre)
    └── Widget HTML (mensaje vacío)
```

| Capa | Responsabilidad |
|------|-----------------|
| **Woo – Products (Query)** | Qué colección carga: Esencial / Gold / Deluxe |
| **HTML + CSS** | Filtrar subcategorías (Pulseras, Aros, etc.) sin recargar |
| **WooCommerce (productos)** | Subcategoría o etiqueta en cada producto → genera clases en `<li class="product">` |

**Importante:** Si el widget Query pide Esencial en la página Gold, se verán productos Esencial aunque el CSS esté bien. Si los productos solo tienen categoría padre sin subcategoría, **Todas** funciona pero **Pulseras/Aros/etc.** muestran *«No hay productos en esta categoría»*.

---

## Clases CSS por página (Elementor → Contenedor)

| Página | URL | Clase en contenedor | Query Woo – Products |
|--------|-----|---------------------|----------------------|
| Esencial | `/esencial/` | `jm-catalogo-esencial` | Categoría **Esencial** |
| Gold | `/gold/` | `jm-catalogo-gold` | Categoría **Gold** |
| Deluxe | `/deluxe/` | `jm-catalogo-deluxe` | Categoría **Deluxe** |

**Widget Woo – Products (las 3):**
- Posts Per Page: **60**
- Pagination: **OFF**
- Título del widget: **vacío** (se quitó el texto pequeño «Gold»/«Deluxe»)

---

## Slugs categorías (D05)

| Padre | Slug padre | Hijas (slug) |
|-------|------------|--------------|
| Esencial | `esencial` | `esencial-aros`, `esencial-cadenas`, `esencial-anillos`, `esencial-pulseras`, `esencial-conjuntos` |
| Gold | `gold` | `gold-aros`, `gold-cadenas`, `gold-anillos`, `gold-pulseras`, `gold-conjuntos` |
| Deluxe | `deluxe` | `deluxe-aros`, `deluxe-cadenas`, `deluxe-anillos`, `deluxe-pulseras`, `deluxe-conjuntos` |

Base URL categorías: `/categoria-producto/`

El CSS también acepta slugs cortos (`product_cat-pulseras`) y etiquetas (`product_tag-pulseras`).

---

## Colores botón activo

| Colección | Fondo | Borde |
|-----------|-------|-------|
| Esencial | `#f0d4dc` | `#C88F9C` |
| Deluxe | `#e8c4d0` | `#b87a8f` |
| Gold | `#f5e6b8` | `#A97E23` |

---

## HTML — Columna izquierda (igual en las 3 páginas)

```html
<span id="jm-f-todas" class="jm-filtro-anchor" hidden></span>
<span id="jm-f-pulseras" class="jm-filtro-anchor" hidden></span>
<span id="jm-f-conjuntos" class="jm-filtro-anchor" hidden></span>
<span id="jm-f-cadenas" class="jm-filtro-anchor" hidden></span>
<span id="jm-f-anillos" class="jm-filtro-anchor" hidden></span>
<span id="jm-f-aros" class="jm-filtro-anchor" hidden></span>

<nav class="jm-filtro-panel" aria-label="Filtrar por categoría">
  <p class="jm-filtro-panel__titulo">CATEGORÍAS</p>
  <a class="jm-filtro" href="#jm-f-todas">Todas</a>
  <a class="jm-filtro" href="#jm-f-pulseras">Pulseras</a>
  <a class="jm-filtro" href="#jm-f-conjuntos">Conjuntos</a>
  <a class="jm-filtro" href="#jm-f-cadenas">Cadenas</a>
  <a class="jm-filtro" href="#jm-f-anillos">Anillos</a>
  <a class="jm-filtro" href="#jm-f-aros">Aros</a>
</nav>
```

## HTML — Columna derecha (debajo de Woo – Products)

```html
<p class="jm-vacio-mensaje">No hay productos en esta categoría.</p>
```

---

## CSS completo (Astra → CSS adicional)

Copiar el bloque completo de abajo. Reemplaza cualquier CSS anterior del filtro JM.

```css
/* =============================================
   Joyas Mercury — Filtros catálogo
   Esencial  → contenedor: jm-catalogo-esencial
   Deluxe    → contenedor: jm-catalogo-deluxe
   Gold      → contenedor: jm-catalogo-gold
   ============================================= */

/* ----- Ocultar "Sin categorizar" ----- */
.jm-catalogo-esencial li.product.product_cat-sin-categorizar,
.jm-catalogo-esencial li.product.product_cat-uncategorized,
.jm-catalogo-deluxe li.product.product_cat-sin-categorizar,
.jm-catalogo-deluxe li.product.product_cat-uncategorized,
.jm-catalogo-gold li.product.product_cat-sin-categorizar,
.jm-catalogo-gold li.product.product_cat-uncategorized {
  display: none !important;
}

/* ----- Forzar colección correcta por página ----- */
.jm-catalogo-gold li.product:not(.product_cat-gold) {
  display: none !important;
}

.jm-catalogo-deluxe li.product:not(.product_cat-deluxe) {
  display: none !important;
}

.jm-catalogo-esencial li.product.product_cat-gold,
.jm-catalogo-esencial li.product.product_cat-deluxe {
  display: none !important;
}

/* ===== Panel botones — base común ===== */
.jm-catalogo-esencial .jm-filtro-panel,
.jm-catalogo-deluxe .jm-filtro-panel,
.jm-catalogo-gold .jm-filtro-panel {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
}

.jm-catalogo-esencial .jm-filtro-panel__titulo,
.jm-catalogo-deluxe .jm-filtro-panel__titulo,
.jm-catalogo-gold .jm-filtro-panel__titulo {
  font-size: 11px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #999999;
  margin: 0 0 14px 0;
  font-weight: 600;
  font-family: inherit;
}

.jm-catalogo-esencial .jm-filtro-panel a.jm-filtro,
.jm-catalogo-deluxe .jm-filtro-panel a.jm-filtro,
.jm-catalogo-gold .jm-filtro-panel a.jm-filtro {
  display: block;
  width: 100%;
  box-sizing: border-box;
  padding: 14px 18px;
  margin: 0;
  border: 1px solid #dddddd;
  border-radius: 6px;
  background: #ffffff;
  color: #333333 !important;
  font-size: 13px;
  font-weight: 500;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  text-decoration: none !important;
  text-align: left;
  line-height: 1.3;
  cursor: pointer;
  box-shadow: none;
  transition: background 0.2s ease, border-color 0.2s ease;
}

.jm-catalogo-esencial .jm-filtro-panel a.jm-filtro:hover {
  background: #faf5f7;
  border-color: #C88F9C;
  color: #333333 !important;
}

.jm-catalogo-deluxe .jm-filtro-panel a.jm-filtro:hover {
  background: #faf0f3;
  border-color: #b87a8f;
  color: #333333 !important;
}

.jm-catalogo-gold .jm-filtro-panel a.jm-filtro:hover {
  background: #faf6ea;
  border-color: #A97E23;
  color: #333333 !important;
}

/* Botón activo — ESENCIAL */
.jm-catalogo-esencial:not(:has(.jm-filtro-anchor:target)) .jm-filtro-panel a.jm-filtro[href="#jm-f-todas"],
.jm-catalogo-esencial:has(#jm-f-todas:target) .jm-filtro-panel a.jm-filtro[href="#jm-f-todas"],
.jm-catalogo-esencial:has(#jm-f-pulseras:target) .jm-filtro-panel a.jm-filtro[href="#jm-f-pulseras"],
.jm-catalogo-esencial:has(#jm-f-conjuntos:target) .jm-filtro-panel a.jm-filtro[href="#jm-f-conjuntos"],
.jm-catalogo-esencial:has(#jm-f-cadenas:target) .jm-filtro-panel a.jm-filtro[href="#jm-f-cadenas"],
.jm-catalogo-esencial:has(#jm-f-anillos:target) .jm-filtro-panel a.jm-filtro[href="#jm-f-anillos"],
.jm-catalogo-esencial:has(#jm-f-aros:target) .jm-filtro-panel a.jm-filtro[href="#jm-f-aros"] {
  background: #f0d4dc !important;
  border-color: #C88F9C !important;
  color: #333333 !important;
  font-weight: 700;
}

/* Botón activo — DELUXE */
.jm-catalogo-deluxe:not(:has(.jm-filtro-anchor:target)) .jm-filtro-panel a.jm-filtro[href="#jm-f-todas"],
.jm-catalogo-deluxe:has(#jm-f-todas:target) .jm-filtro-panel a.jm-filtro[href="#jm-f-todas"],
.jm-catalogo-deluxe:has(#jm-f-pulseras:target) .jm-filtro-panel a.jm-filtro[href="#jm-f-pulseras"],
.jm-catalogo-deluxe:has(#jm-f-conjuntos:target) .jm-filtro-panel a.jm-filtro[href="#jm-f-conjuntos"],
.jm-catalogo-deluxe:has(#jm-f-cadenas:target) .jm-filtro-panel a.jm-filtro[href="#jm-f-cadenas"],
.jm-catalogo-deluxe:has(#jm-f-anillos:target) .jm-filtro-panel a.jm-filtro[href="#jm-f-anillos"],
.jm-catalogo-deluxe:has(#jm-f-aros:target) .jm-filtro-panel a.jm-filtro[href="#jm-f-aros"] {
  background: #e8c4d0 !important;
  border-color: #b87a8f !important;
  color: #333333 !important;
  font-weight: 700;
}

/* Botón activo — GOLD */
.jm-catalogo-gold:not(:has(.jm-filtro-anchor:target)) .jm-filtro-panel a.jm-filtro[href="#jm-f-todas"],
.jm-catalogo-gold:has(#jm-f-todas:target) .jm-filtro-panel a.jm-filtro[href="#jm-f-todas"],
.jm-catalogo-gold:has(#jm-f-pulseras:target) .jm-filtro-panel a.jm-filtro[href="#jm-f-pulseras"],
.jm-catalogo-gold:has(#jm-f-conjuntos:target) .jm-filtro-panel a.jm-filtro[href="#jm-f-conjuntos"],
.jm-catalogo-gold:has(#jm-f-cadenas:target) .jm-filtro-panel a.jm-filtro[href="#jm-f-cadenas"],
.jm-catalogo-gold:has(#jm-f-anillos:target) .jm-filtro-panel a.jm-filtro[href="#jm-f-anillos"],
.jm-catalogo-gold:has(#jm-f-aros:target) .jm-filtro-panel a.jm-filtro[href="#jm-f-aros"] {
  background: #f5e6b8 !important;
  border-color: #A97E23 !important;
  color: #333333 !important;
  font-weight: 700;
}

/* Filtrar — ESENCIAL */
.jm-catalogo-esencial:has(#jm-f-pulseras:target) li.product:not(.product_cat-esencial-pulseras):not(.product_cat-pulseras):not(.product_tag-pulseras),
.jm-catalogo-esencial:has(#jm-f-conjuntos:target) li.product:not(.product_cat-esencial-conjuntos):not(.product_cat-conjuntos):not(.product_tag-conjuntos),
.jm-catalogo-esencial:has(#jm-f-cadenas:target) li.product:not(.product_cat-esencial-cadenas):not(.product_cat-cadenas):not(.product_tag-cadenas),
.jm-catalogo-esencial:has(#jm-f-anillos:target) li.product:not(.product_cat-esencial-anillos):not(.product_cat-anillos):not(.product_tag-anillos),
.jm-catalogo-esencial:has(#jm-f-aros:target) li.product:not(.product_cat-esencial-aros):not(.product_cat-aros):not(.product_tag-aros) {
  display: none !important;
}

/* Filtrar — DELUXE */
.jm-catalogo-deluxe:has(#jm-f-pulseras:target) li.product:not(.product_cat-deluxe-pulseras):not(.product_cat-pulseras):not(.product_tag-pulseras),
.jm-catalogo-deluxe:has(#jm-f-conjuntos:target) li.product:not(.product_cat-deluxe-conjuntos):not(.product_cat-conjuntos):not(.product_tag-conjuntos),
.jm-catalogo-deluxe:has(#jm-f-cadenas:target) li.product:not(.product_cat-deluxe-cadenas):not(.product_cat-cadenas):not(.product_tag-cadenas),
.jm-catalogo-deluxe:has(#jm-f-anillos:target) li.product:not(.product_cat-deluxe-anillos):not(.product_cat-anillos):not(.product_tag-anillos),
.jm-catalogo-deluxe:has(#jm-f-aros:target) li.product:not(.product_cat-deluxe-aros):not(.product_cat-aros):not(.product_tag-aros) {
  display: none !important;
}

/* Filtrar — GOLD */
.jm-catalogo-gold:has(#jm-f-pulseras:target) li.product:not(.product_cat-gold-pulseras):not(.product_cat-pulseras):not(.product_tag-pulseras),
.jm-catalogo-gold:has(#jm-f-conjuntos:target) li.product:not(.product_cat-gold-conjuntos):not(.product_cat-conjuntos):not(.product_tag-conjuntos),
.jm-catalogo-gold:has(#jm-f-cadenas:target) li.product:not(.product_cat-gold-cadenas):not(.product_cat-cadenas):not(.product_tag-cadenas),
.jm-catalogo-gold:has(#jm-f-anillos:target) li.product:not(.product_cat-gold-anillos):not(.product_cat-anillos):not(.product_tag-anillos),
.jm-catalogo-gold:has(#jm-f-aros:target) li.product:not(.product_cat-gold-aros):not(.product_cat-aros):not(.product_tag-aros) {
  display: none !important;
}

/* Mensaje vacío — base */
.jm-catalogo-esencial .jm-vacio-mensaje,
.jm-catalogo-deluxe .jm-vacio-mensaje,
.jm-catalogo-gold .jm-vacio-mensaje {
  display: none;
  width: 100%;
  padding: 120px 24px;
  text-align: center;
  color: #888888;
  font-size: 16px;
  letter-spacing: 0.03em;
  margin: 0;
  box-sizing: border-box;
}

/* Mensaje vacío — ESENCIAL */
.jm-catalogo-esencial:has(#jm-f-pulseras:target):not(:has(li.product.product_cat-esencial-pulseras, li.product.product_cat-pulseras, li.product.product_tag-pulseras)) .jm-vacio-mensaje,
.jm-catalogo-esencial:has(#jm-f-conjuntos:target):not(:has(li.product.product_cat-esencial-conjuntos, li.product.product_cat-conjuntos, li.product.product_tag-conjuntos)) .jm-vacio-mensaje,
.jm-catalogo-esencial:has(#jm-f-cadenas:target):not(:has(li.product.product_cat-esencial-cadenas, li.product.product_cat-cadenas, li.product.product_tag-cadenas)) .jm-vacio-mensaje,
.jm-catalogo-esencial:has(#jm-f-anillos:target):not(:has(li.product.product_cat-esencial-anillos, li.product.product_cat-anillos, li.product.product_tag-anillos)) .jm-vacio-mensaje,
.jm-catalogo-esencial:has(#jm-f-aros:target):not(:has(li.product.product_cat-esencial-aros, li.product.product_cat-aros, li.product.product_tag-aros)) .jm-vacio-mensaje {
  display: block;
}

.jm-catalogo-esencial:has(#jm-f-pulseras:target):not(:has(li.product.product_cat-esencial-pulseras, li.product.product_cat-pulseras, li.product.product_tag-pulseras)) ul.products,
.jm-catalogo-esencial:has(#jm-f-conjuntos:target):not(:has(li.product.product_cat-esencial-conjuntos, li.product.product_cat-conjuntos, li.product.product_tag-conjuntos)) ul.products,
.jm-catalogo-esencial:has(#jm-f-cadenas:target):not(:has(li.product.product_cat-esencial-cadenas, li.product.product_cat-cadenas, li.product.product_tag-cadenas)) ul.products,
.jm-catalogo-esencial:has(#jm-f-anillos:target):not(:has(li.product.product_cat-esencial-anillos, li.product.product_cat-anillos, li.product.product_tag-anillos)) ul.products,
.jm-catalogo-esencial:has(#jm-f-aros:target):not(:has(li.product.product_cat-esencial-aros, li.product.product_cat-aros, li.product.product_tag-aros)) ul.products {
  display: none !important;
}

/* Mensaje vacío — DELUXE */
.jm-catalogo-deluxe:has(#jm-f-pulseras:target):not(:has(li.product.product_cat-deluxe-pulseras, li.product.product_cat-pulseras, li.product.product_tag-pulseras)) .jm-vacio-mensaje,
.jm-catalogo-deluxe:has(#jm-f-conjuntos:target):not(:has(li.product.product_cat-deluxe-conjuntos, li.product.product_cat-conjuntos, li.product.product_tag-conjuntos)) .jm-vacio-mensaje,
.jm-catalogo-deluxe:has(#jm-f-cadenas:target):not(:has(li.product.product_cat-deluxe-cadenas, li.product.product_cat-cadenas, li.product.product_tag-cadenas)) .jm-vacio-mensaje,
.jm-catalogo-deluxe:has(#jm-f-anillos:target):not(:has(li.product.product_cat-deluxe-anillos, li.product.product_cat-anillos, li.product.product_tag-anillos)) .jm-vacio-mensaje,
.jm-catalogo-deluxe:has(#jm-f-aros:target):not(:has(li.product.product_cat-deluxe-aros, li.product.product_cat-aros, li.product.product_tag-aros)) .jm-vacio-mensaje {
  display: block;
}

.jm-catalogo-deluxe:has(#jm-f-pulseras:target):not(:has(li.product.product_cat-deluxe-pulseras, li.product.product_cat-pulseras, li.product.product_tag-pulseras)) ul.products,
.jm-catalogo-deluxe:has(#jm-f-conjuntos:target):not(:has(li.product.product_cat-deluxe-conjuntos, li.product.product_cat-conjuntos, li.product.product_tag-conjuntos)) ul.products,
.jm-catalogo-deluxe:has(#jm-f-cadenas:target):not(:has(li.product.product_cat-deluxe-cadenas, li.product.product_cat-cadenas, li.product.product_tag-cadenas)) ul.products,
.jm-catalogo-deluxe:has(#jm-f-anillos:target):not(:has(li.product.product_cat-deluxe-anillos, li.product.product_cat-anillos, li.product.product_tag-anillos)) ul.products,
.jm-catalogo-deluxe:has(#jm-f-aros:target):not(:has(li.product.product_cat-deluxe-aros, li.product.product_cat-aros, li.product.product_tag-aros)) ul.products {
  display: none !important;
}

/* Mensaje vacío — GOLD */
.jm-catalogo-gold:has(#jm-f-pulseras:target):not(:has(li.product.product_cat-gold-pulseras, li.product.product_cat-pulseras, li.product.product_tag-pulseras)) .jm-vacio-mensaje,
.jm-catalogo-gold:has(#jm-f-conjuntos:target):not(:has(li.product.product_cat-gold-conjuntos, li.product.product_cat-conjuntos, li.product.product_tag-conjuntos)) .jm-vacio-mensaje,
.jm-catalogo-gold:has(#jm-f-cadenas:target):not(:has(li.product.product_cat-gold-cadenas, li.product.product_cat-cadenas, li.product.product_tag-cadenas)) .jm-vacio-mensaje,
.jm-catalogo-gold:has(#jm-f-anillos:target):not(:has(li.product.product_cat-gold-anillos, li.product.product_cat-anillos, li.product.product_tag-anillos)) .jm-vacio-mensaje,
.jm-catalogo-gold:has(#jm-f-aros:target):not(:has(li.product.product_cat-gold-aros, li.product.product_cat-aros, li.product.product_tag-aros)) .jm-vacio-mensaje {
  display: block;
}

.jm-catalogo-gold:has(#jm-f-pulseras:target):not(:has(li.product.product_cat-gold-pulseras, li.product.product_cat-pulseras, li.product.product_tag-pulseras)) ul.products,
.jm-catalogo-gold:has(#jm-f-conjuntos:target):not(:has(li.product.product_cat-gold-conjuntos, li.product.product_cat-conjuntos, li.product.product_tag-conjuntos)) ul.products,
.jm-catalogo-gold:has(#jm-f-cadenas:target):not(:has(li.product.product_cat-gold-cadenas, li.product.product_cat-cadenas, li.product.product_tag-cadenas)) ul.products,
.jm-catalogo-gold:has(#jm-f-anillos:target):not(:has(li.product.product_cat-gold-anillos, li.product.product_cat-anillos, li.product.product_tag-anillos)) ul.products,
.jm-catalogo-gold:has(#jm-f-aros:target):not(:has(li.product.product_cat-gold-aros, li.product.product_cat-aros, li.product.product_tag-aros)) ul.products {
  display: none !important;
}

/* Etiqueta colección en tarjeta — Gold y Deluxe */
.jm-catalogo-gold .uael-woo-products-category,
.jm-catalogo-gold .woocommerce-loop-category__title,
.jm-catalogo-deluxe .uael-woo-products-category,
.jm-catalogo-deluxe .woocommerce-loop-category__title {
  font-size: 0 !important;
  line-height: 0;
}

.jm-catalogo-gold .uael-woo-products-category::after,
.jm-catalogo-gold .woocommerce-loop-category__title::after {
  content: "Gold";
  font-size: 12px;
  line-height: 1.4;
  color: #999999;
  display: block;
  text-transform: capitalize;
}

.jm-catalogo-deluxe .uael-woo-products-category::after,
.jm-catalogo-deluxe .woocommerce-loop-category__title::after {
  content: "Deluxe";
  font-size: 12px;
  line-height: 1.4;
  color: #999999;
  display: block;
  text-transform: capitalize;
}

/* Móvil */
@media (max-width: 767px) {
  .jm-catalogo-esencial .jm-filtro-panel,
  .jm-catalogo-deluxe .jm-filtro-panel,
  .jm-catalogo-gold .jm-filtro-panel {
    display: none;
  }

  .jm-catalogo-esencial .jm-vacio-mensaje,
  .jm-catalogo-deluxe .jm-vacio-mensaje,
  .jm-catalogo-gold .jm-vacio-mensaje {
    padding: 60px 16px;
  }
}
```

---

## Productos en WooCommerce (pendiente Camila)

Cada producto debe tener:

1. **Colección padre** (Esencial / Gold / Deluxe)
2. **Subcategoría** (Pulseras, Aros, Anillos, Cadenas, Conjuntos)

**O** etiquetas: `pulseras`, `aros`, `anillos`, `cadenas`, `conjuntos`

### Edición en lote

Productos → filtrar por colección → seleccionar → Acciones en lote → Editar → marcar subcategoría o etiqueta.

### Verificación

Inspeccionar `<li class="product ...">` en el navegador. Debe incluir p. ej. `product_cat-esencial-pulseras` o `product_tag-pulseras`.

---

## Estado al 6 jul 2026

### Hecho

- [x] Panel CATEGORÍAS con botones (HTML, sin radios)
- [x] Filtro CSS sin JS (`:has()` + `#jm-f-*`)
- [x] Mensaje vacío en columna derecha
- [x] CSS unificado 3 colecciones en Astra
- [x] Clases contenedor: `jm-catalogo-esencial`, `jm-catalogo-gold`, `jm-catalogo-deluxe`
- [x] Query Woo configurada por colección
- [x] Títulos pequeños Gold/Deluxe eliminados del widget
- [x] Ocultar Sin categorizar + forzar colección por página
- [x] Etiqueta Gold/Deluxe en tarjetas (CSS)
- [x] Filtro **Todas** en las 3 landings

### Pendiente (orden de prioridad)

Ver `docs/JM-PENDIENTES-PRIORIDAD.md`. Resumen:

1. **Subcategorías/etiquetas en productos** (bloqueante filtros Pulseras/Aros/…)
2. **D06 Paso 5** — cabecera `.jm-grid-head` + orden destacados
3. **Móvil** — círculos hero → `#jm-f-*`
4. D07 refinamiento landings · D12 Ayuda · D10 Destacados home

---

## Troubleshooting

| Síntoma | Causa | Solución |
|---------|-------|----------|
| Gold/Deluxe muestran Esencial | Query widget = Esencial | Query → categoría correcta |
| Todas OK, subcategoría vacía | Productos sin subcategoría/etiqueta | WooCommerce: asignar Pulseras, Aros, etc. |
| Mensaje sobre botones | HTML mensaje en columna izquierda | Mover a columna derecha debajo del grid |
| Botones como texto dorado | No es widget HTML con `jm-filtro` | Reemplazar por HTML del handoff |
| Etiqueta «Esencial» en Gold | Producto mal categorizado | Asignar Gold + CSS `::after` ya aplicado |

---

## Mockups referencia

`index/clientes/joyasmercury/interfaces/referencia-landings/`
- `02-esencial-referencia.png`
- `03-gold-referencia.png`
- `04-deluxe-referencia.png`

---

## Para el próximo agente

1. Leer este archivo: `docs/JM-FILTROS-CATALOGO-HANDOFF.md`
2. Invocar `@joyas-mercury`
3. Prioridad: **subcategorías/etiquetas en productos** antes de tocar más CSS
4. Usuario (`josef`): paso a paso, esperar OK entre pasos, español

---

## Respaldo organizador (datos tareas / clientes)

| Item | Valor |
|------|--------|
| **Respaldo actual (6 jul 2026)** | `C:\Users\josef\Downloads\organizacion-respaldo-2026-07-06.json` |
| **Regla** | Siempre usar el respaldo **más actualizado** (no uno fijo por fecha en el nombre) |
| **Detección automática** | `node scripts/respaldo-reciente.js` — busca en `data/` y `Downloads`, ordena por `respaldoActualizado`, fecha en nombre y `mtime` |
| **Sync a live** | `ABRIR-ORGANIZADOR.bat` o `node scripts/sync-respaldo-auto.js` |
| **Import manual** | `IMPORTAR-RESPALDO.bat` |

Si el usuario guarda un respaldo nuevo (`organizacion-respaldo-AAAA-MM-DD.json`), **ese** reemplaza al anterior aunque el handoff cite una fecha vieja.

Ver también: `docs/PERSISTENCIA.md`
