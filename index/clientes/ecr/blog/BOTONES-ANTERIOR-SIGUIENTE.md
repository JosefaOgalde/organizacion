# ECR · Blog — botones Anterior / Siguiente (encoding)

**Síntoma:** en los botones se lee algo como:

- `←0a00a0Anterior`
- `Siguiente0a00a0→`

(rombo `` + texto `0a0` = espacio de no separación `U+00A0` / `&nbsp;` mal guardado, más flechas Unicode pegadas al texto).

**Dónde:** plantilla Elementor del **single del blog** (Theme Builder → Single Post) o widgets **Post Navigation** / botones manuales al pie del artículo.  
También puede verse en landings que reutilizan el mismo bloque (p. ej. artículos relacionados).

**No es CSS.** Se arregla en el panel de Elementor.

---

## Arreglo (paso a paso)

### 1. Abrí el widget correcto

1. WordPress → **Plantillas** → **Theme Builder** → **Single** (o la página/plantilla donde se ven los botones).
2. Editar con Elementor.
3. Clic en el botón **Anterior** o en el widget **Post Navigation**.

Si son dos **Botones** sueltos (no Post Navigation), repetí el arreglo en cada uno.

### 2. Limpiar el texto (lo importante)

En **Contenido → Texto** / **Previous Label** / **Next Label**:

| Campo | Pegar exactamente (solo esto) |
|-------|-------------------------------|
| Anterior | `Anterior` |
| Siguiente | `Siguiente` |

**Prohibido en el campo de texto:**

- Flechas `←` `→` `‹` `›` escritas a mano
- `&nbsp;` o espacios copiados de Word / Notion / Slack
- Pegar desde un TXT viejo que ya tenga `0a0`

Tip: borrá **todo** el campo → escribí de nuevo en el teclado (no pegues).

### 3. Flechas con ícono Elementor (no Unicode)

1. En el mismo widget → **Ícono** / **Icon** → activar.
2. Elegí una flecha de la librería (p. ej. `angle-left` / `angle-right` o `arrow-left` / `arrow-right`).
3. Posición:
   - **Anterior:** ícono **Antes** del texto
   - **Siguiente:** ícono **Después** del texto
4. Espacio ícono–texto: el control **Spacing** de Elementor (4–8 px). No uses espacios raros en el label.

### 4. Publicar y verificar

1. **Actualizar** / Publicar la plantilla.
2. Abrí un artículo en incógnito: `https://ecrgroup.cl/blog/…?nocache=1`
3. Debe verse: **← Anterior** y **Siguiente →** limpios (flecha = ícono, texto = solo la palabra).
4. Si sigue el `0a0`: el texto viejo quedó en **otro** widget duplicado — buscá en el árbol otro Heading/Button con el mismo label.

---

## Checklist

- [ ] Label Anterior = `Anterior` (sin flecha ni NBSP)
- [ ] Label Siguiente = `Siguiente` (sin flecha ni NBSP)
- [ ] Flechas solo por **ícono** Elementor
- [ ] Vista live sin `` ni `0a0`
- [ ] Hard refresh / purge caché si el sitio usa cache plugin

---

## Por qué pasa

Elementor a veces guarda mal un `&nbsp;` o un `U+00A0` pegado junto a `←`/`→`. En el front se “rompe” y se muestra el hex `0a0` con carácter de reemplazo. Texto ASCII limpio + ícono evita el bug del todo.
