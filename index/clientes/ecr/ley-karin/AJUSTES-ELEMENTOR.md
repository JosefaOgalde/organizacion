# Ley Karin — ajustes en Elementor (solo UI, sin código)

Referencia PDF: [`1A-Ley-Karin-ECR-GROUP-Desktop.pdf`](./1A-Ley-Karin-ECR-GROUP-Desktop.pdf)

**Banner / hero de arriba: ya lo tienen.** No hace falta rehacerlo.

Lo que hay que empatar con el PDF es la **sección de contenido** que sigue (título de política + textos + imagen del celular).

---

## Sección a ajustar (la del editor)

La que en Elementor muestra:

- Título: *“Política, Protocolo y Procedimiento…”*
- Párrafos de la Ley N° 21.643
- Imagen 3D del celular / chats

### Cómo está ahora (según captura)

- Todo en **una sola columna**: título → textos → imagen **abajo**, a todo el ancho.
- Fondo claro; la imagen ocupa el ancho completo debajo del texto.

### Cómo debe quedar (PDF Desktop)

1. **Fondo blanco** limpio.
2. Título **centrado** arriba (gris-azulado oscuro).
3. Debajo: **2 columnas**
   - **Izquierda:** los dos párrafos.
   - **Derecha:** la imagen del celular, más angosta, con **bordes redondeados**.
4. Padding generoso arriba/abajo en el contenedor (aprox. 80–120 px en desktop).

---

## Pasos en Elementor (sin código)

1. Seleccioná el **contenedor** de esa sección.
2. Insertá un **Contenedor** hijo → dirección **horizontal** → 2 columnas (≈ 55% texto / 45% imagen, o 50/50).
3. Dejá el **Título** arriba, **fuera** de las 2 columnas (o en un contenedor de ancho completo encima).
   - Alineación: **centro**.
4. Mové el **Editor de texto** (párrafos) a la columna **izquierda**.
5. Mové el widget **Imagen** a la columna **derecha**.
6. Imagen → pestaña **Estilo** → **Radio del borde** ≈ 20–30 px.
7. Imagen → **Ancho** / tamaño: que no estire a 100% de la página; que se vea como en el PDF (bloque redondeado a la derecha).
8. Revisá **espaciado** (Avanzado → padding/margin) entre título y columnas, y entre columnas.

### Móvil / tablet

- En responsive: las 2 columnas se apilan (texto arriba, imagen abajo).
- En móvil podés bajar un poco el tamaño del título.

---

## Checklist corto

- [ ] Banner superior: **ya listo** (no tocar salvo detalles finos).
- [ ] Título de política centrado.
- [ ] Texto | imagen en **2 columnas** (no imagen a ancho completo debajo).
- [ ] Imagen con bordes redondeados.
- [ ] Comparar con el PDF a ~1440 px de ancho.

---

## Archivos

- PDF: `1A-Ley-Karin-ECR-GROUP-Desktop.pdf`
- Tarea organizador: **[ECR] Landing Elementor Ley Karin · 1A Desktop** (#14)
