# Especificación LMS — Certificado Formación para Facilitadores

Plantilla horizontal **1123 × 794 px** (A4 apaisado a 96 dpi), misma medida que los certificados CLA. El SVG escala a A4 impresión (297 × 210 mm).

## Archivos

| Archivo | Uso |
|---------|-----|
| `fondo-lms-1123x794.svg` | Fondo para cargar en Empieza / Proyecto (sin datos variables) |
| `plantilla-certificado-1123x794.svg` | Maqueta de revisión con datos de ejemplo |
| PNG exportados desde el preview | Misma composición, listos para subir si el LMS pide imagen |

## Campos variables

Empieza ya emite certificados con **número** (`Certificado N° 41773` en [empieza.desafiolatam.com](https://empieza.desafiolatam.com/)). Por eso el ID va en plantilla.

| Campo | Texto estático en el fondo | Overlay LMS | Caja (px) | Ancla |
|-------|----------------------------|-------------|-----------|--------|
| Nombre de la formación | — | `Formación para Facilitadores` (u otro registro) | x=80 y=108 w=963 h=50 | centro |
| Nombre completo | — | Nombre del facilitador/a | x=80 y=270 w=963 h=100 | centro |
| Fecha de emisión | etiqueta `FECHA DE EMISIÓN` | fecha en español | x=120 y=668 w=320 h=32 | centro de columna izq. |
| Identificador | etiqueta `CERTIFICADO N°` | código/número Empieza | x=683 y=668 w=320 h=32 | centro de columna der. |

El nombre es el protagonista: el renderer baja el cuerpo de 46 px a 22 px y parte en dos líneas si hace falta. En el LMS, usar fuente sans geométrica (Uni Neue / Helvetica Neue / Inter), peso 800, color `#0F2E81`, alineación centrada, caja ancha.

## Qué no poner en el overlay

Decoración (barra verde/amarilla, esquinas, mosaico) y copy fijo viven en el fondo. No repetir «Certificado de Aprobación», «DESAFÍO LATAM», «Certifica que» ni el párrafo de aprobación en el overlay, o se duplican.

## Identidad

Paleta oficial ADL (`IDENTIDAD-ADL.md` del reporte CChC): azul `#0F2E81`, verde `#729E2E`, amarillo `#FFCD56`. Tipografía de marca: **Uni Neue** (fallback Helvetica Neue / Inter). Sustituir el wordmark por el logo oficial SVG cuando esté disponible; el espacio superior no lo requiere para equilibrar.

## Pendiente de confirmar en Empieza

El token exacto del LMS (HTML, `{fullname}`, campo de imagen + capas, etc.) no está en el brief. La composición asume overlay de texto sobre PNG/SVG, que es el flujo habitual. Si Empieza pide solo un PDF cerrado, usar la maqueta completa y no el fondo vacío.
