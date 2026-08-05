# Estética GMO ↔ MOVA

Propuesta visual para [grupomakingof.com](https://grupomakingof.com) alineada a [acme-chile.cl/mova](https://acme-chile.cl/mova/), **manteniendo contenido y estructura reales de GMO**.

Fuente de copy: `CONTENIDO-GMO-REAL.txt`

| Archivo | Página real |
|---------|-------------|
| `mock-gmo-mova.html` | Home (navegable completo) |
| `mock-gmo-home-motion.html` | Home con **movimiento** (plexus vivo, reveal, marquee) |
| `evidencia/gmo-home-mova-motion-concept.png` | Imagen concept del home con dinámica |
| `estrategia.html` | Servicios → Estrategia |
| `seo-geo.html` | Servicios → SEO & GEO |
| `productos-digitales.html` | Servicios → Productos digitales |
| `creatividad-diseno.html` | Servicios → Creatividad y diseño |
| `sobre-nosotros.html` | Sobre nosotros |
| `contactanos.html` | Contáctanos |
| `blog.html` | Blog |
| `gmo-mock.css` | Estilos compartidos |
| `PROPUESTA.md` | Diagnóstico + tokens |

Nav real: **Inicio · Servicios (dropdown) · Sobre nosotros · Contáctanos · Blog**.  
En home, «Definir / Crear / Analizar / Posicionar / Identificar» son pilares visuales (no páginas del menú).

### Navegar (Laravel :8000)
- Home navegable: `…/mock-gmo-mova.html`
- Home + movimiento: `…/mock-gmo-home-motion.html`
- Concept imagen: `evidencia/gmo-home-mova-motion-concept.png`
- Demo video: `evidencia/gmo-home-mova-motion-demo.mp4`

```bat
git fetch origin cursor/mkof-estetica-gmo-mova-951b
git checkout origin/cursor/mkof-estetica-gmo-mova-951b -- index/clientes/mkof/estetica-gmo-mova/
```
