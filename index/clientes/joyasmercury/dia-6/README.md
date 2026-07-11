# Día 6 — Filtros catálogo (Esencial / Gold / Deluxe)

**Tarea:** `[JM] Diseñar chips/filtros + catálogo en landing Esencial`  
**Organizador:** `index.html?tarea=joyas-mercury/06`  
**Agente:** `@joyas-mercury`

---

## Estado al 11 jul 2026

| Paso | Estado |
|------|--------|
| 1. Layout 2 columnas | ✓ |
| 2. Panel CATEGORÍAS (HTML) | ✓ |
| 3. Woo – Products + query colección | ✓ |
| 4. Filtro sin recargar (CSS `:has`) | ✓ — CSS corregido para clases UAE (11 jul) |
| 5. Cabecera + orden | Pendiente |
| 5b. Tarjetas producto alineadas | CSS `.uael-woo-product-wrapper` — ver guía CSS |
| 6. Móvil (círculos → anchors) | En progreso |

**Handoff técnico:** `docs/JM-FILTROS-CATALOGO-HANDOFF.md`  
**CSS copiar/pegar:** `guias/CSS-CATALOGO-3-COLECCIONES.css`

---

## Paso 4 bis — Desbloquear filtros (RESUELTO 11 jul)

**Causa:** UAE Woo – Products pone slugs cortos en el `<li>` (`esencial aros`, no `product_cat-esencial-aros`). El CSS con `jm-data-cat-*` ocultaba **todos** los productos al filtrar.

**Solución:** Reemplazar en Astra → CSS adicional el bloque de filtrado por el de `guias/CSS-CATALOGO-3-COLECCIONES.css` (versión 11 jul).

**Prueba rápida:**
1. `/esencial/#jm-f-aros` → solo productos con clase `aros`
2. `/esencial/#jm-f-conjuntos` → mensaje vacío (0 productos en WC)
3. Snippet PHP marcadores → **desactivar** (opcional, no hace falta con UAE)

## Paso 4 ter — Ajustes tras prueba (11 jul)

Si **Aros/Anillos** filtran pero **Pulseras/Cadenas** no, o el mensaje vacío aparece junto a productos:

### A) Widget Woo – Products (Elementor)
| Campo | Valor |
|-------|-------|
| **Posts Per Page** | `60` |
| **Order By** | `Menu Order` (no Random) |
| **Pagination** | OFF |

### B) CSS Astra — archivo **completo**
No pegar solo los 3 bloques de filtrado. Copiar **todo** `guias/CSS-CATALOGO-3-COLECCIONES.css` (incluye panel, `display:none` del mensaje vacío, móvil).

### C) Elementor — quitar clase duplicada
En el widget HTML del panel (columna izquierda) → Avanzado → **borrar** `jm-catalogo-esencial`. Esa clase va **solo** en el contenedor padre que envuelve ambas columnas.

---

## Paso 5 — Cabecera del grid

### Mockup

Línea sobre el grid: **«8 productos»** a la izquierda · **«Destacados»** (orden) a la derecha.

### 5A — HTML en Elementor

En columna derecha, **widget HTML encima** de Woo – Products:

```html
<div class="jm-grid-head">
  <span class="jm-grid-head__label">Productos</span>
</div>
```

Mismo HTML en Esencial, Gold y Deluxe.

### 5B — Orden en el widget Woo – Products

| Opción UAE | Valor sugerido |
|------------|----------------|
| Order By | `Menu Order` o `Date` |
| Para destacados | Marcar productos como **Destacado** en WC → Order By `Featured` |

### 5C — Contador dinámico «X productos»

| Opción | Cómo |
|--------|------|
| **Solo CSS** | No actualiza al filtrar — mostrar «Productos» sin número |
| **Code Snippets** (recomendado si quieren número real) | Ver snippet abajo |

#### Snippet PHP (Code Snippets → PHP → Solo frontend)

```php
<?php
add_action( 'wp_footer', function () {
  if ( ! is_page( array( 'esencial', 'gold', 'deluxe' ) ) ) return;
  ?>
  <script>
  (function () {
    function actualizarConteo() {
      document.querySelectorAll('[class*="jm-catalogo-"]').forEach(function (sec) {
        var head = sec.querySelector('.jm-grid-head__label');
        var visibles = sec.querySelectorAll('ul.products li.product:not([style*="display: none"])');
        var n = 0;
        visibles.forEach(function (li) {
          if (li.offsetParent !== null && !li.classList.contains('jm-oculto')) n++;
        });
        if (!head) return;
        head.textContent = n === 1 ? '1 producto' : n + ' productos';
      });
    }
    window.addEventListener('hashchange', actualizarConteo);
    document.addEventListener('DOMContentLoaded', actualizarConteo);
    setTimeout(actualizarConteo, 500);
  })();
  </script>
  <?php
}, 99 );
```

> Sin Elementor Pro y sin snippet, deja el texto fijo **«Productos»**.

### 5D — CSS cabecera

Incluido en `guias/CSS-CATALOGO-3-COLECCIONES.css` (bloque `.jm-grid-head`).

---

## Paso 6 — Móvil + círculos hero

### 6A — Clase en contenedor de círculos (Elementor)

Selecciona el **contenedor padre** de los 5 círculos (imagen + texto PULSERAS, etc.) → **Avanzado → Clases CSS:**

| Página | Clases |
|--------|--------|
| Esencial | `jm-circulos-categoria jm-circulos-esencial` |
| Gold | `jm-circulos-categoria jm-circulos-gold` |
| Deluxe | `jm-circulos-categoria jm-circulos-deluxe` |

Eso alinea los círculos al mismo ancho que el catálogo (1200px) y evita el desborde.

### 6B — Enlaces de círculos → filtros

| Círculo Elementor | URL del enlace |
|-------------------|----------------|
| Pulseras | `#jm-f-pulseras` |
| Conjuntos | `#jm-f-conjuntos` |
| Cadenas | `#jm-f-cadenas` |
| Anillos | `#jm-f-anillos` |
| Aros | `#jm-f-aros` |

**Todas:** enlace `#jm-f-todas` en:
- **Banner / mini-banner «Esencial»** (imagen superior de la landing) → al hacer clic debe mostrar **todas** las categorías
- Texto del hero o botón «Ver todo» (opcional)

Sin `#jm-f-todas` en el banner, al entrar desde el home no se puede navegar por subcategoría hasta elegir una en el panel izquierdo.

### Prueba móvil

1. DevTools → vista iPhone
2. Clic círculo **Aros** → URL `…/esencial/#jm-f-aros`
3. Solo aros visibles (si tienen subcategoría)

---

## Checklist cierre D06

- [ ] Subcategorías/etiquetas en todos los productos (3 colecciones)
- [ ] Cabecera `.jm-grid-head` en 3 landings
- [ ] Orden destacados configurado en widget
- [ ] Círculos hero enlazados a `#jm-f-*` (móvil)
- [ ] Sin «Sin categorizar» en grid
- [ ] Publicar Elementor + Astra CSS
- [ ] Marcar tarea 06 en organizador

---

## Siguiente

- **D07** — Refinar landings vs mockup  
- **D09** — QA filtros mobile  
- **D12** — Ayuda + legales
