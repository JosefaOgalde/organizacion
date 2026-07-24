# ECR · Landing web (hero: imagen + texto + botón)

**Cliente:** ECR  
**Tipo:** tarea aparte del newsletter / portada Midjourney / carrusel LinkedIn.  
**Rama:** `cursor/ecr-landing-hero-texto-63e4`  
**Fecha:** 2026-07-22

## Objetivo

En la **landing del sitio** (Elementor): imagen de fondo ya lista + **texto encima** + **botón** (CTA).

No es Canva ni Midjourney: el fondo ya se generó/subió; el armado es en WordPress/Elementor.

## Cómo poner texto encima (Elementor)

1. Abrir la página de la landing en Elementor.
2. Clic en la **sección** que ya tiene la imagen como **fondo** (no el widget Imagen suelto).
3. Arrastrar widget **Título** o **Texto** **dentro** de esa sección/columna.
4. Escribir el copy; Estilo → color, tamaño, alineación.
5. Si no se lee: Sección → Estilo → **Superposición de fondo** (overlay oscuro/teal ~30–40%).
6. Debajo del texto: widget **Botón** (texto CTA + link).

### Si la imagen es un widget “Imagen” (no fondo)

El texto no queda encima con facilidad. Pasar la imagen a **fondo de la sección** y poner título/botón como widgets hijos.

## Checklist entrega

- [ ] Imagen de fondo OK (Cover / Portada)
- [ ] Texto overlay legible en desktop y móvil
- [ ] Botón con link correcto
- [ ] Overlay si hace falta contraste
- [ ] Publicar página / revisar en mobile

## Notas de copy (completar con la usuaria)

| Campo | Valor |
|-------|--------|
| Título / texto overlay | _(pendiente)_ |
| Texto del botón | _(pendiente)_ |
| URL del botón | _(pendiente)_ |
| URL de la landing | _(pendiente)_ |

## Separación de flujos ECR

| Flujo | Dónde |
|-------|--------|
| Portada newsletter MJ | `newsletter/` (solo fondo → Canva título) |
| Carrusel LinkedIn | Canva + copys en `newsletter/copys/` |
| **Landing web** | Este doc · Elementor en el sitio |
| **Landing MPD · Descargas** | [`MPD-DESCARGAS-ELEMENTOR.md`](./MPD-DESCARGAS-ELEMENTOR.md) — botones píldora + destacado Procedimiento MPD |
| **Incidente Header 24 jul** | [`INCIDENTE-HEADER-2026-07-24.md`](./INCIDENTE-HEADER-2026-07-24.md) — layout roto, revisiones, recuperación |

## Sesión 2026-07-24 (resumen guardado)

- Descargas MPD: responsive tablet **50%** (2×2); hover en Estilo → Al pasar el cursor; links → engranaje → **Abrir en ventana nueva**.
- Borrador: sin link público para supervisora (publicar o usuario WP).
- Incidente: sitio/header desconfigurado; Header sin revisión de hace 1 h (solo sesión actual + ~3 semanas). Ver doc incidente.
