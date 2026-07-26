# Impresoreando — contexto único (leer esto; no reexplorar el repo)

Negocio impresiones 3D · Instagram @impresoreando · socios **Josefa + Nicolás 50/50**.

## Archivos / API

| Qué | Dónde |
|-----|--------|
| UI panel | `index/clientes/impresoreando/panel/` → `panel.js` · `panel.css` · `index.html` |
| Logo | `index/clientes/impresoreando/identidad/logo-impresoreando.png` (+ `.svg`) · ícono `icono-gato-impresoreando.svg` · ver `IDENTIDAD.md` |
| Venta rápida | `…/panel/venta/` |
| Seed (repo) | `data/impresoreando-seed.json` |
| Live (gitignored) | `data/impresoreando-live.json` |
| API | `GET/POST /api/impresoreando` · `POST /api/impresoreando/venta` en `scripts/organizacion-server.js` |
| Arranque | `ABRIR-IMPRESOREANDO.bat` → **solo landing** `…/impresoreando/` (panel/catálogo desde botones). Logo: `identidad/logo-impresoreando.png` |
| Landing | `…/impresoreando/` CTA **Resumen 50/50** |
| Catálogo IG | `…/impresoreando/catalogo/` · 1080×1350 · PDF `catalogo/export/catalogo-impresoreando.pdf` · `exportar-pngs.js` + `exportar-pdf.js` |
| Status correo | `scripts/impresoreando-status-diario.js` · `ENVIAR-STATUS-IMPRESOREANDO.bat` · lib `scripts/lib/smtp-send.js` |
| Sync → organizador | `node scripts/sync-impresoreando-pedidos-organizacion.js --also-respaldo` (también lo corre `ABRIR-LARAVEL.bat`) |

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

### Seed vigente — pedidos

| ID | Cliente | Ítems | Estado |
|----|---------|-------|--------|
| PED-001 | Rebe SIE | 1× Porta lata Monster `PLMONS001` | **transferido** → I000007 $7.000 |
| PED-002 | Gianni SIE | 1× Macetero bulldog `MCPEBUL001` + 4× Portacompleto bulldog `PCPEBUL001` | **transferido** → I000002 $15.000 |
| PED-003 | Juan SIE | 1× Nave horizontal `NAVEHOR001` + 1× Nave vertical `NAVEVERT001` | **transferido** → I000003 $15.000 |

### Ventas — ID correlativo + historial

- Cada venta tiene `codigo` `I000001…` (`meta.ventaSeq`). **Primera registrada = I000001 · Tito MKOF**.
- Nombres de cliente: Tito = **Tito MKOF**; todos los demás llevan sufijo **SIE** (Rebe SIE, Marcia SIE, Cata SIE, …).
- `meta.clientesHistorial[]` agrupa compras repetidas (cliente, códigos, total, #compras). UI: tab Ventas → tabla + bloque Historial por cliente.
- Al transferir pedido → venta o al crear venta directa: asignar `nextVentaCodigo` + `rebuildClientesHistorial`.

| Código | Cliente | Monto | Notas |
|--------|---------|-------|-------|
| I000001 | Tito MKOF | 15.000 | Portacompletos ×6 |
| I000002 | Gianni SIE | 15.000 | PED-002 bulldogs |
| I000003 | Juan SIE | 15.000 | PED-003 naves |
| I000004 | Cata SIE | 10.000 | 4× gatos |
| I000005 | Marcia SIE | 3.000 | 1× Stanley |
| I000006 | Gianni SIE | 7.000 | Bob |
| I000007 | Rebe SIE | 7.000 | PED-001 Monster |
| I000008 | Rebe SIE | 6.000 | 2× Stanley rojo / círculo blanco |
| I000009 | Marcia SIE | 3.000 | Soporte celular PLA blanco |
| I000010 | Cata SIE | 7.000 | Bob (costo ya calculado) |

## Flujos de chat (agente) — frases gatillo

### «pedidos e impresoreando» / «pedido impresoreando»

Responder **pidiendo estos datos** (no crear a ciegas):

1. **Cliente** (nombre + sufijo: MKOF solo Tito; resto **SIE**)
2. **Ítems:** producto/SKU, cantidad, color/filamento
3. **Precio venta/u** o total cobrado CLP
4. **Canal** (WhatsApp / Instagram / feria)
5. **Estado** deseado: `pendiente` · `en_impresion` · `listo` (default `pendiente`)

Con eso: crear pedido `PED-00n` en live/seed + panel (tab Pedidos), con ítems y estado. No transferir a venta hasta que la usuaria lo diga.

### «calcular costo producto impresoreando»

Responder **pidiendo la imagen** (foto del producto / captura slicer) y, si no viene en la imagen:

- gramos de filamento · horas de impresión · tipo/color y $/kg (o usar tabla PLA+ negro/rojo $17.986, amarillo/café $16.829, blanco $12.690)
- si lleva argolla metal (+$50) o bolsa

Calcular con la fórmula del panel y devolver costo/u + PVP sugerido (+margen 100% si no indican otro). Si piden guardar producto, crear/actualizar en Costos.

## Productos / costos

Calculadora en `?tab=costos`. Tarjeta compacta: nombre · SKU · costo · precio venta · Eliminar. Resto en `<details> Parámetros y desglose`.

**Fórmula:** `filamento = g/1000 × $/kg` + `luz = horas × tarifaKwh × consumoKw` + pintado + metal + bolsa.  
**Markup sugerido:** `precio = costo × (1 + margenObjetivoPct/100)` (default +100%).  
**Params default:** `tarifaKwhClp: 200`, `consumoImpresoraKw: 0.28`, impresora Centauri Carbon 2, `costoAnilloMetalLlaveroClp: 50`.  
**$/kg:** PLA+ negro/rojo `$17.986` · PLA amarillo/café `$16.829` · PLA blanco `$12.690`.  
**Diseños Cults/digitales** → gastos socios (categoría `diseño`); **no** van al costo unitario del producto.

### SKUs clave (seed / `asegurarProducto*`)

| SKU | Producto | g | h | Notas |
|-----|----------|---|---|-------|
| `PCGATO001` | Portacompletos gato | ~110 | — | |
| `PCPERRO001` | Portacompletos perro | ~132 | — | |
| `PLMONS001` | Porta lata Monster PLA negro | 144,45 | 3,42 | modelo 135,55 + sop 8,43 + purge 0,47 |
| `MCPEBUL001` | Macetero Perro Bulldog | 96,95 | 3,35 (3 h 21 m) | alias viejo `MCPERROBU001` |
| `PCPEBUL001` | Porta Completo Perro Bulldog | **64,58** | **2,22 (2 h 13 m)** | Vigente = costo **más alto** vs anterior 61,35 g / 2 h 1 m. Costo ~$1.336/u · PVP sugerido ~$2.672 · alias `PCPERROBU001` |
| `PTBOBES001` | Porta Bob Esponja (armado) | **54,30** | **1,60** | Soft seed: ediciones locales de g/h/$ no se pisan. Alias `PTBOBESP001`. Cults en gastos. |
| `NAVEHOR001` | Nave Espacial Horizontal | 40,91 | 1,40 (1 h 24 m) | PLA blanco · ~$648 · PVP ~$1.295 · alias `NVESPHOR001` |
| `NAVEVERT001` | Nave Espacial Vertical | 59,79 | 1,90 (1 h 54 m) | PLA blanco · ~$915 · PVP ~$1.830 · alias `NVESPVER001` |
| `LLRANGER001` | Llavero Escudo Ranger | 10,06 | 0,73 | Multicolor + $50 argolla · ~$315 · PVP ~$629 · alias `LLAVRANGER001` |
| `LLSTANDL001` | Llavero Porta Lipstick Stanley | 26,32 | 0,78 | Placa÷2 + $50 argolla · ~$478 · PVP ~$955 · alias `LLAVSTAN001` |

**Resumen 50/50:** la tabla «Costos de producto» usa el mismo costo/precio que Costos producto (precio manual si hay; si no, +margen). Al guardar un producto se marca `editadoLocal` y se refresca el resumen.

Funciones seed en `panel.js`: `asegurarProductoPortacompletosGato|Perro|PortaLataMonster|MaceteroPerroBulldog|PortacompletoPerroBulldog|PortaBobEsponja|NaveEspacialHorizontal|NaveEspacialVertical|LlaveroEscudoRanger|LlaveroPortaLipstickStanley` + `asegurarGastosDisenosCults` + `asegurarPedidosImpresosYNaves`.

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
2. Si la usuaria solo escribió la frase gatillo («pedidos e impresoreando» / «calcular costo…»), **pedir los datos** listados arriba; no inventar.
3. Si el producto no existe: crear/actualizar vía seed en `asegurarProducto*` + parámetros slicer (g, h, $/kg) · preferir **costo más alto** si hay dos mediciones.
4. Añadir/editar pedido en live (API) o seed si debe quedar en repo: cliente (+ SIE/MKOF), ítems SKU×cant, costo/u, precio venta/u, estado pedido.
5. Al pasar a venta: asignar `I00000n` correlativo y actualizar historial de cliente.
6. No inventar tipografía Midjourney/Gemini: esto es panel ops, no prompts creativos.
7. Commit en rama `cursor/…`, bump `?v=` si tocó UI, push + actualizar PR.
8. Responder en español, corto: qué PED/I0…, qué SKUs, montos, estado.

## Layout UI (no rediseñar sin pedido)

Franja blanca superior full-bleed; contenido `--imp-max: 1200px`. Color ambar: border `#d4b06a` · bg `#faf6eb` · text `#7a5c28`.
