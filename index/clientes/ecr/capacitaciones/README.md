# ECR Capacitaciones — Modal rutas por sector

Información **guardada** en este repositorio (rama `cursor/ecr-6a09`).

## Archivos

| Archivo | Para qué sirve |
|---------|----------------|
| `REVISION-TEXTOS-Y-LINKS-MODALES.txt` | **Entregable de revisión:** todos los textos de cada modal + links |
| `links-sectores-cursos.txt` | Solo lista de cursos/URLs por sector (imágenes 3–9) |
| `modal-ruta-sectores.html` | Bloque completo CSS + JS para pegar en Elementor |
| `preview-modal.html` | Preview local para probar el modal |

## Cómo pegar en el sitio

1. Abrir Elementor en la página de capacitaciones / sectores.
2. Reemplazar el HTML personalizado del modal por el contenido de `modal-ruta-sectores.html`.
3. Las cards deben tener `data-ecr-sector="retail|financiero|salud|tecnologia|gestion|logistica|datos|soluciones-in-company"`.

## Estado

- Links de cursos verificados (HTTP 200) el 2026-07-13.
- Textos exportados para revisión editorial en `REVISION-TEXTOS-Y-LINKS-MODALES.txt`.
- Ajustes UI: modal centrado en mobile, botones celeste + hover, espacio bajo título.
