# Impresoreando — contexto único (leer esto; no reexplorar el repo)

Negocio impresiones 3D · Instagram @impresoreando · socios **Josefa + Nicolás 50/50**.

## Archivos / API

| Qué | Dónde |
|-----|--------|
| UI panel | `index/clientes/impresoreando/panel/` → `panel.js` · `panel.css` · `index.html` |
| Logo | `index/clientes/impresoreando/identidad/logo-impresoreando.png` (+ `.svg`) |
| Venta rápida | `…/panel/venta/` |
| Seed (repo) | `data/impresoreando-seed.json` |
| Live (gitignored) | `data/impresoreando-live.json` |
| API | `GET/POST /api/impresoreando` · `POST /api/impresoreando/venta` en `scripts/organizacion-server.js` |
| Arranque | `ABRIR-IMPRESOREANDO.bat` / `SERVIR.bat` → `http://localhost:3000/index/clientes/impresoreando/panel/` |
| Landing | `…/impresoreando/` CTA **Resumen 50/50** |
| Status correo | `scripts/impresoreando-status-diario.js` · `ENVIAR-STATUS-IMPRESOREANDO.bat` · lib `scripts/lib/smtp-send.js` |

Tras cambiar UI: bump `?v=` de `panel.js` / `panel.css` en `panel/index.html`. Persistencia siempre vía API (live), no solo localStorage.

## Deuda / resumen

- Gastos de **ambos**; capital aportado por **Nicolás**; Josefa debe 50% (`meta.capital.deudaJosefaClp`).
- `metaRecuperar = gastos + operación`
- `saldoPendiente = max(0, meta − ventas)` — solo **ventas** bajan deuda
- `% progreso = ventas / meta`
- Barras UI: (1) progreso % · (2) gastos vs ventas · (3) **gastos + pedidos activos** (pipeline azul; pedidos **no** bajan deuda)
- KPI pedidos activos = suma `montoNeto` de pedidos en `pendiente|listo|en_impresion`

## Pedidos (regla de oro)

1. Tab Pedidos · IDs `PED-001…` (`meta.pedidoSeq`)
2. Por ítem: producto/SKU, cantidad, **costo/u**, **precio venta/u** (editable)
3. **Estado solo `<select>` a nivel pedido** — no badges / +imp / +listo en ítems
4. Estados: `pendiente` · `en_impresion` · `listo` · `transferido`
5. **Editar** = modal `#imp-modal-pedido`
6. **Transferir a venta** = modal `#imp-modal-transferir` con descuento **% o CLP** → venta `{ montoBruto, descuentoClp, montoNeto }` · `montoNeto` baja deuda · auto-`save()`
7. Pedidos no cuentan como venta hasta transferir

### Seed vigente

| ID | Cliente | Ítems | Estado |
|----|---------|-------|--------|
| PED-001 | Rebe | 1× Porta lata Monster `PLMONS001` | listo |
| PED-002 | Gianni | 1× Macetero bulldog `MCPERROBU001` + 4× Portacompleto bulldog `PCPERROBU001` | en_impresion |

## Productos / costos

Calculadora en `?tab=costos`. Tarjeta compacta: nombre · SKU · costo · precio venta · Eliminar. Resto en `<details> Parámetros y desglose`.

**Fórmula:** `filamento = g/1000 × $/kg` + `luz = horas × tarifaKwh × consumoKw` + pintado + metal + bolsa.  
**Markup sugerido:** `precio = costo × (1 + margenObjetivoPct/100)` (default +100%).  
**Params default:** `tarifaKwhClp: 200`, `consumoImpresoraKw: 0.28`, impresora Centauri Carbon 2.  
**PLA+ negro:** `$17.986/kg` constante `COSTO_PLA_NEGRO_KG` (migrar si quedó `$12.690` amarillo).

### SKUs clave (seed / `asegurarProducto*`)

| SKU | Producto | g | h | Notas |
|-----|----------|---|---|-------|
| `PCGATO001` | Portacompletos gato | ~110 | — | |
| `PCPERRO001` | Portacompletos perro | ~132 | — | |
| `PLMONS001` | Porta lata Monster PLA negro | 144,45 | 3,42 | modelo 135,55 + sop 8,43 + purge 0,47 |
| `MCPERROBU001` | Macetero perro bulldog | 96,95 | 3,35 (3 h 21 m) | |
| `PCPERROBU001` | Portacompleto perro bulldog | **64,58** | **2,22 (2 h 13 m)** | Vigente = costo **más alto** vs anterior 61,35 g / 2 h 1 m. Costo ~$1.336/u · PVP sugerido ~$2.672 |

Funciones seed en `panel.js`: `asegurarProductoPortacompletosGato|Perro|PortaLataMonster|MaceteroPerroBulldog|PortacompletoPerroBulldog`.

## Status diario por correo

```bat
node scripts/impresoreando-status-diario.js
node scripts/impresoreando-status-diario.js --dry-run
ENVIAR-STATUS-IMPRESOREANDO.bat
```

- Destino default: `romerosilvanicolas@gmail.com` + `josefa.ogalde@gmail.com`
- `.env`: `MAIL_USER` · `MAIL_PASS` (App Password Gmail) · `MAIL_FROM` · `STATUS_TO`
- Dry-run → `data/impresoreando-status-ultimo.html`
- Programar el `.bat` en el Programador de tareas de Windows (aún no envía solo sin eso)

## Celular / red

`localhost` en el teléfono **no** funciona. Server `HOST=0.0.0.0`. Misma WiFi → IP de `GET /api/acceso` → `lan[]`. Fuera → `ABRIR-VENTA-PUBLICA.bat` (loca.lt) con `SERVIR.bat` abierto.

## RFID handheld (tarjetas) — vigente

Adaptador del taller = **escritor RFID de mano a pila**, no programador ESP32. No usa COM/Arduino.  
Detalle y flujo Read/Write: `docs/impresoreando/RFID-HANDHELD.md`.  
Link pedido: https://a.aliexpress.com/_mKBSVtD

## ESP32-CAM (cámara taller) — aparte

Solo si hay módulo CAM + base USB/CH340. Guía: `docs/impresoreando/ESP32-CAM.md`. Sketch: `index/clientes/impresoreando/esp32-cam/CameraImpresoreando/`. **No** es el handheld RFID.

## Cómo atender un pedido nuevo (checklist agente)

1. Leer **este archivo** (no explorar panel.js salvo bug concreto).
2. Si el producto no existe: crear/actualizar vía seed en `asegurarProducto*` + parámetros slicer (g, h, $/kg) · preferir **costo más alto** si hay dos mediciones.
3. Añadir/editar pedido en live (API) o seed si debe quedar en repo: cliente, ítems SKU×cant, costo/u, precio venta/u, estado pedido.
4. No inventar tipografía Midjourney/Gemini: esto es panel ops, no prompts creativos.
5. Commit en rama `cursor/…-d733`, bump `?v=` si tocó UI, push + actualizar PR.
6. Responder en español, corto: qué PED, qué SKUs, montos, estado.

## Layout UI (no rediseñar sin pedido)

Franja blanca superior full-bleed; contenido `--imp-max: 1200px`. Color ambar: border `#d4b06a` · bg `#faf6eb` · text `#7a5c28`.
