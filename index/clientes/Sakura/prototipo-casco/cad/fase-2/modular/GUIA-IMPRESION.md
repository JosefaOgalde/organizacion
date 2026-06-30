# Guía de impresión — Casco modular Sakura (Fase 2.2)

**Piezas recibidas:** 3 STL en `cad/fase-2/modular/`  
**Gata:** 3,5 kg · medidas en `parametros-cad.json`

---

## Archivos para la impresora

| Archivo | Módulo | Material | Cantidad | Estado malla |
|---------|--------|----------|----------|--------------|
| `01_modA_espartano_sakura.stl` | A — cúpula / puente dorsal | **PETG** | 1 | ⚠️ Reparar en slicer (no watertight) |
| `02_modC_panel_nuca.stl` | C — panel nuca | **PETG** | 1 | ✅ Watertight (~17 g) |
| `03_modD_anillo_cuello.stl` | D — anillo cuello | **TPU** | 1 | ✅ Watertight (~4,6 g) |

**Masa estimada (C+D):** ~21,5 g PETG+TPU · modA pendiente reparar para estimar.

### Piezas aún no entregadas (opcional Fase 2.3)

- Falda caudal (unión nuca↔anillo sin gap)
- Clips de ensamble ×2
- Correa + snap mandíbula

---

## Orden de ensamble

```
        [Oreja]     [Oreja]
           \   modA   /
            \  cúpula /
             \_______/
                  │ encastre
             modC panel nuca
                  │ continuidad sin hueco
             modD anillo TPU (cuello)
```

1. Imprimir **modC** y **modD** primero (más pequeñas, validan escala).
2. Imprimir **modA** tras reparar malla.
3. Encajar modC en borde caudal de modA.
4. Deslizar anillo modD bajo nuca; debe solaparse con modC sin dejar hueco donde entre la pata.
5. **Probar en cartón 1:1 antes que en la gata.**

---

## Configuración slicer

### PETG — modA y modC

| Parámetro | Valor |
|-----------|-------|
| Nozzle | 0,4 mm |
| Capa | 0,2 mm |
| Paredes | 3–4 |
| Relleno | 15–20 % |
| Cama | 70–80 °C |
| Extrusor | 230–240 °C |
| Brim | recomendado en modC |
| Soporte | solo si el slicer lo pide en modA |

**modA:** en PrusaSlicer / Cura → *Reparar* / *Fix model* antes de laminar.  
Si sigue fallando: abrir en Meshmixer → *Edit → Make Solid* o re-exportar desde OpenSCAD.

### TPU — modD

| Parámetro | Valor |
|-----------|-------|
| Capa | 0,2–0,3 mm |
| Velocidad | 15–25 mm/s |
| Relleno | 20 % |
| Retracción | mínima (0,5–1 mm) |
| Cama | 40–50 °C |

---

## Orientación sugerida

| Pieza | Apoyo en cama |
|-------|----------------|
| modA | Mayor superficie plana hacia abajo (probar rotar en slicer hasta mínimos soportes) |
| modC | Cara más plana / borde caudal en cama |
| modD | De canto (anillo de pie, eje Z = alto 12 mm) |

---

## Post-proceso

1. Retirar soportes y brim.
2. Lijar solo rebabas; **no** afilar bordes que tocan piel.
3. Filete manual con lija fina en bordes de contacto si quedan filosos.
4. Forro opcional: fieltro adhesivo 1 mm en interior de modC (zona lesión).
5. Prueba de encaje en seco → cartón 1:1 → gata **supervisada** pocos minutos.

---

## Checklist pre-impresión

- [ ] modA reparado y previsualizado sin huecos en slicer
- [ ] modC + modD laminados y pesados (~22 g mínimo)
- [ ] Ensamble sin gap >1 mm en nuca
- [ ] Plantilla cartón 1:1 validada
- [ ] Bigotes no comprimidos al poner modA
- [ ] Orejas entran libres por ranuras de modA
- [ ] Primera prueba: **PLA barato** o PETG; supervisión constante

---

## Rutas absolutas (repo)

```
index/clientes/Sakura/prototipo-casco/cad/fase-2/modular/01_modA_espartano_sakura.stl
index/clientes/Sakura/prototipo-casco/cad/fase-2/modular/02_modC_panel_nuca.stl
index/clientes/Sakura/prototipo-casco/cad/fase-2/modular/03_modD_anillo_cuello.stl
```

Lleva los 3 STL al laminador (USB, PrusaLink, OctoPrint, etc.) tal cual; escala **100 %**, unidades **mm**.
