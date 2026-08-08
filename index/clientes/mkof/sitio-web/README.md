# MKOF · Sitio web

Proyecto **Making Of (MKOF)** para trabajo del sitio web.

| Campo | Valor |
|-------|--------|
| Cliente | MKOF - Talk |
| Código | WEB |
| Carpeta | `index/clientes/mkof/sitio-web/` |
| Portal MKOF | `index/clientes/mkof/` |
| Invocar | `@organizacion-clientes` o agente MKOF · proyecto Sitio web |

## Qué va aquí

Documentación, briefs, wireframes, copys, assets y notas de implementación del sitio web de Making Of / proyectos web del cliente.

## Cómo abrir

Con Laravel (`EMPEZAR-AQUI.bat` / puerto 8000):

- Hub: `http://127.0.0.1:8000/index/clientes/mkof/sitio-web/`
- Landing MKOF: `http://127.0.0.1:8000/index/clientes/mkof/`

## Estado

Propuestas Home 1B (Editorial arena):

| Archivo | Rol |
|---------|-----|
| `home-1b.html` | 1B original · menú Servicios / Casos / Nosotros / Insights |
| `home-1b-alt.html` | Otra diagramación · menú sitio: Servicios ▾ / Sobre nosotros / Contáctanos / Blog |
| `home-1b.css` / `home-1b.js` | Estilos + panel servicios (1B) |
| `home-1b-alt.css` / `home-1b-alt.js` | Estilos + dropdown + tabs (Alt) |

Abrir Alt: `http://127.0.0.1:8000/index/clientes/mkof/sitio-web/home-1b-alt.html`

### Criterios de diseño (feedback)
- Jerarquía: **Making Of** > frase partner > bajada
- Verde claro (`#99EADA` / `#C5EEE5`) solo en tipografía, no como fondo de sección
- Contenedores continuos; cortes de color suaves en secciones superiores
- Elementos: caras, fotos, iconos; motion de presencia (float / reveal)
