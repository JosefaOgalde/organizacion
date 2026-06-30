# Fase 2 — Resultados CAD y validación digital

**Fecha:** 2026-06-30  
**Estado:** mockup digital generado · simulación alcance pata OK · **no imprimir aún**

---

## Archivos entregados

| Archivo | Descripción |
|---------|-------------|
| `cad/fase-2/replica_gata.stl` | Gemelo digital elipsoide 120×100×60 mm |
| `cad/fase-2/casco_AC_boveda.stl` | Bóveda PETG módulos A+C + ranuras B + ventilación |
| `cad/fase-2/anillo_D_cuello.stl` | Anillo TPU cuello (circ. interior 207 mm) |
| `cad/fase-2/casco_ensamblado.stl` | Ensamble completo para visor/laminador |
| `cad/fase-2/casco_parametrico.scad` | Maestro editable OpenSCAD |

Todos los STL reportados **watertight** (válidos para slicer).

---

## Simulación arco pata trasera

| Métrica | Valor | Lectura |
|---------|-------|---------|
| Separación rígida casco↔piel en lesión | **+5,1 mm** | uña no alcanza piel |
| Contacto uña (r=100 mm) | 4,1 mm caudal de lesión, 3,6 mm sobre piel | topa casco y **resbala** |
| Arcos r=80 / r=90 | cortos | no alcanzan casco |
| Cobertura caudal tras lesión | **20 mm** | margen sobrado |
| Masa bóveda PETG | **24,1 g** | |
| Masa anillo TPU | **4,6 g** | |
| **Masa total** | **28,7 g** | objetivo <100 g ✅ |

**Pivote pata:** caudal-ventral (x≈−95, y≈−55 en coords del diagrama).  
**Lesión:** x≈−35, z≈+25 (30 mm caudal de base oreja).

---

## Parámetros OpenSCAD (maestro)

```
Semiejes cráneo: 60 × 50 × 30 mm
Holgura interior: 3 mm
Pared A+C: 2 mm PETG
Borde frontal: x = +20 mm (detrás ojos/vibrisas — pendiente confirmar bigotes)
Borde caudal: x = −55 mm
Ranuras B: 80 × 27 mm, separación 30 mm
Ventilación: Ø 5 mm
Anillo D: circ. 207 mm, pared 1,5 mm, alto 12 mm
```

---

## Inconsistencia detectada (importante)

**Circ. craneal 230 mm** no coincide geométricamente con elipsoide 120×100 mm:
- Perímetro ecuatorial elipsoide ≈ **346 mm**
- Perímetro coronal ≈ **255 mm**

La medida de 230 mm fue probablemente en zona más estrecha (delante de orejas, con pelo). El elipsoide **sobre-representa** el cráneo en el borde inferior del casco.

**Acción:** validar con plantilla cartón 1:1 o escaneo antes de imprimir. No invalida la simulación de alcance de pata, sí el **calce**.

---

## Riesgos residuales (Fase 2.1)

1. **Gap nuca:** bóveda A+C y anillo D separados → pata podría entrar por debajo. **Solución:** fundir falda A+C con anillo D (continuidad sin hueco).
2. **Flancos amplios:** cobertura lateral actual ~±55 mm → recortar a **+18 mm/lado** sobre lesión (liberar mejillas, bajar peso).
3. **Borde frontal:** fijar con envergadura real de bigotes.
4. **Pivote pata:** ajustar con video de rascado espontáneo.
5. **Orejas:** confirmar que entran/salen de ranura 27 mm sin presión al aplanar.

---

## Checklist pre-impresión

- [ ] Datum borde inferior corregido (230 mm vs elipsoide)
- [ ] Bigotes medidos → fijar `x_front`
- [ ] Video rascado → ajustar pivote/radio arco
- [ ] **Falda A+C fundida con anillo D**
- [ ] **Flancos recortados a +18 mm/lado**
- [ ] Fillets ≥2–3 mm en contacto; interior liso + fieltro
- [ ] Plantilla cartón 1:1 probada en la gata
- [ ] Validación digital interferencias OK (alcance ✅)
- [ ] PLA ajuste → PETG+TPU final

---

## Exportar STEP (Fusion 360)

OpenSCAD exporta STL/3MF, no STEP. Para STEP paramétrico:

1. Importar STL o recrear con parámetros del `.scad`
2. `Modify → Change Parameters`: a, b, c, holgura, pared, x_front, x_rim
3. Esfera escalada → cáscara booleana → recortes ranuras/ventilación
4. Fillet ≥2–3 mm en bordes contacto
5. `Export → STEP`

---

## Siguiente paso recomendado (Fase 2.1)

**Sí avanzar:** unir bóveda A+C con anillo D en falda continua + recortar flancos a +18 mm. Cierra el riesgo de la nuca y reduce peso antes del primer PLA de prueba.
