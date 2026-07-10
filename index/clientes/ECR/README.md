# ECR — Recursos por sitio web

Cliente **ECR** con **dos sitios WordPress + Elementor** distintos. No mezclar archivos entre uno y otro.

---

## Sitios

| Sitio | URL (referencia) | Carpeta en repo | Qué contiene |
|-------|------------------|-----------------|--------------|
| **ECR Group — Blog** | https://ecrgroup.cl/blog/ | `blog/` *(rama `cursor/ecr-blog-filtro-carrusel-4d93`)* | Filtro taxonomía + carrusel central + badges + fechas |
| **ECR Capacitaciones** | Sitio web de capacitaciones *(ecrcapacitaciones)* | **`capacitaciones/`** | Modal ruta de aprendizaje por sector |

---

## ECR Capacitaciones (este trabajo)

Sección: **«Sectores que abordamos en cada ruta»**

Modal naranja al hacer clic en cada tarjeta (Retail, Financiero, Salud, etc.) con descripción, competencias SENCE y cursos.

→ Documentación completa: **[capacitaciones/README.md](./capacitaciones/README.md)**

→ HTML listo para Elementor: **[capacitaciones/sectores-widget.html](./capacitaciones/sectores-widget.html)**

---

## Rama Git (capacitaciones)

```bash
git checkout cursor/ecr-capacitaciones-modal-4d93
```

Carpeta: `index/clientes/ECR/capacitaciones/`
