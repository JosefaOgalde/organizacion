# Joyas Mercury — círculos Colecciones + productos en móvil

Esto se arregla en **WordPress (Elementor + CSS adicional)**, no en la maqueta local.

## 1) Pegar el CSS

1. Abre `CSS-CIRCULOS-COLECCIONES.css` (esta carpeta).
2. Copia TODO el contenido.
3. WP Admin → **Apariencia → Personalizar → CSS adicional** → pegar → Publicar.

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

## 4) Novedades (si también faltan en móvil)

Clase CSS del widget: `jm-home-novedades`

## Checklist rápido

| Problema | Dónde | Qué hacer |
|----------|--------|-----------|
| Fotos cuadradas en Colecciones | Elementor + CSS | Clase `jm-circulos-categoria` + CSS pegado |
| Faltan productos en móvil | Elementor widget | ID `jm-ultimas-unidades` + clase `jm-home-ultimas` + no ocultar en móvil |
| Solo se ve 1 producto (carrusel) | Elementor UAEL | Apagar slider o dejar el CSS (fuerza grid 2×2) |

Tras guardar: Ctrl+Shift+R en el celular / DevTools móvil.
