# Ley Karin — ajustes en Elementor (solo UI, sin código)

Referencia PDF: [`1A-Ley-Karin-ECR-GROUP-Desktop.pdf`](./1A-Ley-Karin-ECR-GROUP-Desktop.pdf)

En el editor ahora tenés una sección blanca con el título largo + textos + imagen del celular.  
En el PDF Desktop esa parte **no es el hero**. El PDF arranca con un **hero a pantalla completa** (foto oficina + overlay oscuro + título blanco + botón naranja).

---

## 1. Hero (primera sección) — lo más importante

Creá / reordená para que **esta sea la primera sección** de la página.

| En Elementor (ahora) | En el PDF (objetivo) |
|----------------------|----------------------|
| Contenido claro sobre fondo claro | Foto de oficina a **todo el ancho** |
| Título gris oscuro de política | Título **blanco**: “Canal de denuncia del Acoso Sexual…” |
| Imagen del celular abajo | Botón naranja **HAZ TU DENUNCIA AQUÍ** |
| Sin overlay | Overlay **oscuro** sobre la foto |

### Cómo dejarlo en Elementor

1. **Contenedor / Sección** del hero → pestaña **Estilo → Fondo**
   - Tipo: **Imagen** (la foto de las dos personas en oficina del PDF).
   - Posición: Centro centro · Tamaño: Cubrir.
2. Misma sección → **Estilo → Superposición de fondo**
   - Activar overlay **negro** (o azul muy oscuro).
   - Opacidad aprox. **45–60%** (hasta que el texto blanco se lea bien).
3. **Altura**
   - Altura mínima alta (ej. **80–100 vh** o “Encajar en pantalla” si tu Elementor lo tiene).
4. **Contenido del hero** (columna izquierda / ancho ~50–60%)
   - Widget **Título**: texto del PDF  
     *Canal de denuncia del Acoso Sexual, Laboral y Violencia en el trabajo de las empresas asociadas a la marca ECR GROUP*
   - Color: **blanco** · Peso: negrita · Tamaño grande.
   - Widget **Botón** debajo: texto **HAZ TU DENUNCIA AQUÍ**
     - Fondo naranja ECR · Texto blanco · Bordes redondeados tipo pastilla (~50).
5. Abajo a la izquierda del hero (si el PDF tiene slider): indicadores (raya azul + puntos). Si no usás carrusel, podés omitirlos o poner un widget de puntos del Theme Builder / iconos.

> Tip: el menú superior (logo + links + 3 botones) en el PDF va **sobre** esta misma foto. Si el header es del Theme Builder, asegurate de que en esta página el header sea **transparente** y el menú en **blanco**.

---

## 2. Header / menú (comparar con PDF)

| Ahora (captura) | PDF |
|-----------------|-----|
| Links: Home, Nosotros, Soluciones, Industrias, Blog | Nosotros, Soluciones, **Servicios**, Industrias, Blog (sin “Home” en el mock) |
| Botones OK (Trabaja / Contacto / Ley Karin) | Iguales: naranja sólido · borde oscuro · borde naranja |
| Header sobre blur claro | Header sobre hero oscuro, tipografía **clara** |

### Ajustes

1. En el menú del header: quitar o no mostrar **Home** si el PDF no lo lleva; agregar **Servicios** si falta.
2. Botón **Trabaja con nosotros**: fondo naranja, texto blanco, pastilla.
3. Botón **Contacto**: fondo blanco, borde oscuro, texto oscuro.
4. Botón **Ley Karin**: fondo blanco, **borde naranja**, texto naranja (activo/destacado).
5. Logo ECR con fondo transparente (no caja blanca).

---

## 3. Segunda sección (la que ya tenés abierta)

Esta es la del título:

*“Política, Protocolo y Procedimiento…”*

### Objetivo según PDF

1. **Fondo blanco** (sin foto).
2. Título **centrado**, color gris-azulado oscuro (no navy puro).
3. Debajo: **2 columnas**
   - Izquierda: párrafos de la Ley N° 21.643 / compromiso ECR.
   - Derecha: imagen 3D del celular (la que ya tenés), con **bordes redondeados**.
4. Espaciado generoso arriba/abajo (padding del contenedor ~80–120 px en desktop).

### Qué cambiar respecto a tu captura

| Ahora | Cambiar a |
|-------|-----------|
| Título + textos + imagen **en una sola columna** (imagen abajo) | Contenedor de **2 columnas** (texto \| imagen) |
| Imagen a ancho completo debajo | Imagen solo en columna derecha |
| Mucho aire raro / highlight azul del editor | Quitar fondos de acento; dejar blanco limpio |

Pasos:

1. Dentro de esa sección, insertá un **Contenedor** → dirección horizontal → 2 columnas (≈ 55% / 45%).
2. Mové los widgets de texto a la columna izquierda.
3. Mové el widget **Imagen** a la columna derecha.
4. Imagen → Estilo → **Radio del borde** ~20–30 px.
5. Título: alineación **centro**; que quede **arriba de las 2 columnas** (fuera del contenedor de 2 cols), no solo encima del texto.

---

## 4. Checklist rápido antes de publicar

- [ ] Primera pantalla = hero con foto + overlay + título blanco + botón naranja.
- [ ] Header legible sobre el hero (texto/menú claros).
- [ ] Segunda sección = título centrado + 2 columnas (texto + imagen celular).
- [ ] Botones pastilla con los 3 estilos del PDF.
- [ ] Comparar lado a lado con el PDF Desktop a ancho ~1440 px (vista escritorio en Elementor).
- [ ] Revisar tablet/móvil: en móvil las 2 columnas pasan a apiladas (imagen debajo del texto).

---

## 5. Archivos en el repo

- PDF: `index/clientes/ecr/ley-karin/1A-Ley-Karin-ECR-GROUP-Desktop.pdf`
- Esta guía: `index/clientes/ecr/ley-karin/AJUSTES-ELEMENTOR.md`

Organizador: tarea **[ECR] Landing Elementor Ley Karin · 1A Desktop** (hoy).
