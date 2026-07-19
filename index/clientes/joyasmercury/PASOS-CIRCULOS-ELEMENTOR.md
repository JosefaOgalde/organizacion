# Joyas Mercury — círculos Colecciones + productos en móvil

Esto se arregla en **WordPress (Elementor + CSS adicional)**, no en la maqueta local.

Ver lista completa: **`CSS-VIGENTE.md`**.

**CSS vigente (pegar en este orden):**
1. `CSS-CIRCULOS-COLECCIONES.css` → `VERSIÓN: 2026-07-19-v2`
2. `CSS-FOOTER-JM.css` → `VERSIÓN: 2026-07-19-footer` (footer dorado que ya habíamos hecho)

El footer vivía solo en la rama `jm-css-hero-contain` y no estaba en `main`; por eso “faltaba”. Ya está recuperado en `CSS-FOOTER-JM.css`.

## 1) Pegar el CSS (reemplazar, no acumular)

1. Abre `CSS-CIRCULOS-COLECCIONES.css` (esta carpeta) o la rama `cursor/jm-css-circulos-elementor-fb61`.
2. En WP: **Apariencia → Personalizar → CSS adicional**.
3. **Borra** el CSS JM viejo que ya esté ahí (si dejas los dos, gana el antiguo).
4. Pega TODO el archivo nuevo → **Publicar**.
5. En el celular: Ctrl+Shift+R (o ventana privada).

## 2) Elementor — círculos de categorías

Aplica la clase en **ambos** sitios:

- Inicio: 3 círculos Esencial / Gold / Deluxe  
- Página de colección (Esencial, Gold, Deluxe): 5 círculos Pulseras / Conjuntos / Cadenas / Anillos / Aros  

1. Selecciona el **contenedor** que agrupa esos círculos  
2. **Avanzado → Clases CSS:** `jm-circulos-categoria`  
3. En cada imagen hija:
   - Tamaño: **Completo** o **Miniatura**
   - **No** “Personalizado 350px”
4. En el contenedor: **Overflow = Visible** (si Elementor lo tiene en Oculto, corta los círculos)

Opcional (borde de color): `jm-circulos-esencial` · `jm-circulos-gold` · `jm-circulos-deluxe`

## 3) Elementor — Últimas unidades (que se vean todos en móvil)

En el widget de productos **Últimas unidades**:

1. **Avanzado → CSS ID:** `jm-ultimas-unidades`
2. **Avanzado → Clases CSS:** `jm-home-ultimas`
3. En el widget UAEL/Woo: desactiva carrusel/flechas si puedes (el CSS también las oculta)
4. Revisa **Responsive** (ícono móvil): que ningún producto/columna esté en “Ocultar en móvil”

## 4) Novedades (scroll lateral en móvil)

Clase CSS del widget: `jm-home-novedades`

En móvil debe poder deslizarse de lado (carrusel / swipe). No es grilla 2×2.
Dejá el slider UAEL activo (flechas/dots visibles). Si no hay slick, el CSS habilita scroll nativo.

## Checklist rápido

| Problema | Dónde | Qué hacer |
|----------|--------|-----------|
| Fotos cuadradas en Colecciones | Elementor + CSS | Clase `jm-circulos-categoria` + CSS pegado |
| Faltan productos en móvil | Elementor widget | ID `jm-ultimas-unidades` + clase `jm-home-ultimas` + no ocultar en móvil |
| Novedades sin scroll lateral | CSS + Elementor | Clase `jm-home-novedades` + CSS `novedades-scroll`; slider UAEL ON |

Tras guardar: Ctrl+Shift+R en el celular / DevTools móvil.
