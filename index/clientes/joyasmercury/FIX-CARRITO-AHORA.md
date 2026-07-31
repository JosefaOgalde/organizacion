# FIX YA — Botón carrito (pedido Camila 25-jul)

## Qué dijo Camila
1. El botón del carrito (arriba / al costado) **no funciona**: al pincharlo se esconde / se tira hacia adentro.
2. Cuando abre, **se abre y se cierra** y se ve como la **página antigua**.

## Causa
En móvil Astra pone `pointer-events: none` en el enlace del carrito (para usar un drawer lateral). Ese drawer falla / se ve genérico (“antiguo”). La página buena es:

`https://joyasmercury.cl/mi-carrito/`

## Qué hacer AHORA (en orden)

### 1) Pegar CSS (rápido)
1. Abrí el archivo `CSS-CARRITO-BOTON-FIX.css` (o el completo `CSS-COMPLETO-ASTRA.css` versión `carrito-boton`).
2. WP Admin → **Apariencia → Personalizar → CSS adicional**
3. Si pegás solo el fix: **al final** del CSS actual.
4. Si pegás el completo: **borrá** el CSS JM viejo y pegá todo.
5. **Publicar**.
6. Celular: Ctrl+Shift+R / borrar caché.

### 2) Ajuste Astra (recomendado, 1 minuto)
1. WP → **Apariencia → Personalizar → Header Builder** (o WooCommerce → Cart)
2. Clic en el elemento **Cart / Carrito**
3. Tipo de carrito / Cart click action → **Cart Page** (página del carrito), **no Flyout**
4. Publicar

Así el icono va directo a `/mi-carrito/` sin el panel que se abre/cierra.

### 3) Si aún falla — pegar JS
Archivo: `JS-CARRITO-IR-A-PAGINA.js`  
Pegalo en el footer del sitio (WPCode / plugin de headers-footers).

### 4) Verificar WooCommerce
WP → **WooCommerce → Ajustes → Avanzado → Configuración de página**  
- Página del carrito = **Mi Carrito**  
- Guardar. Luego **Ajustes → Enlaces permanentes → Guardar** (sin cambiar nada).

## Prueba
1. Celular → joyasmercury.cl  
2. Tocá el icono carrito arriba a la derecha  
3. Debe abrir `…/mi-carrito/` (o un drawer dorado JM estable)  
4. Agregá un producto y repetí
