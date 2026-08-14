# PRISA · pendiente (retomar)

**Fecha guardado:** 2026-08-14  
**Estado:** maqueta HTML lista; faltan textos/datos finales del cliente.

## Archivos
- `tabla-cobertura.html` — tabla ZONA / REGION / ZONA DE DESPACHO / DESPACHO POR COMUNA + acordeones (comunas / días hábiles) + notas Tarifas/Plazos
- `prototipo-prisa.html` — shell páginas Cobertura + Retira cliente
- Figma: https://www.figma.com/proto/qtDdatao4Vi4YY828rIYuH/prototipo_-prisa

## URL local
http://127.0.0.1:8000/index/clientes/MKOF/prisa/tabla-cobertura.html

## Cuando vuelvan los textos
Completar / reemplazar en `tabla-cobertura.html`:
1. Objeto `DETALLE` (títulos de región + comunas + días por zona de despacho; hoy solo ANTOFAGASTA/ARICA con datos del mock).
2. Filas de la tabla si cambian ZONA / REGION reales (hoy el mock repite «zonas norte» / «Arica y Parinacota»).
3. Cualquier copy extra del HTML completo (`prototipo-prisa.html`).
4. Validar títulos del acordeón (en Figma el panel de ANTOFAGASTA dice «XV Region de Arica» — probable placeholder).
