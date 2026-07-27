# ECR · Soluciones / Remuneraciones — textos a la izquierda

**URL:** https://ecrgroup.cl/soluciones/remuneraciones/  
**Sección:** “¿Cómo te ayudamos con las remuneraciones en tu empresa?”

## Recomendado: no usar Pestañas

En el live se ven **los 5 ítems a la vez** (solo el activo con fondo celeste). Eso no es un buen uso de Pestañas, y el tema **centra** los títulos inactivos aunque en Elementor pongas Izquierda / Justificar Inicio.

### Arreglo directo en Elementor (sin CSS)

1. En la columna izquierda, **borrá** (o ocultá) el widget **Pestañas**.
2. Agregá un **Editor de texto** (o 5 widgets Título/Texto, uno por ítem).
3. Pegá los 5 párrafos.
4. En cada uno: **Estilo → Alineación → Izquierda** (Desktop + Móvil).
5. La foto de la derecha no se toca.
6. **Actualizar** → `?nocache=1`.

Así queda alineado de verdad, sin pelear con el CSS de Tabs.

---

## CSS para pegar en el widget Pestañas

**Avanzado → CSS personalizado** del widget **Pestañas** (reemplazá todo lo anterior):

```css
/* Contenedor + títulos + contenido */
selector,
selector .elementor-tabs-wrapper,
selector .elementor-tabs-content-wrapper,
selector .elementor-tab-title,
selector .elementor-tab-desktop-title,
selector .elementor-tab-mobile-title,
selector .elementor-tab-content,
selector .elementor-tab-content p,
selector .elementor-heading-title,
selector p,
selector h2,
selector h3,
selector h4 {
  text-align: left !important;
}

/* Flex: quitar centrado horizontal de cada pestaña */
selector .elementor-tab-title,
selector .elementor-tab-desktop-title,
selector .elementor-tab-mobile-title {
  justify-content: flex-start !important;
  align-items: flex-start !important;
  margin-left: 0 !important;
  margin-right: 0 !important;
  padding-left: 12px !important;
  padding-right: 12px !important;
}

/* Pestañas nuevas (Nestable / e-n-tabs) por si el widget es ese */
selector .e-n-tabs-heading,
selector .e-n-tab-title,
selector .e-n-tabs-content,
selector .e-n-tabs-content p {
  text-align: left !important;
}

selector .e-n-tab-title {
  justify-content: flex-start !important;
  align-items: flex-start !important;
  margin-left: 0 !important;
  margin-right: auto !important;
}

selector .e-n-tabs-heading {
  align-items: stretch !important;
  justify-content: flex-start !important;
}
```

Luego **Actualizar** → ver en incógnito:  
`https://ecrgroup.cl/soluciones/remuneraciones/?nocache=1`

---

## Si sigue centrado (panel Estilo)

Con el widget **Pestañas** seleccionado:

1. **Estilo → Título** (o **Tab Title**) → **Alineación** → **Izquierda** (en Desktop **y** Móvil).
2. **Estilo → Contenido** → **Alineación** → **Izquierda**.
3. Si hay **Dirección: Vertical**, revisá que no haya “Centrar” en alineación del contenedor de títulos.

---

## Checklist

- [ ] CSS de arriba pegado en **Pestañas** (no en la columna sola)
- [ ] Alineación Izquierda en Estilo → Título y Contenido (Desktop + Móvil)
- [ ] Live con `?nocache=1` sin texto centrado
- [ ] La pestaña activa puede seguir con fondo celeste; eso está bien — solo cambia la alineación
