# Mi Carrito · landing completa

Wireframe Fase 2 con banner + contenido WooCommerce + footer E.

## Estructura

| Sección | Contenido |
|---------|-----------|
| Header | Logo, menú, carrito activo |
| Banner 1000×500 | Mi Carrito + visual bolsa/joyas |
| Cuerpo | Tabla productos **o** mensaje vacío |
| Sidebar | Resumen, total, finalizar compra |
| Confianza | Despacho, garantía, pago seguro |
| Footer E | Igual que inicio y colecciones |

## Estados

```
?estado=productos   → 2 productos + resumen (default)
?estado=vacio       → carrito vacío + CTA colecciones
```

## URLs (copiar tal cual)

```
http://localhost:3000/index/clientes/JoyasMercury/interfaces/mockups-carrito/wireframe-carrito-landing.html
http://localhost:3000/index/clientes/JoyasMercury/interfaces/mockups-carrito/wireframe-carrito-landing.html?estado=vacio
http://localhost:3000/index/clientes/JoyasMercury/interfaces/mockups-carrito/banner-carrito-landing.html
```

Ficha JM: `http://localhost:3000/index/clientes/joyasmercury/`

```bash
python3 scripts/capturar-jm-banner-carrito.py
```
