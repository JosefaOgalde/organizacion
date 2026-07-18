# Impresoreando — Panel socios + ecommerce ops

> **Agentes / pedidos:** leer primero [`docs/impresoreando/CONTEXTO.md`](../../../docs/impresoreando/CONTEXTO.md) (contexto unificado; no reexplorar el repo).

Negocio de **impresiones 3D** (Instagram: **@impresoreando**). Sociedad **50/50**.

## Color (único)

| Key | border | bg | text |
|-----|--------|-----|------|
| `ambar` | `#d4b06a` | `#faf6eb` | `#7a5c28` |

## Panel (gastos, ventas, luz, costos, ads)

URL local:

```
http://localhost:3000/index/clientes/impresoreando/panel/
```

Incluye:

- Gastos cargados: orden **#312435** (total pagado **$652.290**) + AliExpress placa/torno (**$30.000** c/u) + cajas Líder (**$20.000**)
- Resumen **50/50**
- Pedidos (ID correlativo PED-001…; no contabilizan hasta transferir a venta)
- Ventas (solo estas bajan la deuda)
- Operación / luz / parámetros (Elegoo Centauri Carbon 2 · tarifa Chile ~$200/kWh · 0,28 kW promedio)
- Costos de producto (filamento, horas impresión, pintado, metal llavero, bolsa)
- Plan paid de bajo presupuesto (~$30.000/mes)
- Bitácora compartida

Los datos se guardan en disco vía API:

- Seed (repo): `data/impresoreando-seed.json`
- Live (no git): `data/impresoreando-live.json`
- API: `GET/POST /api/impresoreando`

## Comandos Windows

En `C:\Users\Josefa Ogalde\organizacion` (con comillas por el espacio):

```bat
cd /d "C:\Users\Josefa Ogalde\organizacion"
git checkout cursor/impresoreando-6a09
ABRIR-IMPRESOREANDO.bat
```

O:

```bat
node scripts\organizacion-server.js
```

Abre:

| Qué | URL |
|-----|-----|
| Panel socios | http://localhost:3000/index/clientes/impresoreando/panel/ |
| Calculadora de productos | http://localhost:3000/index/clientes/impresoreando/panel/?tab=costos |
| Landing | http://localhost:3000/index/clientes/impresoreando/ |
| Portal | http://localhost:3000/index/clientes/ |

## Que tu socio vea y edite (online)

Por defecto el servidor solo escucha en esta PC (`127.0.0.1`).

### Opción A — misma red Wi‑Fi (casa/taller)

1. Cierra el servidor si está corriendo.
2. Arráncalo expuesto a la red:

```bat
set HOST=0.0.0.0
node scripts\organizacion-server.js
```

3. En tu PC: `ipconfig` → anota la IPv4 (ej. `192.168.1.20`).
4. Comparte a tu socio:

```
http://192.168.1.20:3000/index/clientes/impresoreando/panel/
```

5. Cada uno edita → **Guardar online** → el otro pulsa **Recargar**.

### Opción B — link público temporal (fuera de casa)

Con el servidor en `:3000`, en otra consola:

```bat
npx cloudflared tunnel --url http://localhost:3000
```

Comparte la URL `https://….trycloudflare.com/index/clientes/impresoreando/panel/`.

> Tip: ambos deben pulsar **Guardar online** tras editar. Si no, los cambios quedan solo en el navegador de esa persona.

## Status diario por correo (Josefa + Nicolás)

Cada día se puede enviar un resumen a:

- `romerosilvanicolas@gmail.com`
- `josefa.ogalde@gmail.com`

Incluye: **pedidos y estados**, **ventas entregadas/contabilizadas**, y **cuánto % falta para salir de números rojos** (saldo = gastos + operación − ventas).

### Configurar una vez

1. Copia `.env.example` → `.env` (si aún no existe).
2. En Gmail (la cuenta que **envía**): Seguridad → verificación en 2 pasos → **Contraseñas de aplicaciones** → crea una para “Correo”.
3. Completa en `.env`:

```env
STATUS_TO=romerosilvanicolas@gmail.com,josefa.ogalde@gmail.com
MAIL_HOST=smtp.gmail.com
MAIL_PORT=465
MAIL_USER=tu@gmail.com
MAIL_PASS=xxxx xxxx xxxx xxxx
MAIL_FROM=Impresoreando <tu@gmail.com>
```

4. Probar sin enviar:

```bat
node scripts\impresoreando-status-diario.js --dry-run
```

Abre `data\impresoreando-status-ultimo.html` para ver el correo.

5. Enviar de verdad:

```bat
ENVIAR-STATUS-IMPRESOREANDO.bat
```

### Programar todos los días (Windows)

1. Abre **Programador de tareas**.
2. Crear tarea básica → nombre `Impresoreando status diario`.
3. Desencadenador: **Diariamente** (ej. 09:00).
4. Acción: Iniciar programa → `ENVIAR-STATUS-IMPRESOREANDO.bat` (ruta completa del repo).
5. Marca “Ejecutar aunque el usuario no haya iniciado sesión” solo si aplica; si no, deja la PC/usuario con sesión.

El script lee `data/impresoreando-live.json` (el mismo del panel). Conviene haber guardado online el día anterior.

## Totales iniciales (referencia)

| Concepto | Monto |
|----------|------:|
| Orden #312435 (pagada) | $652.290 |
| AliExpress placa cama | $30.000 |
| AliExpress torno/cortador | $30.000 |
| Líder cajas plástico | $20.000 |
| **Total gastos seed** | **$732.290** |
| **50% cada socio** | **$366.145** |

## ESP32-CAM (cámara Wi‑Fi del taller)

Kit AliExpress (CAM + base MB). Guía paso a paso: [`docs/impresoreando/ESP32-CAM.md`](../../../docs/impresoreando/ESP32-CAM.md) · sketch en `esp32-cam/CameraImpresoreando/`.

## Imágenes para redes

Cuando envíes fotos de productos, se editan aquí en `index/clientes/impresoreando/redes/` (próximo paso).

## Plan paid (detalle)

Ver `PLAN-PAID-BAJO-PRESUPUESTO.md` en esta carpeta.
