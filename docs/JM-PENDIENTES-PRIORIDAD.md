# Joyas Mercury — Pendientes priorizados (Fase 2)

**Actualizado:** 11 jul 2026 · Agente: `@joyas-mercury`

Orden: **más difícil / bloqueante primero**.

---

## Estado resumido (lo que ya avanzaste)

| Área | Estado |
|------|--------|
| Panel CATEGORÍAS (3 landings) | Hecho — botones HTML + CSS Astra |
| Query Woo por colección | Hecho — Esencial / Gold / Deluxe |
| Clases contenedor | Hecho — `jm-catalogo-esencial`, `-gold`, `-deluxe` |
| Mensaje categoría vacía | Hecho |
| Títulos widget duplicados Gold/Deluxe | Quitados |
| Filtro **Todas** | Funciona en las 3 colecciones |
| Filtro **Pulseras / Aros / …** | Panel OK; **falta data en productos** |

---

## Prioridad 1 — Subcategorías en productos (BLOQUEANTE)

**Dificultad:** Alta · **Tiempo:** Depende de catálogo (~40–120 productos)  
**Responsable principal:** Camila (datos WC) · **Soporte:** guía en repo

### Por qué es lo primero

Sin `product_cat-esencial-pulseras` (o etiqueta `pulseras`) en el `<li class="product">`, el CSS oculta todo y muestra *«No hay productos en esta categoría»*.

### Qué hacer

1. Leer: `index/clientes/joyasmercury/guias/GUIA-SUBCATEGORIAS-PRODUCTOS.md`
2. Por colección: **Productos → Acciones en lote → Editar**
3. Marcar **colección padre + subcategoría** (o etiqueta)
4. Verificar con Inspeccionar elemento en `/esencial/#jm-f-pulseras`

### Criterio de listo

- [ ] 100 % productos Esencial con subcategoría o etiqueta
- [ ] 100 % productos Gold con subcategoría o etiqueta
- [ ] 100 % productos Deluxe con subcategoría o etiqueta
- [ ] Clic en cada botón del panel muestra productos reales (no mensaje vacío)

---

## Prioridad 2 — D06 Paso 5: cabecera catálogo

**Dificultad:** Media · **Mockup:** `02-esencial-referencia.png` → «8 productos» + «Destacados»

### HTML (columna derecha, **encima** de Woo – Products)

```html
<div class="jm-grid-head">
  <span class="jm-grid-head__label">Productos</span>
</div>
```

> El contador dinámico («8 productos») **no es posible solo con CSS** al filtrar. Ver opciones en `dia-6/README.md` (Paso 5).

### Orden «Destacados»

En widget **Woo – Products (UAE)** → **Query** → **Order By**:
- `Menu order` o `Featured` según cómo marquen destacados en WC.

### CSS

Añadir bloque `.jm-grid-head` del archivo `guias/CSS-CATALOGO-3-COLECCIONES.css`.

### Criterio de listo

- [ ] Cabecera visible sobre el grid (3 landings)
- [ ] Orden coherente con productos destacados

---

## Prioridad 3 — Móvil: filtros sin panel lateral

**Dificultad:** Media · **D09 parcial**

El CSS **oculta el panel** en `< 768px`. Los **círculos del hero** deben enlazar a los mismos anchors:

| Círculo | Enlace |
|---------|--------|
| Pulseras | `#jm-f-pulseras` |
| Conjuntos | `#jm-f-conjuntos` |
| Cadenas | `#jm-f-cadenas` |
| Anillos | `#jm-f-anillos` |
| Aros | `#jm-f-aros` |

En Elementor: cada círculo → **Enlace** → URL personalizada `#jm-f-pulseras` (etc.).

### Criterio de listo

- [ ] En móvil, clic en círculo filtra igual que el panel desktop
- [ ] «Todas» accesible (enlace `#jm-f-todas` en logo o botón extra si hace falta)

---

## Prioridad 4 — D07 Landings (refinamiento)

**Dificultad:** Media-baja

Layout base hecho. Pendiente alinear 100 % con mockups 02/03/04:
- Espaciado panel vs grid
- Tipografía cabecera colección
- Coherencia colores activos por colección

---

## Prioridad 5 — D12 Ayuda + legales

**Dificultad:** Media · **Mockup:** `06-ayuda-referencia.png`

Página **Ayuda** en Elementor (hero rosa casi listo). Falta:
- Tarjetas: Políticas, Despachos, Garantías, Contacto
- Enlaces a páginas legales WC

Guía futura: `dia-12/` (por crear).

---

## Prioridad 6 — D10 Destacados en Inicio

**Dificultad:** Media

Bloque «Productos destacados» en **Inicio v2** — `site-inventory.json` marca `pendiente integrar home`.

---

## Prioridad 7 — D08 AJAX (opcional)

**Dificultad:** Alta si sin plugin

Filtro actual = CSS + `#anchor` (sin recarga real, cambia hash). Para UX premium:
- Plugin **Filter Everything** o
- Snippet JS mínimo (Code Snippets)

Solo si Camila/Camilo piden quitar el `#` de la URL.

---

## Documentos de referencia

| Archivo | Contenido |
|---------|-----------|
| `docs/JM-FILTROS-CATALOGO-HANDOFF.md` | HTML, CSS, troubleshooting |
| `index/clientes/joyasmercury/dia-6/README.md` | Pasos D06 restantes |
| `index/clientes/joyasmercury/guias/GUIA-SUBCATEGORIAS-PRODUCTOS.md` | Lote WC |
| `index/clientes/joyasmercury/guias/CSS-CATALOGO-3-COLECCIONES.css` | CSS copiar/pegar |
| `?tarea=joyas-mercury/06` | Organizador |

## Respaldo organizador

Siempre el **más actualizado** (`organizacion-respaldo-*.json` en Descargas o `data/`).  
Referencia jul 2026: `C:\Users\josef\Downloads\organizacion-respaldo-2026-07-06.json`
