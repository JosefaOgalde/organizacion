# Impresoreando — contexto único (leer esto; no reexplorar el repo)

Negocio impresiones 3D · Instagram @impresoreando · socios **Josefa + Nicolás 50/50**.

## Archivos / API

| Qué | Dónde |
|-----|--------|
| UI panel | `index/clientes/impresoreando/panel/` → `panel.js` · `panel.css` · `index.html` |
| Logo | `identidad/logo-impresoreando.png` (wordmark proporción correcta) · ver `IDENTIDAD.md` · bump `?v=imp-logo-20260728` |
| Venta rápida | `…/panel/venta/` |
| Seed (repo) | `data/impresoreando-seed.json` |
| Live (gitignored) | `data/impresoreando-live.json` |
| API | `GET/POST /api/impresoreando` · `POST /api/impresoreando/venta` en `scripts/organizacion-server.js` |
| Arranque | `git pull` → `ABRIR-LARAVEL.bat` → `http://127.0.0.1:8000/…` (mismo flujo que el resto del repo). El bat corre `scripts/sync-impresoreando-seed-a-live.js` + `force-imp-fiados-012-013.js` para meter PED/productos nuevos del seed en el live local. Si no ves fiados: `node scripts/force-imp-fiados-012-013.js` y recarga Pedidos. |
| Landing | `http://127.0.0.1:8000/index/clientes/impresoreando/` · CTA **Resumen 50/50** · logo `identidad/logo-impresoreando.png` |
| Panel / Resumen | `http://127.0.0.1:8000/index/clientes/impresoreando/panel/?tab=resumen` |
| Catálogo IG | `…/impresoreando/catalogo/` · 1080×1350 · PDF `catalogo/export/catalogo-impresoreando.pdf` · `exportar-pngs.js` + `exportar-pdf.js` |
| Status correo | `scripts/impresoreando-status-diario.js` · `ENVIAR-STATUS-IMPRESOREANDO.bat` · lib `scripts/lib/smtp-send.js` |
| Sync → organizador | `node scripts/sync-impresoreando-pedidos-organizacion.js --also-respaldo` (también `ABRIR-LARAVEL.bat`). **1 tarea por PED activo** (`[IMP] PED-00n · …`); transferidos → completadas. **Fiados** → tarea `[IMP] Cobrar PED-00n · …` el día `fechaPagoEsperada`. **Madre siempre en fecha de hoy (Chile)**; subtareas finalizadas se quedan en el día de cierre. |

Tras cambiar UI: bump `?v=` de `panel.js` / `panel.css` en `panel/index.html`. Persistencia siempre vía API (live), no solo localStorage.

## Deuda / resumen

- Tab Resumen: vista **general** (totales, conteos, barras, socios). El **detalle de ventas** (IDs, ítems, descuentos, historial) solo en tab **Ventas**.
- Gastos de **ambos** (= sociedad 50/50); **hasta ahora los pagó todos Nicolás** (`pagadoPor`). Capital aportado por **Nicolás**; Josefa debe 50% (`meta.capital.deudaJosefaClp`).
- Compra 29 jul: **mueble esquinero EASY INTERNET $35.990** (`gas-mueble-esquinero-easy-35990`, TC ****7022 · Nicolás) + lote insumos (llaveros / filamento rosado / ganchos).
- Compra 31 jul ML: **bolsas kraft ×100 $4.590 + enchufe WiFi 16A $9.989 + tira LED RGB 20 m $17.990 = $32.569** (`gas-ml-bolsas-enchufe-led-32569` · Nicolás · 50/50).
- `metaRecuperar = gastos + operación`
- `saldoPendiente = max(0, meta − ventas)` — solo **ventas** bajan deuda
- `% progreso = ventas / meta`
- Barras UI: (1) progreso % · (2) gastos vs ventas · (3) **ventas + pedidos pendientes** (pipeline verde+azul; pedidos aún no bajan deuda) · muestra **% pipeline = (ventas+pedidos)/meta** (ej. $168.500 → ~16,9%)
- KPI pedidos activos = suma `montoNeto` de pedidos en `pendiente|listo|en_impresion`

## Pedidos (regla de oro)

1. Tab Pedidos · IDs `PED-001…` (`meta.pedidoSeq`) · arriba bloque **Fiados** (activos con `fiado`/`fechaPagoEsperada`, columna «Paga el» + total por cobrar); debajo el resto de pedidos
2. Por ítem: producto/SKU, cantidad, **costo/u**, **precio venta/u** (editable)
3. **Estado solo `<select>` a nivel pedido** — no badges / +imp / +listo en ítems
4. Estados: `pendiente` · `en_impresion` · `listo` · `transferido`
5. **Editar** = modal `#imp-modal-pedido`
6. **Transferir a venta** = modal `#imp-modal-transferir` con descuento **% o CLP** → venta `{ montoBruto, descuentoClp, montoNeto }` · `montoNeto` baja deuda · auto-`save()`
7. Pedidos no cuentan como venta hasta transferir
8. **«Pagado» = venta (obligatorio):** si la usuaria dice **pagado** / **ya pagó** / **cobrado** en un pedido Impresoreando → **no dejarlo como pedido activo**. Crear/actualizar el `PED-00n` y **transferirlo de inmediato** a venta `I00000n` (estado `transferido`). El monto pagado es el `montoNeto` de la venta.
9. **«Fiado» / paga más adelante (obligatorio):** si dice **fiado**, **paga el DD**, **cobra el DD**, **paga en agosto**, etc. → pedido **activo** (no venta aún) con `fiado: true` + `fechaPagoEsperada` (YYYY-MM-DD). **Crear tarea en el organizador** ese día: `[IMP] Cobrar PED-00n · Cliente · $monto` (`tipoEntregable: impresoreando-cobro`). Al transferir a venta (cuando pague) → completar esa tarea. Sync: `scripts/sync-impresoreando-pedidos-organizacion.js`.

### Seed vigente — pedidos

| ID | Cliente | Ítems | Estado |
|----|---------|-------|--------|
| PED-001 | Rebe SIE | 1× Porta lata Monster `PLMONS001` | **transferido** → I000007 $7.000 |
| PED-002 | Gianni SIE | 1× Macetero bulldog `MCPEBUL001` + 4× Portacompleto bulldog `PCPEBUL001` | **transferido** → I000002 $15.000 |
| PED-003 | Juan SIE | 1× Nave horizontal `NAVEHOR001` + 1× Nave vertical `NAVEVERT001` | **transferido** → I000003 $15.000 |
| PED-004 | Ele SIE | 2× Llavero Pesa Rusa amarillo `LLPESRU001` | **transferido** → I000014 $5.000 |
| PED-005 | María Paz SIE | 1× Soporte celular morado pastel `SOPCEL001` | **transferido** → I000011 $4.000 |
| PED-006 | Rebe SIE | 1× Dragón morado `DRAGON001` | **transferido** → I000013 $20.000 |
| PED-007 | Juan SIE | 1× Torreón `TORREON001` | **listo** · costo est. ~$3.293 (+$1.000 impresora antigua) · PVP sug. $6.500 |
| PED-008 | Juan MKOF | 1× Porta Bob Esponja `PTBOBES001` | **listo** · costo ~$998 · **PVP $7.000** |
| PED-009 | Rebe SIE | 1× Soporte celular negro `SOPCEL001` | **transferido** → I000012 $4.000 |
| PED-010 | Gianni SIE | 2× Soporte celular negro `SOPCEL001` | **pendiente** · fiado · **paga 2026-08-18** · $8.000 |
| PED-011 | Marcia SIE | 1× Soporte celular morado `SOPCEL001` | **transferido** → I000015 $3.000 |
| PED-012 | Marcia SIE | 1× Limpiador de brochas morado pastel `LMBROC001` | **pendiente** · fiado · $7.000 · fecha pago por confirmar |
| PED-013 | Mel MKOF | 1× Soporte celular negro `SOPCEL001` | **pendiente** · fiado · $4.000 · fecha pago por confirmar |
| PED-014 | Cata SIE | 3× Llavero One Piece `LLONEP001` | **pendiente** · fiado · **$5.000** total · costo **$300/u** · fecha pago por confirmar |

### Ventas — ID correlativo + historial

- Cada venta tiene `codigo` `I000001…` (`meta.ventaSeq`). **Primera registrada = I000001 · Tito MKOF**.
- Clientes históricos ya migrados (no re-etiquetar): Tito MKOF · Gianni/Juan/Cata/Marcia/Rebe SIE.
- `meta.clientesHistorial[]` agrupa compras repetidas. UI: tab Ventas + bloque Historial.
- **Filtro por cliente** (tab Ventas): select Cliente · Origen (SIE/MKOF) · buscar texto; clic en fila del historial filtra sus compras; muestra total filtrado.
- Al transferir / venta directa: `nextVentaCodigo` + `rebuildClientesHistorial`.

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
| I000011 | María Paz SIE | 4.000 | PED-005 Soporte celular morado pastel |
| I000012 | Rebe SIE | 4.000 | PED-009 Soporte celular negro |
| I000013 | Rebe SIE | 20.000 | PED-006 Dragón morado |
| I000014 | Ele SIE | 5.000 | PED-004 2× Llavero Pesa Rusa amarillo |
| I000015 | Marcia SIE | 3.000 | PED-011 Soporte celular morado |
| I000016 | Fabian MKOF | 7.000 | 1× Porta Bob Esponja |

### Clientes nuevos — nombre + origen (obligatorio)

**No** auto-agregar SIE a todo el mundo. La usuaria entrega **mínimo 2 parámetros**:

1. **Nombre** (siempre el primero) — puede incluir segundo nombre (ej. «María José»).
2. **Origen / dónde viene** (segundo parámetro):
   - **SIE** = trabajo de **Nicolás**
   - **MKOF** = trabajo de **Josefa**

Display: `Nombre [SegundoNombre] ORIGEN` → ej. `Rebe SIE`, `María José MKOF`.  
Campos pedido/venta: `clienteNombre`, `clienteSegundoNombre?`, `clienteOrigen` (`SIE`|`MKOF`) + `cliente` (string compuesto para historial).

## Flujos de chat (agente) — frases gatillo

### «pedidos e impresoreando» / «Pedidos - impresoreando»

Responder **pidiendo estos datos** (no crear a ciegas). Mínimo nombre + origen:

1. **Nombre** (y segundo nombre si hay)
2. **Origen:** SIE (Nico) o MKOF (Josefa)
3. **Ítems:** producto, cantidad, color/filamento
4. **Precio venta/u** o total (ajustable; puede ser más caro que el sugerido)
5. **Canal** (WhatsApp / Instagram / feria) — opcional
6. **Estado:** `pendiente` · `en_impresion` · `listo` (default `pendiente`) — **salvo que diga pagado** (ver abajo)

Reglas al crear:

- Si el producto **no tiene SKU** → generar con `siguienteSkuProducto` / prefijo legible (`LLSTANDL001`, etc.).
- Si el producto **no tiene costo calculado** → **pedir imagen** (slicer/foto) y crear producto en Costos antes de cerrar el pedido (o dejar pendiente de costo).
- Precio de venta se puede **subir a mano** aunque el markup sugerido sea +100%.
- Crear `PED-00n` en live/seed; estado visible en tab Pedidos **y en Resumen**.
- **«Pagado» = venta:** si en el mensaje aparece **pagado** / **ya pagó** / **cobrado** → transferir a venta `I00000n` al tiro (pedido `transferido`). No preguntar otra vez si ya lo dijo.
- **«Fiado» / paga el DD:** pedido activo con `fiado` + `fechaPagoEsperada` · **tarea organizador** el día de cobro (`[IMP] Cobrar PED-…`). No es venta hasta que pague.
- Si **no** dice pagado ni fiado → dejar como pedido (`pendiente`/`en_impresion`/`listo`) y **no** transferir hasta que lo indique.

### «calcular costo producto impresoreando»

Responder **pidiendo la imagen** (foto del producto / captura slicer) y, si no viene en la imagen:

- gramos de filamento · horas de impresión · tipo/color y $/kg (o usar tabla PLA+ negro/rojo $17.986, amarillo/café $16.829, blanco $12.690)
- **qué impresora:** «nueva»/Elegoo Centauri (default) o «antigua»/Ender 3 V2 Neo Sprite Neo (otro filamento)
- si lleva argolla metal (+$50) o bolsa

Calcular con la fórmula del panel y devolver costo/u + PVP sugerido (+margen 100% si no indican otro). Si es Ender, usar perfil `imp-ender-3-v2-neo` (recargo + consumo propios; $/kg del otro filamento si lo dan). Si no hay SKU, generarlo. Si piden guardar producto, crear/actualizar en Costos con `impresoraId`.

## Productos / costos

Calculadora en `?tab=costos`. Tarjeta compacta: nombre · SKU · costo · precio venta · Eliminar. Resto en `<details> Parámetros y desglose`.

**Fórmula:** `filamento = g/1000 × $/kg` + `luz = horas × tarifaKwh × consumoKw` + pintado + metal + bolsa (+ recargo perfil si aplica).  
**Markup sugerido:** `precio = costo × (1 + margenObjetivoPct/100)` (default +100%).  
**Params default (Centauri):** `tarifaKwhClp: 200`, `consumoImpresoraKw: 0.28`, `costoAnilloMetalLlaveroClp: 50`.  
**$/kg Centauri:** PLA+ negro/rojo `$17.986` · PLA amarillo/café `$16.829` · PLA blanco `$12.690`.  
**Diseños Cults/digitales** → gastos socios (categoría `diseño`); **no** van al costo unitario del producto.  
Vigente: Bob $1.402 · bulldog $1.000 · nave H $1.000 · **Dragón $3.000** (`gas-diseno-dragon`) · **Alcancía chanchito $13.000** (`gas-diseno-alcancia-chanchito`).

### Impresoras (perfiles de costo) — obligatorio recordar

**Alias de lenguaje (no negociar):**
- «impresora **antigua**» / «la vieja» / «Ender» → siempre `imp-ender-3-v2-neo` (**Creality Ender 3 V2 Neo · Sprite Neo**)
- «impresora **nueva**» / «la Elegoo» / «Centauri» → siempre `imp-centauri-carbon-2` (**Elegoo Centauri Carbon 2**)

Datos en `data.impresoras[]` (seed + live) y UI **Operación → Impresoras**. Cada producto puede tener `impresoraId`.

| id | Modelo | Extrusor | Alias usuaria |
|----|--------|----------|---------------|
| `imp-centauri-carbon-2` | **Elegoo** Centauri Carbon 2 | stock / multicolor | **Nueva** (default) · filamentos tabla arriba |
| `imp-ender-3-v2-neo` | Creality **Ender 3 V2 Neo** | **Sprite Neo (extrusión directa)** | **Antigua** · suele usar **otro filamento** |

**Antigua = Ender 3 V2 Neo (Sprite Neo):**
- Perfil guardado para cálculos cuando imprimen ahí (otro filamento).
- Defaults: consumo ~`0.16` kW · recargo fijo `$1.000` · `costoFilamentoDefaultKgClp` (definir en Operación cuando sepan el $/kg del rollo).
- Si el producto no trae `$/kg`, usa el default del perfil Ender.
- UI: Operación → **Guardar perfil Ender**; Costos → select Impresora; calculadora rápida también elige impresora.
- Ejemplo seed: `TORREON001` → `impresoraId: imp-ender-3-v2-neo`.

**Nueva = Elegoo Centauri Carbon 2:** default de costos salvo que digan antigua/Ender.

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
| `LLPESRU001` | Llavero Pesa Rusa | **16,78** | **0,59 (35 m 31 s)** | PLA amarillo · modelo 16,31 + purge 0,47 · +$50 argolla · costo ~$415 · PVP sug. ~$831 |
| `SOPCEL001` | Soporte celular | **34,46** | **0,96 (57 m 30 s)** | PLA morado pastel · costo ~$684 · **PVP $4.000** (manual) |
| `DRAGON001` | Dragón | **275,41** | **14,12 (14 h 7 m)** | PLA color · modelo+soportes · costo ~$5.476 · **PVP $20.000** · diseño comprado **$3.000** en gastos (no en costo/u) |
| `TORREON001` | Torreón | **~120** (est.) | **~4 h** (est.) | **Ender 3 V2 Neo (Sprite Neo)** · sin slicer · recargo perfil +$1.000 · costo ~$3.293 · PVP sug. $6.500 |
| `LMBROC001` | Limpiador de brochas | **114,05** | **3,47 (3 h 28 m)** | PLA morado pastel · Elegoo · modelo 113,58 + purge 0,47 · costo ~$2.163 · **PVP sug. $4.300** |
| `ALCHAN001` | Alcancía chanchito | **315,88** | **12,15 (12 h 9 m)** | PLA rosado `$10.990/kg` · Elegoo · modelo 280,74 + sop 33,75 + purge 1,40 · 105,06 m · costo ~$4.202 · **PVP sug. $8.400** · diseño comprado **$13.000** en gastos (no en costo/u) |
| `LLONEP001` | Llavero One Piece | — | — | **costo fijo $300/u** (acordado) · PVP ref. ~$2.000/u · PED-014 Cata 3× $5.000 |

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
2. Frase gatillo → **pedir nombre + origen (SIE/MKOF)** y el resto; no inventar ni auto-poner SIE.
3. Sin SKU → generar. Sin costo → pedir imagen y calcular producto.
4. Pedido en live/seed: `cliente` compuesto, ítems SKU×cant, costo/u, precio venta/u (ajustable), estado.
5. Estado del pedido debe verse en **Resumen** (tabla de status) y en Pedidos.
6. **Si dice pagado** → transferir ya: venta `I00000n` + historial + pedido `transferido` (baja deuda). **Si dice fiado / paga el DD** → pedido activo + `fechaPagoEsperada` + tarea cobro en organizador ese día. Si no dice pagado → no transferir.
7. Commit en rama `cursor/…`, bump `?v=` si tocó UI, push + actualizar PR.
8. Responder en español, corto: qué PED/I0…, qué SKUs, montos, estado, origen (y fecha de cobro si fiado).

## Layout UI (no rediseñar sin pedido)

Franja blanca superior full-bleed; contenido `--imp-max: 1200px`. Color ambar: border `#d4b06a` · bg `#faf6eb` · text `#7a5c28`.
