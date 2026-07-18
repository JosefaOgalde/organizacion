# ESP32-CAM — cámara Wi‑Fi del taller (Impresoreando)

> **Ojo:** el adaptador a pila del taller es un **escritor RFID handheld**, no esta base. Ver `docs/impresoreando/RFID-HANDHELD.md`. Esta guía es solo si tenés módulo **ESP32-CAM** + programador USB (MB/CH340 o USB‑TTL).

Kit típico: **ESP32-CAM** (cámara OV2640) + base **ESP32-CAM-MB** (micro-USB, chip **CH340**).

Uso: cámara Wi‑Fi para mirar la impresora (Centauri Carbon 2) desde el celular/PC en la misma red.

Sketch: `index/clientes/impresoreando/esp32-cam/CameraImpresoreando/`.

---

## Qué trae la caja (revisar)

| Pieza | Para qué |
|-------|----------|
| Placa ESP32-CAM + lente OV2640 | Cámara + Wi‑Fi |
| Base ESP32-CAM-MB | Programar y alimentar por USB |
| Cable micro-USB | Datos + 5 V (tiene que ser de **datos**, no solo carga) |

Si **no** viene la base MB, hace falta un adaptador USB‑TTL (FTDI/CH340) y puentear **IO0→GND** al flashear. Con MB es más simple: encaja la CAM encima y USB al PC.

---

## 1) Driver CH340 (Windows)

Sin esto el PC **no ve** la tarjeta (no aparece puerto COM).

1. Instalá el driver CH340 (WCH): buscar “CH340 driver Windows” en el sitio oficial WCH o el instalador del kit.
2. Conectá **CAM + MB** al USB.
3. Abrí **Administrador de dispositivos** → Puertos (COM y LPT) → anotá el COM (ej. `COM5`).
4. Si aparece “dispositivo desconocido” o con signo de admiración → reinstalá el driver y probá otro cable/puerto USB.

---

## 2) Arduino IDE + core ESP32

1. Instalá [Arduino IDE 2.x](https://www.arduino.cc/en/software).
2. **Archivo → Preferencias → Gestor de URLs adicionales de tarjetas** y pegá:

```
https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json
```

3. **Herramientas → Placa → Gestor de tarjetas** → buscá `esp32` → instalá **esp32 by Espressif Systems** (última estable).
4. Seleccioná:

| Opción | Valor |
|--------|--------|
| Placa | **AI Thinker ESP32-CAM** |
| Puerto | el COM del paso 1 |
| Upload Speed | `115200` (si falla el upload, bajá a `460800` o `115200`) |
| Partition Scheme | **Huge APP (3MB No OTA)** |

---

## 3) Wi‑Fi y sketch

1. Copiá la carpeta del repo a tu PC (o abrila desde el clone):

```
index/clientes/impresoreando/esp32-cam/CameraImpresoreando/
```

2. Copiá `secrets.h.example` → `secrets.h` y poné el Wi‑Fi del taller (2,4 GHz; la ESP32-CAM **no** usa 5 GHz):

```cpp
#define WIFI_SSID "nombre-de-tu-wifi"
#define WIFI_PASS "tu-clave"
```

3. Abrí `CameraImpresoreando.ino` en Arduino IDE.
4. **Subir** (botón Upload).
5. Si se queda en `Connecting...`:
   - Mantener **IO0** (o botón BOOT de la MB) y pulsar **RESET** una vez; soltá IO0 cuando empiece a subir.
   - Algunas MB lo hacen solas; si no, ese truco arregla el 90% de los casos.
6. Cuando termine: abrí **Monitor serie** a **115200 baud**, pulsá RESET.
7. Deberías ver una IP tipo `http://192.168.x.x` → abrila en el navegador → **Start Stream**.

---

## 4) Checklist si “no puedo configurarla”

| Síntoma | Qué hacer |
|---------|-----------|
| No aparece puerto COM | Driver CH340 + cable de datos + otro USB |
| `Failed to connect to ESP32` | IO0 a GND / BOOT + RESET; velocidad 115200; CAM bien encajada en la MB |
| `Brownout detector was triggered` | Alimentación débil: USB del PC a veces no alcanza; usá cargador 5 V ≥1 A en el pin 5V de la CAM (GND común) o hub alimentado |
| Cámara en negro / error init | Modelo `CAMERA_MODEL_AI_THINKER`; lente bien insertada; reinicio tras flashear |
| No conecta al Wi‑Fi | Solo 2,4 GHz; SSID/clave exactos; el router no debe aislar clientes (AP isolation) |
| IP sale pero no abre en el celu | Celular en la **misma** Wi‑Fi; no uses datos móviles |

---

## 5) Uso en Impresoreando

1. Montá la cámara mirando el bed / pieza (soporte impreso o clip).
2. Guardá la IP en favoritos del celu (o DHCP estático en el router).
3. Para redes: stream corto o captura de pantalla del progreso de impresión.

Gasto AliExpress: registrarlo en el panel (**Gastos → equipo**) cuando tengas el monto en CLP; no está en el seed hasta que lo cargues.

---

## Enlaces útiles

- Ejemplo oficial (alternativa): Arduino IDE → **Archivo → Ejemplos → ESP32 → Camera → CameraWebServer** (descomentar `CAMERA_MODEL_AI_THINKER` y poner Wi‑Fi).
- Pinout / specs: [espboards.dev/esp32/esp32cam](https://www.espboards.dev/esp32/esp32cam/)
