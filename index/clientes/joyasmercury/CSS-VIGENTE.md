# Joyas Mercury — qué CSS pegar (vigente)

## Por qué “falta” el footer y otros arreglos

El paquete grande `CSS-COMPLETO-ASTRA.css` (footer, menú móvil, catálogo, círculos, etc.) quedó en la rama  
`cursor/jm-css-hero-contain-6a09` y **nunca se fusionó a `main`**.  
Por eso en agentes/PRs nuevos solo veías el CSS corto de círculos, no el footer que ya habíamos hecho.

## Opción A — CSS completo (~3587 líneas) ← lo que pediste

Archivo: **`CSS-COMPLETO-ASTRA.css`** (`VERSIÓN: 2026-07-19-flechas-visibles`)

Incluye catálogo, círculos, home, **footer dorado**, menú móvil, producto single, etc.

1. Abre ese archivo en la rama `cursor/jm-css-circulos-elementor-fb61`
2. WP → CSS adicional → **borra** lo JM viejo → pega **todo** → Publicar

Raw GitHub (copiar desde el navegador):  
https://raw.githubusercontent.com/JosefaOgalde/organizacion/cursor/jm-css-circulos-elementor-fb61/index/clientes/joyasmercury/CSS-COMPLETO-ASTRA.css

## Opción B — piezas sueltas

| Orden | Archivo | Qué arregla |
|------|---------|-------------|
| 1 | `CSS-CIRCULOS-COLECCIONES.css` | Círculos + flechas visibles (`2026-07-19-v8`) |
| 2 | `CSS-FOOTER-JM.css` | Solo footer (`2026-07-19-footer`) |

## No mezclar

No pegues el completo **y** las piezas sueltas a la vez (se pisan). Elige A **o** B.

## Elementor (clases)

- Círculos: `jm-circulos-categoria` · Overflow Visible  
- Últimas: ID `jm-ultimas-unidades` + `jm-home-ultimas`  
- Footer: contenedores con clases `jm-footer` / `jm-footer__*` según el HTML del footer D
