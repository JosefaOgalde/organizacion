# Joyas Mercury — Home: 3 círculos de colecciones con Elementor Free

**Objetivo:** Esencial · Gold · Deluxe en el home, **redondos y estables**, sin depender de CSS adicional en Apariencia → Personalizar.

**Por qué:** el CSS pegado en Astra a veces “dura” 1–2 días y después se pierde / se pisa (caché, otro CSS, actualización). Con **solo controles nativos de Elementor Free** el diseño queda en la página.

**Sitio:** https://joyasmercury.cl · página **Inicio** / **Inicio v2** (plantilla Elementor activa).

**Stack:** Elementor Free (sin Pro).

---

## Antes de tocar

1. Entrá a WP → **Páginas → Inicio** (o Inicio v2) → **Editar con Elementor**.
2. Localizá el bloque actual de las 3 colecciones (imágenes Esencial / Gold / Deluxe).
3. Si hoy usan clase `jm-circulos-categoria` + CSS adicional: **esta tarea los reemplaza** con widgets nativos. No hace falta pegar `CSS-CIRCULOS-COLECCIONES.css` para estos 3.

---

## Montaje recomendado (Elementor Free)

### 1) Contenedor fila (desktop)

1. **Contenedor** (Flex / Columns) a ancho completo del contenido.
2. Dirección: **Fila** · Justificar: **Centro** · Alinear: **Inicio** · Gap: ~16–24 px.
3. Overflow: **Visible**.
4. En **Responsive → Móvil**: podés dejar fila (3 columnas chicas) o pasar a columna si se ven apretados; lo ideal en joyería es **seguir con 3 en fila** en móvil, más chicos.

### 2) Tres columnas hijas (una por colección)

Por cada una (Esencial · Gold · Deluxe):

1. Contenedor hijo · ancho ~33% en desktop.
2. Contenido centrado (align center).
3. Widgets dentro, en este orden:
   - **Imagen** (foto de la colección, idealmente **cuadrada** 1:1)
   - **Título** o texto: `Esencial` / `Gold` / `Deluxe`
4. Enlace de la imagen (y/o del título) a la landing de esa colección.

### 3) Hacer la imagen circular (sin CSS custom)

En cada widget **Imagen**:

1. **Estilo → Borde → Radio del borde:** `50%` (o 999 px) en los 4 lados.
2. **Estilo → Ancho:** p. ej. `140px` desktop · `96px` móvil (Responsive).
3. **Altura:** automática; si la foto no es cuadrada, **recortala a 1:1** antes de subir (Media) para que el círculo no se vea ovalado.
4. Tamaño de imagen en contenido: **Completo** o **Miniatura** (evitar “Personalizado 350px” enorme).
5. Object-fit: si Elementor lo muestra, **Cover**.

Opcional (borde dorado marca):

- Estilo → Borde → Ancho 2–3 px · Color `#ECC54A` (dorado JM) o el tono de cada línea (Esencial / Gold / Deluxe).

### 4) Textos bajo el círculo

- Tipografía alineada al brand (sin inventar pesos raros).
- Centrado · color oscuro legible sobre el fondo del home.
- Espacio superior pequeño (margen) para que no “pegue” al círculo.

### 5) Publicar y validar

1. **Publicar** en Elementor.
2. Desktop + móvil (ventana privada / Ctrl+Shift+R).
3. Probar los 3 links → landings Esencial / Gold / Deluxe.
4. Confirmar que **sin** CSS adicional de círculos, se siguen viendo redondos al día siguiente.

---

## Checklist de cierre

| Check | OK |
|-------|----|
| 3 círculos Esencial · Gold · Deluxe en home | ☐ |
| Forma circular solo con **Radio 50%** Elementor (sin CSS adicional JM) | ☐ |
| Fotos 1:1 (no ovaladas) | ☐ |
| Links a landings correctos | ☐ |
| Desktop + móvil OK tras hard refresh | ☐ |
| No depende de `CSS-CIRCULOS-COLECCIONES.css` para estos 3 | ☐ |

---

## Notas

- El CSS de círculos en repo puede seguir existiendo para **páginas de colección** (5 círculos de categorías) u otros bloques; esta tarea es **solo home × 3 colecciones**.
- Si más adelante Camila pide cambio de foto: se cambia en el widget Imagen de Elementor (no en CSS).
- Referencia visual: wireframe Inicio en `interfaces/referencia-landings/01-inicio-referencia.png`.
