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
| **WooCommerce (productos)** | Subcategoría en cada producto → UAE pone el **slug corto** en `<li class="product">` |

**Importante:** El widget **UAE Woo – Products** no usa `product_cat-esencial-aros`. Pone clases directas en el `<li>`:

```html
<li class="esencial aros product …">
<li class="esencial pulseras product …">
```

El CSS debe filtrar por `.pulseras`, `.aros`, `.cadenas`, etc. — **no** por `product_cat-*` ni `jm-data-cat-*`.

---

## Clases CSS por página (Elementor → Contenedor)

| Página | URL | Clase en contenedor | Query Woo – Products |
|--------|-----|---------------------|----------------------|
| Esencial | `/esencial/` | `jm-catalogo-esencial` | Categoría **Esencial** |
| Gold | `/gold/` | `jm-catalogo-gold` | Categoría **Gold** |
| Deluxe | `/deluxe/` | `jm-catalogo-deluxe` | Categoría **Deluxe** |

**Widget Woo – Products (las 3):**
- Posts Per Page: **60** ← **obligatorio** para filtro CSS (si hay 8 + Random, Pulseras/Cadenas salen vacías aunque existan en WC)
- Pagination: **OFF**
- Order By: **Menu Order** o **Date** — **no Random**
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
<p class="jm-vacio-mensaje" aria-hidden="true"></p>
```

El texto **«Próximamente»** lo pone el CSS (`::after`). El `<p>` puede ir vacío.

---

## CSS completo (Astra → CSS adicional)

Copiar el bloque completo de `index/clientes/joyasmercury/guias/CSS-CATALOGO-3-COLECCIONES.css`.

**Versión 11 jul 2026:** selectores alineados a clases UAE (`pulseras`, `aros`, `esencial`, `gold`, `deluxe`).

Bloque crítico de filtrado (reemplaza cualquier versión con `product_cat-*` o `jm-data-cat-*`):

```css
/* Filtrar — ESENCIAL */
.jm-catalogo-esencial:has(#jm-f-pulseras:target) li.product:not(.pulseras),
.jm-catalogo-esencial:has(#jm-f-conjuntos:target) li.product:not(.conjuntos),
.jm-catalogo-esencial:has(#jm-f-cadenas:target) li.product:not(.cadenas),
.jm-catalogo-esencial:has(#jm-f-anillos:target) li.product:not(.anillos),
.jm-catalogo-esencial:has(#jm-f-aros:target) li.product:not(.aros) {
  display: none !important;
}
```

(Análogo para Deluxe y Gold; ver archivo CSS completo.)

---

## Productos en WooCommerce (pendiente Camila)

Cada producto debe tener:

1. **Colección padre** (Esencial / Gold / Deluxe)
2. **Subcategoría** (Pulseras, Aros, Anillos, Cadenas, Conjuntos)

**O** etiquetas: `pulseras`, `aros`, `anillos`, `cadenas`, `conjuntos`

### Edición en lote

Productos → filtrar por colección → seleccionar → Acciones en lote → Editar → marcar subcategoría o etiqueta.

### Verificación

Inspeccionar `<li class="product …">` en el navegador. UAE debe incluir el **slug corto** de subcategoría, p. ej. `pulseras`, `aros` (junto a `esencial`, `gold` o `deluxe`).

El snippet PHP **JM Marcadores categoría filtro** no es necesario con UAE — puede desactivarse.

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
| Clic filtro → página en blanco | CSS busca `product_cat-*` o `jm-data-cat-*` pero UAE usa `.pulseras`, `.aros`, etc. | Actualizar CSS a clases UAE (ver `CSS-CATALOGO-3-COLECCIONES.css`) |
| Aros/Anillos OK, Pulseras/Cadenas vacías | Widget carga **8 productos Random** — la subcategoría no está en el DOM | Posts Per Page **60**, Order ≠ Random |
| Productos + mensaje vacío a la vez | Falta `.jm-vacio-mensaje { display: none }` en CSS adicional | Pegar **CSS completo** del repo, no solo bloques de filtrado |
| Panel sin botones (links dorados) | Se borró CSS del panel al pegar parcial | Restaurar bloque `.jm-filtro-panel` del archivo completo |
| Clase duplicada | `jm-catalogo-esencial` en contenedor **y** widget HTML | Quitar clase del widget HTML; dejar solo en contenedor padre |
| Gold/Deluxe muestran Esencial | Query widget = Esencial | Query → categoría correcta |
| Todas OK, subcategoría vacía | Productos sin subcategoría | WooCommerce: asignar Pulseras, Aros, etc. |
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
