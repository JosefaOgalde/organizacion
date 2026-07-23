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
