# Concepto del casco — qué es y qué NO es

**Actualizado:** 2026-06-30 · criterio confirmado por Nicolás

---

## NO es

- ❌ Casco espartano ni decorativo
- ❌ Máscara que cubra hocico, ojos o mejillas
- ❌ Cavidades cerradas que encierren las orejas
- ❌ Collar isabelino rígido grande

El archivo `01_modA_espartano_sakura.stl` **no corresponde** a este concepto — descartar o rediseñar.

---

## SÍ es

Una **bóveda funcional y modular** que:

1. **Cubre la cabeza** (coronilla, dorso del cráneo y nuca) — la zona que la pata intenta alcanzar.
2. **Deja pasar las orejas** por **ranuras o aberturas** laterales/superiores; las orejas entran y quedan libres para moverse.
3. **Tiene secciones de acople para el collar** — puntos fijos donde enganchar la correa/anillo de cuello (como el snap lateral de la referencia minimalista).
4. **Superficie exterior lisa** — la pata resbala, no engancha la piel.
5. **Varias piezas** que se arman (modular), no un bloque único.

> **Nota sobre “cara”:** el casco **no tapa el hocico ni los ojos**. Puede bajar un poco por los **laterales de la cabeza** (detrás de mejillas), pero la **cara visible** (ojos, nariz, bigotes) queda **descubierta**. Si se necesita más cobertura lateral, solo detrás de las orejas — nunca una máscara frontal.

---

## Vista conceptual

```
Vista superior                    Vista lateral

      [ranura oreja]                   ┌── ranura oreja
    ┌────┬────┬────┐                  │╲
    │    │PUEN│    │  ← bóveda         │ ╲  bóveda lisa
    │ ○  │ TE │  ○ │    dorsal        │  ╲____
    │oreja│    │oreja│                 │      ╲ panel nuca
    └────┴────┴────┘                  │       ╰── sección collar
         │                             │           │
    ─────┴───── anillo / correa ───────┴───────────┴── cuello
              (acople en pestañas)
```

---

## Piezas modulares (diseño objetivo)

| Pieza | Función |
|-------|---------|
| **A — Bóveda dorsal** | Cubre coronilla y puente entre orejas; ranuras B integradas |
| **B — Ranuras oreja** | Recortes en A; orejas entran por aquí (80×27 mm, sep. 30 mm) |
| **C — Panel nuca** | Barrera crítica detrás de orejas; extensión ≥50 mm +18 mm lateral |
| **D — Anillo / correa cuello** | TPU flexible; circ. interior 207 mm |
| **E — Puntos de acople collar** | **Pestañas, orificios o ranuras** en C y/o A para pasar/clipar la correa |
| **F — Correa mandíbula** (opcional) | Bajo barbilla; se fija en sección E (snap lateral) |

### Secciones para el collar (requisito clave)

El casco debe tener **al menos 2 puntos de fijación** para el collar/correa:

| Ubicación | Tipo sugerido |
|-----------|---------------|
| Laterales bajos de la bóveda (junto a orejas) | Ranura para correa + clip, o ojal + remache tipo snap |
| Posterior nuca (unión C + D) | Solapa que recibe el anillo TPU o correa continua |
| Bajo mandíbula (opcional) | Correa blanda separada que sube a los puntos laterales |

La correa **no sustituye** la bóveda: **sujeta** la bóveda para que no se corra cuando la gata mueve la cabeza.

---

## Referencia visual correcta

Usar la **bóveda gris minimalista** (corona + nuca, orejas libres, correa bajo mandíbula con snap lateral).

La imagen del casco espartano sirve **solo** como ejemplo de “varias piezas encastrables” — **no** copiar forma ni cobertura facial.

---

## Medidas y validación

Ver `parametros-cad.json`, `medidas-gatita.md`, `VIDEO-ANALISIS.md`.

Antes de imprimir: plantilla cartón 1:1 + prueba de que orejas entran/salen de ranuras + collar engancha en secciones E sin apretar cuello.
