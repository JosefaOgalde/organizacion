# Escritor RFID de mano (handheld) — Impresoreando

## Hecho confirmado (2026-07-18)

El adaptador que hay en el taller es un **escritor RFID handheld a pila**, **no** una base ESP32-CAM-MB ni un USB‑TTL.

| Qué creíamos | Qué es en realidad |
|--------------|--------------------|
| Programador USB para ESP32-CAM (CH340 / Arduino) | Handheld RFID a batería |
| Aparece como puerto COM en Windows | **No** usa puerto COM del PC |
| Se configura con Arduino Monitor serie | Se configura **en el aparato** (pantalla/menú) |

Por eso en el PC:
- No aparece **Puertos (COM y LPT)** al enchufarlo (si ni siquiera va por USB, o no es serial).
- Arduino IDE / Monitor serie **no aplican**.
- El aviso de “usuario estándar” en Administrador de dispositivos es irrelevante para este flujo.

Compra / link de referencia: https://a.aliexpress.com/_mKBSVtD (ítem AliExpress asociado al pedido de tarjetas).

---

## Cómo configurar las tarjetas (flujo típico)

1. Encender el handheld (pilas / botón power).
2. Acercar una tarjeta a la zona de antena.
3. **Read / Leer** → muestra el ID.
4. **Write / Write Card / Copiar** → acercar tarjeta **virgen reescribible** hasta OK.
5. Si pide ID a mano: **Manual / Input** → escribir número → Write.

### Reglas

- Tarjetas **solo lectura** (EM4100 típicas): no se regraban; solo se leen o se clonan a una **T5577** (reescribible).
- Frecuencia habitual de estos handheld: **125 kHz**. No sirven para NFC del celular (**13,56 MHz**) salvo que el modelo diga explícitamente NFC / 13.56.
- Pendiente: anotar **modelo exacto** (carcasa o pedido AliExpress) cuando se tenga foto o código, para documentar menús botón a botón.

---

## Relación con ESP32-CAM

En el repo también hay guía/sketch de **ESP32-CAM** (`docs/impresoreando/ESP32-CAM.md`) por si más adelante hay cámara Wi‑Fi de taller.  
**No mezclar:** el handheld RFID no flashea ESP32; la ESP32 no graba tarjetas RFID de 125 kHz.
