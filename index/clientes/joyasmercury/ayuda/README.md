# Página Ayuda · Joyas Mercury

## Nuevo texto: Grabación al recibir el pedido

Tarjeta con el texto de video al abrir el paquete (reclamaciones por faltantes).

## Cómo publicar en WordPress

1. Abrí `https://joyasmercury.cl/wp-admin/` → Páginas → **Ayuda** → Editar con Elementor.
2. Encontrá el widget **HTML** de la página (clases `jm-ayuda`).
3. Opción A — reemplazar todo el HTML por el de  
   `PAGINA-AYUDA-ELEMENTOR.html`
4. Opción B — pegar solo el bloque de  
   `SOLO-GRABACION-RECIBIR-PEDIDO.html`  
   después de la tarjeta «Políticas de envío».
5. Actualizar / Publicar.
6. Hard refresh en `https://joyasmercury.cl/ayuda/`

Los estilos ya están en `CSS-COMPLETO-ASTRA.css` (`.jm-ayuda-card`, etc.).

## Vista local

```
http://127.0.0.1:8000/index/clientes/joyasmercury/ayuda/PAGINA-AYUDA-ELEMENTOR.html
```
