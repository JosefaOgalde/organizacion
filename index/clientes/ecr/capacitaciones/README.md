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

- **FINALIZADO** 2026-07-15: textos y links del modal validados; UI ajustada (sin truncar descripción, espacio competencias → ruta).
- Solo Excel y Power BI unificados (`Excel - Nivel` / `Power BI - Nivel`); resto de nombres literales del DOCX.
- Archivo a pegar en Elementor: `modal-ruta-sectores.html`.
- Links de cursos verificados (HTTP 200) el 2026-07-13.
- Descripciones según especificación editorial + `Texto nuevo Rutas de Aprendizaje.docx`.

## Pegar en Elementor

Reemplazar el HTML personalizado del modal por el contenido completo de
`modal-ruta-sectores.html` (incluye CSS + `ECR_SECTORES` + script).
