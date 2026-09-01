# Brief de factibilidad · Flujo newsletter ECR (Copys → Portada → Carrusel → Video)

**Código:** ECR-NL  
**Ámbito:** Cliente **ECR GROUP** · ecosistema LinkedIn newsletter (NL mensual)  
**Fecha:** 2026-09-01  
**Estado:** flujo operativo parcialmente documentado; automatización con agente **propuesta**, no implementada end-to-end  
**Evaluación sugerida:** `@mova`  
**Operación diaria:** agente Cursor (rol ECR-CM) + herramientas externas (Midjourney, Canva)

---

## 1. Resumen ejecutivo

Proponemos formalizar y, donde sea viable, **automatizar con agente Cursor** el pipeline mensual de cada newsletter ECR a partir del **artículo ya aprobado por el cliente**:

| Etapa | Entrada | Salida del agente / equipo | Gate |
|-------|---------|----------------------------|------|
| **1 · Copys** | PDF/DOCX/TXT del artículo aprobado | TXT con **Feed A/B**, **Carrusel COPY A/B** y **Video A/B** (emojis + hashtags; línea vacía para link) | Aprobación cliente |
| **2 · Portada** | Artículo + copys aprobados | **3 prompts Midjourney** (solo fondo; sin texto/logo) | Aprobación cliente |
| **3 · Carrusel** | Textos de slides (**Tito**) + identidad visual | **N prompts Midjourney** (backgrounds slides 2–7; composiciones distintas) | Aprobación cliente |
| **4 · Video** | Carrusel aprobado en Canva | Guía / assets para **animar el carrusel** (video = carrusel animado) | Aprobación cliente |

El cliente **no cambia** su proceso editorial: sigue entregando el artículo final. Nosotros convertimos ese insumo en piezas LinkedIn con **revisiones explícitas entre etapas** (no se avanza sin OK).

**Pregunta a MOVA:** ¿Es factible y deseable escalar este flujo como **playbook automatizable** (agente + repo + organizador), con dueño de mantenimiento y criterios de calidad medibles?

---

## 2. Problema (dolor real)

| Hoy | Impacto |
|-----|---------|
| Cada NL repite el mismo tipo de entregables (copys ×3 formatos ×2 versiones, portada, 6–7 slides, video) | Tiempo de redacción y coordinación alto por ciclo |
| Reglas de formato (emojis distintos por NL, CTAs no repetidos, A/B editorial vs punch) viven en docs + memoria | Riesgo de inconsistencia entre newsletters |
| Prompts Midjourney requieren ADN visual estricto (sin texto, sin hex, composiciones variadas en carrusel) | Iteraciones manuales; slides 2–7 a veces “parecidas” a la portada o fuera de identidad |
| Textos de slides del carrusel los entrega **Tito** en una etapa distinta a los copys | Dependencia humana clara; el agente no puede inventar slides sin ese insumo |
| Video = carrusel animado | El cuello de botella pasa de creativo (MJ) a montaje (Canva) + animación |
| Tareas en organizador ya modelan madre + 4 subtareas, pero la ejecución es manual | Falta trazabilidad automática archivo ↔ subtarea ↔ aprobación |

No es un problema de “falta de artículo”: el cliente **ya aprueba el contenido**. El cuello de botella es la **producción repetitiva** de piezas derivadas con calidad de marca y gates de aprobación.

---

## 3. Flujo propuesto (detalle)

```
[Artículo aprobado PDF/DOCX/TXT]
           │
           ▼
┌──────────────────────────────────────┐
│ ETAPA 1 · COPYS                      │
│ Agente: Feed A/B + Carrusel A/B +    │
│         Video A/B (FORMATO-COPYS)    │
└──────────────────────────────────────┘
           │ OK cliente
           ▼
┌──────────────────────────────────────┐
│ ETAPA 2 · PORTADA (Midjourney)       │
│ Agente: 3 prompts fondo (BASE+scene) │
│ Humano: generar en MJ → Canva título │
└──────────────────────────────────────┘
           │ OK cliente
           ▼
┌──────────────────────────────────────┐
│ ETAPA 3 · CARRUSEL                   │
│ Tito: textos slides 1–7              │
│ Agente: prompts MJ por slide (2–7)   │
│ Humano: armar carrusel en Canva      │
└──────────────────────────────────────┘
           │ OK cliente
           ▼
┌──────────────────────────────────────┐
│ ETAPA 4 · VIDEO                      │
│ Animar carrusel aprobado             │
│ Copy video ya entregado en Etapa 1   │
└──────────────────────────────────────┘
```

### 3.1 Etapa 1 — Copys

**Entrada:** artículo aprobado (mismo archivo que usará portada).  
**Salida:** un `.txt` por artículo en `index/clientes/ecr/newsletter/copys/`.

Estructura obligatoria (ver `copys/FORMATO-COPYS-ECR.md`):

- **1) FEED** — invitación a leer · versión A (narrativa) · versión B (punch)
- **2) CARRUSEL — COPY** (solo post que acompaña el carrusel; **no** listar slides)
- **3) VIDEO** — versión A y B

Reglas de calidad:

- Marca `ECR GROUP®️` / `#ECRGroup`
- 2–4 hashtags por copy
- **Emojis distintos** respecto al NL anterior (paleta alineada al tema)
- **CTAs distintos** respecto al NL anterior (no repetir “Léelo completo aquí”, “Desliza…”, etc.)
- Línea vacía para pegar link (sin placeholder `[LINK]`)

Referencia enviada al cliente: `copys/COPY-tecnologia-sin-integracion.txt`.

### 3.2 Etapa 2 — Portada Midjourney

**Entrada:** artículo (PDF/DOCX/TXT).  
**Salida:** 3 opciones de prompt listas para copiar.

Reglas (ver `BASE-ESTILO-PORTADAS.md`, `PROMPT-MIDJOURNEY-PORTADA.md`):

- Solo **fondo**; tipografía y logo van en Canva después
- Bloque `BASE` + escena en inglés + `ANTITEXT` (cero texto/logos en imagen)
- **No** incluir `--ar`, `--v`, `--style`, `--no` en el prompt
- **No** pegar hex, marcas ni título del artículo en español (MJ los dibuja)
- UI existente: `http://127.0.0.1:8000/index/clientes/ecr/` → sección Portada Midjourney (`ecr-portada-prompt.js`)

Persistencia: `historial-portadas.json`, `HISTORIAL-PORTADAS.md`, `portadas-guardadas/`.

### 3.3 Etapa 3 — Backgrounds carrusel

**Entrada crítica adicional:** textos de cada slide entregados por **Tito** (no derivables solo del artículo largo).  
**Salida:** prompts Midjourney por slide (típicamente slides **2–7**; slide 1 = portada ya aprobada).

Reglas aprendidas (NL1 sep — iteración cliente):

- Cada slide debe tener **composición distinta** (split vertical, diagonal, radial, close-up, banda central, túnel/perspectiva, etc.)
- Metáforas alineadas a **capacitación digital / talento / LMS** cuando el tema lo pide
- Misma BASE + ANTITEXT que portada; **no** repetir la escena de portada en slide 2
- Sin laptops genéricos / coworking stock si el feedback cliente pide identidad sectorial

**Fuera de alcance del agente en esta etapa:** redactar el copy dentro de cada slide (eso es Tito + Canva).

### 3.4 Etapa 4 — Video

**Definición acordada en repo:** video = **carrusel animado** (`scripts/renombrar-ecr-madres-articulos.js` → subtarea tipo `video`).

**Entrada:** carrusel final en Canva + copy video A/B (ya aprobado en etapa 1).  
**Salida:** MP4 para LinkedIn; copy video ya listo para publicar.

El agente puede apoyar con checklist de animación (duración por slide, transiciones, safe zones), pero la ejecución hoy es **manual en Canva** u otra herramienta de motion.
