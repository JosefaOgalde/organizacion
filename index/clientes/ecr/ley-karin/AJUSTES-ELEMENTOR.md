# Ajustes Elementor — Landing Ley Karin (solo UI)

Referencia: `1A-Ley-Karin-ECR-GROUP-Desktop.pdf`  
**No hace falta código CSS.** Todo desde el panel de Elementor.

---

## Lo que ya está OK

- El **banner / hero de arriba** (foto + menú) ya está. No lo toques.
- En **Desktop** (imagen 1 y 4): el bloque título + texto + ilustración se ve bien.

---

## Problema: se desborda en móvil (imágenes 3 y 4 del chat)

En móvil se ve que:

1. El **contenedor de 2 columnas** (texto | imagen) **sigue lado a lado** y se sale del ancho del teléfono → el texto queda cortado a la izquierda.
2. El **título** queda con mucho margen lateral y casi una palabra por línea.

### Arreglo A — Apilar columnas en móvil (lo más importante)

1. En la barra superior de Elementor, activá **Móvil** (ícono de teléfono).
2. Hacé clic en el **contenedor padre** que envuelve las **2 columnas** (texto + imagen del celular).  
   Suele ser el que tiene el borde rosa alrededor de ambas columnas.
3. Panel izquierdo → **Diseño** (o **Layout**):
   - **Dirección** / **Flex Direction** → **Columna** (vertical), **solo en Móvil**.
   - Si hay icono de dispositivo al lado del control, asegurate de que esté en **móvil** antes de cambiar.
4. En **cada columna** (texto e imagen):
   - **Ancho** → **100%** (en móvil).
   - **Ancho mínimo** → vacío o `0` / `auto` (nada fijo tipo `500px`).
5. **Orden** (opcional, en móvil):
   - Primero el texto, después la imagen: en la columna de imagen → **Orden** = `2` (o arrastrá el widget abajo en el árbol).

Resultado esperado: en el teléfono se ve **título → texto completo → imagen**, sin scroll horizontal ni letras cortadas.

### Arreglo B — Quitar lo que empuja fuera de pantalla

Con **Móvil** activo, revisá el mismo contenedor y las columnas:

| Control | Valor recomendado en móvil |
|---------|----------------------------|
| Margen izquierdo / derecho | `0` |
| Padding izquierdo / derecho | `16`–`24` px (no más de ~32) |
| Ancho del contenedor | `100%` |
| Ancho máximo | `100%` o vacío |
| Desbordamiento (Overflow) | `Hidden` o `Default` (no `Visible` si se sale) |
| Transform / desplazamiento X | `0` (nada negativo) |

Si alguna columna tiene **margen negativo** o **ancho fijo en px**, borrarlo en móvil.

### Arreglo C — Título legible en móvil

Seleccioná el widget del título largo (*Política, Protocolo…*):

1. **Estilo → Tipografía** (con móvil activo):
   - Tamaño ≈ **18–22 px** (no el mismo que desktop).
2. **Avanzado → Margen**:
   - Izquierda y derecha ≈ `0` o `8–12` px (no márgenes grandes).
3. **Avanzado → Padding**:
   - Horizontal ≈ `12–16` px.
4. Alineación: **izquierda** o **centrado**, según prefieras; con menos margen lateral ya no queda “una palabra por renglón”.

### Arreglo D — Imagen del celular en móvil

1. Widget de la imagen → **Avanzado → Ancho** → `100%` o máx. `280–320` px centrado.
2. **Alineación** → centro.
3. Que **no** tenga `position: absolute` ni márgenes negativos en móvil.

---

## Checklist rápido (modo Móvil)

- [ ] Contenedor de 2 cols → **dirección columna**
- [ ] Cada col → **ancho 100%**
- [ ] Márgenes horizontales → **0** (o muy chicos)
- [ ] Título → **fuente más chica** + menos padding lateral
- [ ] Imagen → **100%** o centrada, sin salirse
- [ ] Vista previa móvil: **no hay scroll horizontal**; el texto de Ley Karin se lee entero

---

## Desktop (no romper lo que ya está bien)

Cuando vuelvas a **Desktop**:

- Las 2 columnas pueden seguir **en fila** (50/50 o 55/45).
- No copies los valores de móvil a desktop: Elementor guarda **por dispositivo**.

---

## Si sigue desbordando

1. Clic derecho en el contenedor problemático → **Navegar** / mirar el árbol: ¿hay un contenedor interno con ancho fijo?
2. En ese contenedor interno, en móvil: ancho **100%**, margen **0**.
3. Evitá “Ancho personalizado” en px en móvil; preferí **%** o **auto**.

Cuando quede bien en móvil, **Actualizar** / publicar el borrador *Ley Karin*.

---

## Estado / continuar mañana (24 jul 2026)

Trabajo en **WordPress/Elementor** (ecrgroup.cl), no solo en este repo.  
**Publicar / Actualizar** el borrador en Elementor antes de cerrar.

### Tipografía texto cuerpo (proporción fija)
| Pantalla | Tamaño | Altura de línea | Color |
|----------|--------|-----------------|-------|
| Grande | 30 px | 40 px | `#556880` |
| Escritorio | 24 px | 35 px | `#556880` |
| Tablet | 20 px | 30 px | `#556880` |
| Móvil | 16 px | 25 px | `#556880` |

### Bloque texto + imagen celular
- Estructura: Contenedor fila → col texto + col imagen (sin contenedor extra).
- Grande/escritorio: texto 55% izq · imagen 45% der · fila **Estirar** · imagen Alto 100% + Cover.
- Tablet/móvil: Dirección **Columna** · ambos 100% · imagen abajo · Alto Auto + Contain.
- Texto de abajo (“Además…”): contenedor 100% debajo de la fila.

### Botones políticas (naranja + azul)
- Contenedores (no widget Botón si no toma Enter): texto en 2 líneas.
- Escritorio: padre fila · hijo naranja 50% Justificar **Final** · hijo azul 50% Justificar **Inicio**.
- Móvil: columna · ambos 100% · misma altura mínima/relleno.
- Sin subrayado.

### Banner Canal de Denuncias (foto equipo)
```
Contenedor 1 (envoltorio)
  Contenedor 2 (banner 100%, min-height 280, Justificar Final, Overflow Oculto)
    Imagen — Absoluta, z-index 1, Cover
    Contenedor 3 — 40%, z-index 2, fondo #111 80%
      Encabezado (blanco) + Botón HAZ TU DENUNCIA (naranja)
```
- Móvil: Imagen **Por defecto** (no absoluta) · Contenedor 3 ancho 100%.
- Desbordamiento = en **Disposición → Opciones adicionales → Desbordamiento → Oculto**.

### Descargas (filtro + entradas)
Categorías **nuevas** (no renombrar Artículos/Editorial/Eventos/Prensa):
| Nombre | Slug |
|--------|------|
| Políticas del delito | `politicas-del-delito` |
| Manual del delito | `manual-del-delito` |
| Procedimiento MPD | `procedimiento-mpd` |
| Tipos de delito | `tipos-de-delito` |

Pendiente Elementor:
1. Cuadrícula de bucle → tipo plantilla **Entradas** → plantilla Loop Post (ej. Loop Post simple).
2. **Consulta → Incluir** solo las 4 categorías de delito.
3. Filtro de taxonomía → **Rejilla de bucle seleccionada** → esa cuadrícula.
4. HTML de íconos: no muestra entradas; solo SVG vía `ecr_get_term_icons`. Pegar SVG en campo **Ícono SVG** de cada categoría.

### Tarea organizador
`[ECR] Landing Elementor Ley Karin · 1A Desktop` (#14)  
Ver: `http://127.0.0.1:8000/index.html?disco=1&tarea=ecr/14`  
Si no aparece: `node scripts/add-ecr-ley-karin-elementor.js`
