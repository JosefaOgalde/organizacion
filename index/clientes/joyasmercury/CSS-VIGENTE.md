# Joyas Mercury — qué CSS pegar (vigente)

## Por qué “falta” el footer y otros arreglos

El paquete grande `CSS-COMPLETO-ASTRA.css` (footer, menú móvil, catálogo, círculos, etc.) quedó en la rama  
`cursor/jm-css-hero-contain-6a09` y **nunca se fusionó a `main`**.  
Por eso en agentes/PRs nuevos solo veías el CSS corto de círculos, no el footer que ya habíamos hecho.

## Opción A — CSS completo ← lo que pediste

Archivo: **`CSS-COMPLETO-ASTRA.css`** (`VERSIÓN: 2026-07-25-novedades-mobile-2x2`)

Incluye catálogo, círculos, home, **footer dorado**, menú móvil, producto single, **Novedades mobile 2×2**, etc.

1. Abrí ese archivo en esta rama
2. WP → CSS adicional → **borra** lo JM viejo → pega **todo** → Publicar

Si solo faltaba el arreglo mobile y ya tenés el completo viejo: pegá al final  
`CSS-NOVEDADES-MOBILE-2x2.css`.

**Urgente carrito (Camila):** pegá al final `CSS-CARRITO-BOTON-FIX.css` · guía [FIX-CARRITO-AHORA.md](FIX-CARRITO-AHORA.md).

Ver también: [CONTINUAR-JM.md](CONTINUAR-JM.md).

## Opción B — piezas sueltas

| Orden | Archivo | Qué arregla |
|------|---------|-------------|
| 1 | `CSS-CIRCULOS-COLECCIONES.css` | Círculos + carrusel productos visibles (`2026-07-19-v9`) |
| 2 | `CSS-FOOTER-JM.css` | Solo footer (`2026-07-19-footer`) |

## No mezclar

No pegues el completo **y** las piezas sueltas a la vez (se pisan). Elige A **o** B.

## Elementor (clases)

- Círculos: `jm-circulos-categoria` · Overflow Visible  
- Últimas: ID `jm-ultimas-unidades` + `jm-home-ultimas`  
- Footer: contenedores con clases `jm-footer` / `jm-footer__*` según el HTML del footer D
