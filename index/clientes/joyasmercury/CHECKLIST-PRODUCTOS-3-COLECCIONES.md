# JM — Productos cargados pero no se ven en tienda (3 colecciones)

**Fecha:** 2026-07-21  
**Feedback Camila (audio):** en admin ve todo (foto, precio, specs); en la tienda online **no**. Están categorizados (colección + tipo). Pasa en **Esencial** (ej. +15 anillos → solo ~3 visibles) y hay que validar igual en **Gold** y **Deluxe**.

**Páginas:**  
- Esencial → contenedor `jm-catalogo-esencial`  
- Gold → `jm-catalogo-gold`  
- Deluxe → `jm-catalogo-deluxe`

---

## Por cada colección (repetir 3 veces)

### A) Contar en admin vs tienda
| Check | Esencial | Gold | Deluxe |
|-------|----------|------|--------|
| Anillos en stock (Woo) | ___ | ___ | ___ |
| Anillos visibles en landing | ___ | ___ | ___ |
| Cadenas en stock | ___ | ___ | ___ |
| Cadenas visibles | ___ | ___ | ___ |
| Aros en stock | ___ | ___ | ___ |
| Aros visibles | ___ | ___ | ___ |
| Pulseras / conjuntos (si aplica) | ___ | ___ | ___ |

### B) Elementor — widget Woo Products
1. Editar página de la colección.
2. Widget de la grilla de productos:
   - **Total Products:** ≥ 50 (o All) — **no** 3–8.
   - Query: categoría de esa colección (no solo featured / on sale).
   - **Sin** ID `jm-ultimas-unidades` ni clase `jm-home-ultimas` (eso filtra stock 1–2).
3. Publicar.

### C) Contenedor CSS
- Clase del contenedor padre: `jm-catalogo-esencial` / `jm-catalogo-gold` / `jm-catalogo-deluxe`.
- Overflow: Visible si aplica.

### D) Slugs vs CSS (Inspeccionar)
Un producto que Camila ve en admin pero **no** en tienda → clic derecho → Inspeccionar el `<li class="product …">`.

Debe tener:
| Colección | Clase esperada en `<li>` |
|-----------|---------------------------|
| Esencial | `esencial` |
| Gold | `gold` |
| Deluxe | `deluxe` |

Subcategoría (plural = slug Woo):
`anillos` · `cadenas` · `aros` · `pulseras` · `conjuntos`

Si el slug es `anillo` (singular) y el CSS pide `.anillos`, al filtrar se ocultan.

### E) Visibilidad Woo (1 producto “fantasma”)
- Publicado  
- Catálogo: **Tienda y resultados de búsqueda**  
- Stock OK  

### F) Caché
Vaciar caché + hard refresh (ventana privada) en las **3** URLs.

---

## Orden de trabajo sugerido
1. Esencial (la que Camila nombró) → subir Total Products → comparar conteos.  
2. Gold → mismo.  
3. Deluxe → mismo.  
4. Si aún faltan: inspeccionar 1 producto invisible por colección y anotar clases del `<li>`.

## Notas técnicas
- CSS completo: `CSS-COMPLETO-ASTRA.css` (oculta `li.product` sin clase de colección).  
- Snippet **JM-ULTIMAS-STOCK** solo afecta widgets con `jm-ultimas-unidades` / `jm-home-ultimas` — no debe estar en landings de colección.
