# Interfaces actuales — Joyas Mercury

Documentación visual del **estado actual** del sitio (jun 2026). Referencia para auditoría y rediseño en **Inicio v2**.

**Agente:** `@joyas-mercury`  
**Inventario JSON:** [site-inventory.json](site-inventory.json)

---

## Mapa de imágenes

| # | Archivo | Qué muestra |
|---|---------|-------------|
| 01 | `01-arquitectura-sitio-1080x1080.png` | Stack WP + páginas + prod vs copia |
| 02 | `02-home-produccion-desktop-1080x1080.png` | Home en vivo (desktop) |
| 03 | `03-home-produccion-mobile-1080x1080.png` | Home en vivo (móvil + bottom menu) |
| 04 | `04-menu-hamburguesa-actual-1080x1080.png` | Menú hamburguesa problemático |
| 05 | `05-wp-admin-paginas-1080x1080.png` | Listado páginas WP Admin |
| 06 | `06-elementor-inicio-v2-1080x1080.png` | Secciones Elementor Inicio v2 |
| 07 | `07-landing-esencial-1080x1080.png` | Landing colección Esencial |
| 08 | `08-woocommerce-carrito-1080x1080.png` | Página Mi Carrito |
| 09 | `09-astra-cabecera-3-filas-1080x1080.png` | Cabecera Astra (3 filas) |
| 10 | `10-flujo-actual-vs-objetivo-1080x1080.png` | Flujo usuario actual vs objetivo |

---

## Dos mundos

| | Producción | Copia trabajo |
|---|------------|---------------|
| **URL** | joyasmercury.cl | Inicio v2 (borrador) |
| **Página** | Inicio (post 4387) | Inicio v2 + Elementor |
| **Editar** | No tocar | Editar con Elementor |

---

## Problemas documentados (menú / home)

1. Categorías repetidas en hamburguesa  
2. Bloques con conteo de productos en home  
3. Destacados como ítem de menú (debe ir solo en Inicio)  
4. Franja negra «Encima de cabecera» en móvil  
5. Landings colección desconectadas del menú  

---

## Regenerar imágenes

```bash
python3 scripts/generar-jm-interfaces-actuales.py
```

---

## Links locales (`npx serve .`)

```
http://localhost:3000/index/clientes/JoyasMercury/interfaces/README.md
http://localhost:3000/index/clientes/JoyasMercury/interfaces/01-arquitectura-sitio-1080x1080.png
```
