# Joyas Mercury — continuar desde respaldo 24 jul

**Respaldo activo:** `data/organizacion-respaldo-2026-07-24.json`  
**Organizador:** `http://127.0.0.1:8000/index.html?disco=1&tarea=jm/01`  
**Landing:** `http://127.0.0.1:8000/index/clientes/joyasmercury/`  
**Sitio:** https://joyasmercury.cl

## Tarea vigente en el calendario

`[JM] Novedades mobile · grilla 2×2 + cierre` · 27 jul · `tarea-jm-novedades-mobile-actual`

### Hecho en esta rama (CSS)
1. Novedades/Destacados en móvil → **grilla 2 columnas** (vista 2×2).
2. **Clones Slick ocultos** (ya no duplican tarjetas).
3. Hero/banner: `object-position: center 28%` para no recortar tipografía MERCURY.

### Pegar en WordPress
Opción A (recomendada): reemplazar todo el CSS JM por  
`CSS-COMPLETO-ASTRA.css` versión `2026-07-25-novedades-mobile-2x2`.

Opción B: si ya está el completo viejo, pegá al final  
`CSS-NOVEDADES-MOBILE-2x2.css`.

Luego: Ctrl+Shift+R en el celular.

### Checklist al cerrar la tarea
- [ ] Mobile: Novedades en 2 columnas, sin tarjetas duplicadas
- [ ] Hero: se lee MERCURY / tipografía del banner
- [ ] Paridad razonable con wireframes (`wireframes/mobile.html`)
- [ ] Marcar la tarea hecha en el organizador

## Pendiente Fase 2 (después del cierre mobile)

Del perfil cliente / metas:

1. Menú definitivo (Colecciones → Esencial/Gold/Deluxe; Destacados solo en Inicio)
2. 15 combinaciones WooCommerce (3 colecciones × 5 categorías)
3. Filtros AJAX en la misma landing
4. Destacados en home (si aún faltan productos)
5. Páginas legales + Nosotros + Contacto con estética marca
6. Carrito visual
7. Pruebas + entrega + guía para que Camila gestione el catálogo

Stack: WordPress + WooCommerce + Astra + Elementor Free + Smart Slider.  
Sin Elementor Pro salvo que Camila contrate licencia.
