# Joyas Mercury — qué CSS pegar (vigente)

## Por qué “falta” el footer y otros arreglos

El paquete grande `CSS-COMPLETO-ASTRA.css` (footer, menú móvil, catálogo, círculos, etc.) quedó en la rama  
`cursor/jm-css-hero-contain-6a09` y **nunca se fusionó a `main`**.  
Por eso en agentes/PRs nuevos solo veías el CSS corto de círculos, no el footer que ya habíamos hecho.

## Archivos vigentes (copiar a WP → CSS adicional)

Pégalos **en este orden**, borrando antes el CSS JM viejo del cuadro:

| Orden | Archivo | Qué arregla |
|------|---------|-------------|
| 1 | `CSS-CIRCULOS-COLECCIONES.css` | Círculos categorías + Últimas/Novedades móvil (`VERSIÓN: 2026-07-19-v2`) |
| 2 | `CSS-FOOTER-JM.css` | Footer dorado completo (`VERSIÓN: 2026-07-19-footer`) |

Opcional (solo si lo necesitas y no choca): en la rama antigua está el menú móvil dentro de `CSS-COMPLETO-ASTRA.css` (sección `CSS-HOME-MENU-MOVIL`).

## No uses como “fuente única”

- `CSS-COMPLETO-ASTRA.css` de ramas viejas **mezclado** con el CSS nuevo (se pisan).
- Solo el footer mínimo negro de Astra por defecto (el de la captura con corona + JOYAS MERCURY sin columnas/WA).

## Elementor (clases)

- Círculos: `jm-circulos-categoria` · Overflow Visible  
- Últimas: ID `jm-ultimas-unidades` + `jm-home-ultimas`  
- Footer: contenedores con clases `jm-footer` / `jm-footer__*` según el HTML del footer D
