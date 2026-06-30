# Medidas — gatita (3,5 kg)

Sesión: 2026-06-29 · Fase 1 · Réplica 3D y validación digital

## Objetivo de diseño (fijado)

> **No** encapsular cabeza ni orejas. **Sí** impedir que la uña de la pata trasera alcance la zona detrás de orejas / nuca mediante una **barrera lisa y abovedada** de huella mínima; la pata debe **resbalar**. Orejas con **ranuras** (holgura), no cavidades selladas.

## Tabla de medidas (mm)

| # | Medida | Valor | Notas |
|---|--------|-------|-------|
| 1 | Circunferencia craneal | **230 mm** | Delante de base de orejas |
| 2 | Circunferencia cuello | **200 mm** | Base del cuello; holgura +6–8 mm en diseño |
| 3 | Largo cabeza (hocico → occipucio) | **120 mm** | |
| 4 | Ancho cabeza (mejilla a mejilla) | **100 mm** | |
| 5 | Altura cabeza (mandíbula → coronilla) | **60 mm** | |
| 6 | Oreja: largo / ancho base / separación bases | **70 / 20 / 30 mm** | Ranuras B: ~25 mm ancho c/u |
| 7 | Ojo → base oreja | **30 mm** | |
| 8 | Base oreja → zona de rascado | **30 mm** | Objetivo principal de cobertura |
| 9 | Largo cuello | **70 mm** | Occipucio → pecho |
| 10 | Peso | **3,5 kg** | Tope casco ~100 g (~3 % peso) |

### Pendientes (Fase 1)

- [x] Video referencia analizado (`VIDEO-ANALISIS.md`)
- [ ] Medidas ➕11–14 (bigotes, mandíbula-coronilla, línea visión, boca abierta)
- [ ] Doble lectura pelo / hueso
- [ ] Fotos ortográficas + escala
- [ ] Video: rascarse, bostezar, mover orejas
- [ ] Validar réplica 3D ±2 mm

## Parámetros derivados para CAD

| Parámetro | Cálculo | Valor diseño |
|-----------|---------|--------------|
| Elipsoide cráneo (semiejes aprox.) | L/2, W/2, H/2 | 60 × 50 × 30 mm |
| Holgura interior cáscara | +3–4 mm sobre pelo | offset 3 mm mínimo |
| Extensión panel nuca (C) | base oreja → lesión + margen | 30 + 20 = **50 mm** mínimo posterior |
| Ranura oreja (altura) | largo oreja + holgura | **78–82 mm** |
| Ranura oreja (ancho) | ancho base 20 mm + holgura; video: base ancha | **27 mm** c/u |
| Cobertura lateral lesión | frame zona lesión | **18 mm** por lado en panel C |
| Separación entre ranuras | medida #6 | **30 mm** entre ejes |
| Anillo cuello (D) interior | circ. cuello + holgura | **206–208 mm** (~65–66 mm Ø) |
| Borde frontal casco | detrás ojos + bigotes | usar medida ➕11 cuando exista |
| Peso objetivo conjunto | <100 g ideal | PETG fino + TPU contacto |

## Módulos (recordatorio)

| Módulo | Función |
|--------|---------|
| **A** | Cúpula dorsal — superficie lisa anti-resbaladizo |
| **B** | Ranuras orejas — aperturas, no copas cerradas |
| **C** | Panel nuca — **zona crítica** (detrás orejas) |
| **D** | Anillo cuello TPU — retención sin estrangular |
| **E** | Mentonera blanda (opcional) |
| **F** | Cierre liberación rápida |

## Materiales impresión

- Prototipos ajuste: **PLA** (desechable)
- Cáscara A+C: **PETG** 1,5–2,5 mm pared
- Cuello y contacto: **TPU** 1,2–2 mm
