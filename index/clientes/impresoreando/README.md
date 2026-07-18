# Impresoreando — Panel socios + ecommerce ops

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
- Ventas
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

## Totales iniciales (referencia)

| Concepto | Monto |
|----------|------:|
| Orden #312435 (pagada) | $652.290 |
| AliExpress placa cama | $30.000 |
| AliExpress torno/cortador | $30.000 |
| Líder cajas plástico | $20.000 |
| **Total gastos seed** | **$732.290** |
| **50% cada socio** | **$366.145** |

## Imágenes para redes

Cuando envíes fotos de productos, se editan aquí en `index/clientes/impresoreando/redes/` (próximo paso).

## Plan paid (detalle)

Ver `PLAN-PAID-BAJO-PRESUPUESTO.md` en esta carpeta.
