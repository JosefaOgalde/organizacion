# Wireframe inicio — Joyas Mercury Fase 2

Wireframe HTML completo del **Inicio** propuesto para joyasmercury.cl.

## Abrir interactivo

Con `npx serve .` desde la raíz del repo:

```
http://localhost:3000/index/clientes/JoyasMercury/interfaces/mockups-inicio/wireframe-inicio.html
```

## Secciones (de arriba hacia abajo)

| # | Sección | ID / nota |
|---|---------|-----------|
| 1 | Header · logo centrado + búsqueda + carrito | Sticky |
| 2 | Menú horizontal (solo desktop) | Inicio · Colecciones · Historias · Cuenta · Contacto · Carrito |
| 3 | Carrusel banner principal | Smart Slider 1920×600 |
| 4 | Barra de valor | Envíos · garantía · colecciones |
| 5 | Círculos colección | `#categorias-destacadas` |
| 6 | Novedades / destacados | Grilla productos WC |
| 7 | Últimas unidades | Scroll horizontal móvil |
| 8 | Historias que Brillan | Teaser reseñas |
| 9 | Footer dorado | Legales · newsletter · redes |
| 10 | WhatsApp flotante | Verde oficial |
| 11 | Nav inferior móvil | WP Bottom Menu |

## Capturas PNG

Regenerar:

```bash
pip install playwright
python3 -m playwright install chromium
python3 scripts/capturar-jm-wireframe-inicio.py
```

| Archivo | Viewport |
|---------|----------|
| `jm-inicio-wireframe-mobile.png` | 390px · full page |
| `jm-inicio-wireframe-desktop.png` | 1440px · full page |

Las mismas imágenes aparecen en la ficha **Nuevo prototipo** → `/index/clientes/joyasmercury/`.
