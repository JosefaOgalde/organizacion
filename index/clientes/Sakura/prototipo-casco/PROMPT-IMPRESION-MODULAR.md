# Prompt — Casco modular Sakura (archivos para impresora)

Copia el bloque completo de abajo y pégalo en Cursor con `@sakura-casco`, o en tu herramienta CAD.

---

## BLOQUE PARA COPIAR

```
Cliente: Sakura
Proyecto: Prototipo Casco — versión MODULAR para impresión 3D
Fase: 2.2 — Generar STL por pieza, listos para laminador
Invocación: @sakura-casco
Repo base: index/clientes/Sakura/prototipo-casco/
CAD previo: cad/fase-2/casco_parametrico.scad · parametros-cad.json · FASE-2-RESULTADOS.md

---

## REFERENCIAS VISUALES (estilo objetivo)

Imagen 1 — Cúpula minimalista (REFERENCIA PRINCIPAL):
- Bóveda baja y lisa sobre coronilla y nuca
- Orejas 100 % libres (no encapsuladas)
- Borde frontal DETRÁS de ojos y bigotes
- Correa blanda bajo mandíbula con cierre tipo snap/remache lateral
- Huella mínima, liviano, no isabelino

Imagen 2 — Casco espartano (REFERENCIA SOLO DE MODULARIDAD):
- Varias piezas que se ensamblan (no copiar cobertura facial)
- Usar la idea: cuerpo + piezas superiores/laterales + accesorios encastrables
- NO cubrir hocico, ojos ni mejillas como el casco espartano

---

## PRINCIPIO RECTOR (NO NEGOCIABLE)

NO encapsular cabeza ni orejas.
SÍ impedir que la uña de la pata trasera alcance la zona detrás de orejas / nuca.

→ Barrera lisa y abovedada; la pata RESBALA
→ Ranuras abiertas para orejas (holgura), NO cavidades selladas
→ MODULAR: varias piezas imprimibles que se arman sin pegamento permanente
→ Anillo/correa TPU en cuello + correa mandíbula opcional
→ Peso total <100 g (objetivo ~30–50 g en PETG+TPU)

---

## MEDIDAS CONFIRMADAS (mm)

| Medida | Valor |
|--------|-------|
| Circ. craneal | 230 (validar cartón 1:1 — elipsoide 120×100 puede sobre-estimar borde) |
| Circ. cuello | 200 |
| Largo × ancho × alto cabeza | 120 × 100 × 60 |
| Oreja largo / base / sep. bases | 70 / 20 / 30 |
| Ojo → base oreja | 30 |
| Base oreja → lesión | 30 |
| Largo cuello | 70 |
| Peso gata | 3,5 kg |

Video: lesión en base posterior oreja + lateral hacia ojo → panel nuca +18 mm lateral/lado.

---

## ARQUITECTURA MODULAR — PIEZAS A IMPRIMIR

Genera UN STL WATERTIGHT por pieza + UN STL de ensamble (visualización) + UN maestro paramétrico (.scad o STEP).

### Pieza 1 — PUENTE DORSAL (módulo A)
- Material: PETG
- Función: cúpula central entre orejas; superficie exterior CONVEXA y LISA
- Encastre: ranuras macho/hembra o clips en bordes caudal y lateral
- Ventilación: perforaciones Ø5 mm (no sobre ranuras orejas)

### Pieza 2 — PANEL NUCA (módulo C)
- Material: PETG
- Función: barrera crítica detrás de orejas; extensión ≥50 mm caudal +18 mm lateral
- Encastre: une con Pieza 1 (puente) y Pieza 4 (falda) SIN GAP explotable
- Borde inferior fundido con falda/anillo (la pata NO entra por debajo)

### Pieza 3A y 3B — GUARDAS LATERALES LESIÓN (opcional, o integradas en C)
- Material: PETG
- Función: flancos posteriores ±18 mm sobre lesión
- Encastre: snap a Panel Nuca o Puente

### Pieza 4 — FALDA CAUDAL (transición A+C → cuello)
- Material: PETG
- Función: continuidad entre bóveda y anillo; cierra vía bajo borde caudal
- Encastre: union permanente por diseño con Pieza 2 (o clip si se prefiere desmontable)

### Pieza 5A y 5B — RANURAS OREJA (módulo B)
- NO son piezas cerradas: son RECORTES en Pieza 1
- Dimensiones: 80 × 27 mm, separación 30 mm entre ejes
- Holgura: oreja entra/sale y se aplana sin roce del borde

### Pieza 6 — ANILLO CUELLO (módulo D) — 2 o 3 segmentos TPU
- Material: TPU 95A
- Circ. interior: 207 mm (Ø ~65,9 mm)
- Pared: 1,5 mm · Alto: 12 mm
- Cierre: solapa con clip o velcro; NUNCA rígido cerrado
- Si segmentado: 2 mitades con lengüeta + orificio para correa

### Pieza 7 — CORREA MANDÍBULA + CLIPS (módulo E/F)
- Material: TPU o correa textil + clip impreso PETG
- Referencia imagen 1: correa bajo mandíbula, remache/snap lateral en bóveda
- Liberación rápida ante emergencia

### Pieza 8 — CLIPS DE ENSAMBLE (módulo F)
- Material: PETG o TPU según flexibilidad
- Tipo: lengüeta + ranura, o clip a presión (como cresta modular imagen 2)
- Mínimo 2 puntos de unión puente↔nuca, 1 punto nuca↔falda

---

## PARÁMETROS CAD (usar tal cual salvo ajuste cartón)

```
Semiejes réplica: 60 × 50 × 30 mm
Holgura interior: 3 mm
Pared PETG: 2 mm
Borde frontal x_front: +20 mm (detrás ojos — ajustar con bigotes)
Borde caudal x_rim: -55 mm
Ranuras: 80 × 27 mm, sep 30 mm
Flanco lesión: ±18 mm
Anillo D: circ 207 mm, pared 1,5 mm, alto 12 mm
Fillet contacto: ≥2,5 mm hacia afuera
```

Simulación previa OK: uña r=100 mm topa casco +5,1 mm de lesión y resbala.

---

## ENTREGABLES OBLIGATORIOS (para la impresora)

Entregar carpeta `cad/fase-2/modular/` con:

| Archivo | Descripción |
|---------|-------------|
| `01_puente_dorsal.stl` | Pieza 1 |
| `02_panel_nuca.stl` | Pieza 2 |
| `03_falda_caudal.stl` | Pieza 4 (o fusionada con 02 si una sola pieza nuca+falda) |
| `04_anillo_cuello_A.stl` | Segmento TPU (si aplica) |
| `04_anillo_cuello_B.stl` | Segmento TPU |
| `05_clip_ensamble_x2.stl` | Clips (imprimir x2 mínimo) |
| `06_correa_clip_mandibula.stl` | Soporte correa / snap lateral |
| `ensamble_completo.stl` | Solo visualización en visor 3D |
| `casco_modular.scad` | Maestro paramétrico editable |
| `GUIA-IMPRESION.md` | Ver abajo |

Cada STL debe ser:
- Watertight (manifold, sin huecos)
- Orientado para impresión (elegir cara de apoyo)
- En milímetros, escala 1:1

---

## GUIA-IMPRESION.md (generar junto con los STL)

Incluir por pieza:

### PETG (piezas 1–4, clips)
- Nozzle: 0,4 mm
- Capa: 0,2 mm
- Paredes: 3–4
- Relleno: 15–20 %
- Soporte: solo si inevitable; preferir diseño sin soportes
- Brim en piezas con poca base
- Temperatura: según marca PETG (~230–240 °C cama 70–80 °C)

### TPU (anillo, correa)
- Nozzle: 0,4 mm
- Capa: 0,2–0,3 mm
- Velocidad: 15–25 mm/s
- Relleno: 20 %
- Retracción mínima
- Sin soportes si es posible

### Post-proceso
- Limar solo rebabas; NO afilar bordes de contacto con piel
- Forro interior opcional: fieltro adhesivo 1 mm en zona nuca
- Probar ensamble en seco antes de poner en la gata

### Orden de impresión sugerido
1. Clips (prueba rápida PETG)
2. Panel nuca + falda (pieza crítica)
3. Puente dorsal
4. Anillo TPU
5. Ensamblar → plantilla cartón 1:1 → prueba en gata supervisada

---

## VALIDACIÓN ANTES DE ENTREGAR STL

- [ ] Cada pieza watertight (trimesh / slicer preview)
- [ ] Ensamble sin gaps >1 mm en nuca (pata no entra)
- [ ] Re-simular arco pata r=80–100 mm → uña no alcanza lesión
- [ ] Ranuras 80×27: oreja no choca con borde
- [ ] Masa total estimada <100 g
- [ ] Fillets ≥2,5 mm en todo contacto piel/pelo
- [ ] Lista de piezas + cantidad a imprimir (ej. clips ×2)

---

## LO QUE AÚN PUEDO APORTAR (preguntar si falta)

1. Envergadura bigotes (mm) → fijar borde frontal
2. ¿Circ. 230 mm fue delante de orejas o punto más ancho?
3. Video rascado → ajustar pivote pata
4. ¿Impresora monomaterial o dual? ¿TPU disponible?
5. ¿Diámetro nozzle? (0,4 asumido)

---

## FORMATO DE TU RESPUESTA

1. Lista de piezas modulares con función y material
2. Archivos STL en `cad/fase-2/modular/` (uno por pieza)
3. `casco_modular.scad` paramétrico
4. `GUIA-IMPRESION.md` completa
5. Diagrama ASCII o lista de ensamble (orden: qué va primero)
6. Masa estimada por pieza y total
7. Checklist pre-impresión marcado

NO imprimir en la gata hasta plantilla cartón 1:1 validada.
```

---

## Diagrama ensamble (referencia)

```
        [Oreja]   RANURA    [Oreja]
           \       |       /
            \  PUENTE DORSAL (1)  /
             \_____|_____/
                   |
            PANEL NUCA (2) + FALDA (4)
                   |
            ANILLO CUELLO TPU (6)
                   |
         correa mandíbula (7) ── snap lateral
```

Piezas 1+2+4 se unen con clips (8). Anillo (6) recibe la falda sin hueco.
