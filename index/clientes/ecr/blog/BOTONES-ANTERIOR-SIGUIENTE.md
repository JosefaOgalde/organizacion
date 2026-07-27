# ECR · Blog — botones Anterior / Siguiente (paginación Loop Grid)

**Síntoma:** `←0a00a0Anterior` · `Siguiente0a00a0→`  
(rombo + `0a0` = `&nbsp;` / `U+00A0` mal guardado junto a flechas Unicode).

**Dónde:** página **Blog** → widget **Loop Grid** + HTML personalizado con jQuery (no es Post Navigation del single).

---

## Causas

1. En el Loop Grid → **Paginación** → labels con `←`/`→` + `&nbsp;` pegados.
2. El script HTML tenía un bug: llama `forzarBotonesArriba()` pero la función se llama `arreglarPaginacionArriba` → no corre el arreglo.
3. El script solo **agrega** botones disabled si faltan; **no limpia** el texto ya roto de Elementor.

---

## Paso A — Labels en Elementor (obligatorio)

Loop Grid (el de arriba del blog) → **Paginación**:

| Campo | Valor exacto |
|-------|----------------|
| Previous Label | `Anterior` |
| Next Label | `Siguiente` |

Borrar el campo y **tipear** (no pegar). Sin flechas ni espacios raros.

---

## Paso B — Reemplazar el HTML/JS

Widget **HTML** (o el Custom Code donde está el script) → pegar **esto entero**:

Pegá el contenido de [`paginacion-loop-grid-fix.html`](./paginacion-loop-grid-fix.html) (reemplaza el script viejo completo).

Cambios clave vs tu HTML:

1. `forzarBotonesArriba()` → `arreglarPaginacionArriba()` (antes no existía y fallaba en consola).
2. Fuerza `.text('Anterior')` / `.text('Siguiente')` en prev/next ya renderizados (limpia el `0a0`).
3. Mantiene el disabled cuando falta prev/next y el `bucle-bloqueado` al filtrar.

---

## Paso C — Flechas (opcional, por CSS)

Si querés flechas **sin** tocar el texto, en CSS personalizado de la página:

```css
.elementor-widget-loop-grid .elementor-pagination .prev::before {
  content: "← ";
}
.elementor-widget-loop-grid .elementor-pagination .next::after {
  content: " →";
}
```

Así el HTML del label sigue siendo solo `Anterior` / `Siguiente`.

---

## Checklist

- [ ] Labels del Loop Grid = `Anterior` / `Siguiente` (tipeados)
- [ ] Script reemplazado (ya no llama `forzarBotonesArriba`)
- [ ] Tras filtrar / paginar, los botones siguen limpios
- [ ] Live: `https://ecrgroup.cl/blog/?nocache=1` sin `0a0`
- [ ] Actualizar + purge caché

---

## Por qué el script viejo no alcanzaba

```js
forzarBotonesArriba(); // ❌ no existe → ReferenceError en consola
```

La función real era `arreglarPaginacionArriba`. Además no reescribía el texto ya roto que viene del widget.
