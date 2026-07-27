# ECR · Soluciones / Remuneraciones — alinear textos a la izquierda

**URL:** https://ecrgroup.cl/soluciones/remuneraciones/  
**Sección:** “¿Cómo te ayudamos con las remuneraciones en tu empresa?”  
**Objetivo:** los 5 bloques de texto (columna izquierda) alineados a la **izquierda**, no centrados.

No confundir con `/remuneraciones/` (software).

---

## Qué tocar

Columna de texto (izquierda) con estos ítems:

1. Cálculo y procesamiento de remuneraciones  
2. Pago de remuneraciones  
3. Administración de cotizaciones previsionales  
4. Gestión de licencias médicas, vacaciones y ausencias  
5. Cumplimiento normativo laboral y previsional  

La foto (derecha) no se toca.

---

## En Elementor (Desktop)

1. Abrí la página → Editar con Elementor.
2. Clic en la sección **¿Cómo te ayudamos…**
3. En la **columna izquierda** (la del listado, no la de la foto):

### Opción A — Un solo widget de texto / Heading por ítem

Para **cada** widget (Título o Texto / Editor):

1. Seleccioná el widget.
2. **Estilo → Alineación** → **Izquierda** (ícono de alineación izquierda).
3. Repetí en los 5 (o en el widget único si es un solo Editor con los 5 párrafos).

### Opción B — Contenedor / columna con alineación centrada

Si la columna o un contenedor padre tiene alineación centrada, eso fuerza todo al centro:

1. Clic en la **columna** o contenedor flex de la izquierda.
2. **Diseño / Layout**:
   - **Alinear horizontal** / Justify → **Inicio** (o Izquierda)
   - **Alinear contenido** → **Inicio** / flex-start
3. **Estilo → Tipografía** del texto: alineación **Izquierda**.

### Opción C — CSS rápido (solo si el panel no alcanza)

En CSS personalizado de esa sección/columna:

```css
selector {
  text-align: left !important;
}

selector .elementor-heading-title,
selector .elementor-widget-text-editor,
selector p,
selector h2,
selector h3,
selector h4 {
  text-align: left !important;
}
```

(`selector` = el keyword de Elementor Custom CSS del widget/columna.)

---

## Checklist

- [ ] Desktop: 5 textos a la izquierda
- [ ] Tablet / Móvil: también izquierda (revisar ícono dispositivo; a veces la alineación está solo en Desktop)
- [ ] Título de sección “¿Cómo te ayudamos…?” puede quedar centrado o a la izquierda según diseño; lo importante son los **5 ítems**
- [ ] **Actualizar** → `https://ecrgroup.cl/soluciones/remuneraciones/?nocache=1`

---

## Nota tipográfica

“Pago de remuneraciones” se ve más grande/azul: no hace falta cambiar tamaño/color; solo la **alineación**.
