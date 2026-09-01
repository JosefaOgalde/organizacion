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

---

## 4. Fuera de alcance (explícito)

- Redactar o reescribir el **artículo largo** (solo piezas derivadas).
- Generar imágenes dentro de Cursor (Midjourney es externo; el agente entrega prompts).
- Publicar en LinkedIn (humano pega link + copy).
- Sustituir a **Tito** en textos de slides del carrusel.
- Pedir al cliente cambios de CMS, branding oficial ECR o plantillas Canva corporativas.
- Automatizar login/API de Midjourney o Canva sin evaluación de ToS y MFA.

---

## 5. Qué existe ya en el repo (evidencia)

| Pieza | Ubicación | Estado |
|-------|-----------|--------|
| Formato copys oficial | `newsletter/copys/FORMATO-COPYS-ECR.md` | Hecho |
| Copys reales NL1–NL2 | `copys/COPY-tecnologia-sin-integracion.txt`, `COPY-equipos-en-terreno.txt` | Hecho · enviados |
| ADN visual portadas | `newsletter/BASE-ESTILO-PORTADAS.md` | Hecho |
| Generador prompts portada | `newsletter/ecr-portada-prompt.js` + landing `ecr/index.html` | Hecho · probado |
| Historial portadas | `HISTORIAL-PORTADAS.md`, `portadas-guardadas/` | Hecho |
| Artículos fuente | `newsletter/articulos/` | Hecho (2 NL) |
| Modelo tareas organizador | Madre + subtareas Copys · Portada · Carrusel · Video | Hecho (`renombrar-ecr-madres-articulos.js`) |
| Prompts carrusel NL1 sep | Iterados en chat; **no** guardados aún en repo | Pendiente opcional |
| Generador automático copys | — | **No existe** |
| Generador automático prompts carrusel | — | **No existe** |
| Pipeline animación video | — | **Manual** |

---

## 6. Análisis de factibilidad

### 6.1 Factibilidad técnica (agente + repo)

| Factor | Evaluación | Notas |
|--------|------------|-------|
| Leer PDF/DOCX/TXT del artículo | **Alta** | Ya implementado en `ecr-portada-prompt.js` (pdf.js + mammoth) |
| Generar copys A/B según plantilla | **Alta–media** | LLM + reglas en `FORMATO-COPYS-ECR.md`; requiere QA humano y memoria de NL anterior |
| Generar 3 prompts portada | **Alta** | UI + heurística de mundos A–P ya operativa |
| Generar prompts carrusel por slide | **Media** | Necesita textos Tito + tabla de composiciones; riesgo de repetición visual |
| Persistir entregables en rutas estándar | **Alta** | Convención `copys/`, `portadas-guardadas/`, `articulos/` |
| Vincular subtareas organizador ↔ archivos | **Media** | Campos `entregableArchivo` existen; falta botón “marcar etapa” automático |
| Animar video automáticamente | **Baja** | Canva/motion manual; posible solo asistencia con checklist |

### 6.2 Factibilidad operativa

- **Roles claros:** Josefa/cliente (aprobaciones) · agente (copys + prompts) · Tito (textos slides) · operadora (MJ + Canva + publicación).
- **Gates de aprobación** encajan con CM agencia; no conviene “big bang” (entregar todo junto).
- **Cadencia:** ~1 NL/mes → volumen bajo pero alto detalle por pieza.
- **Mantenimiento:** reglas de emojis/CTAs cambian por NL; hace falta **historial** consultable (último COPY + últimos prompts).

### 6.3 Factibilidad creativa / marca

| Riesgo creativo | Mitigación |
|-----------------|------------|
| Copys genéricos o CTAs repetidos | Checklist vs NL anterior; bloquear frases en prompt del agente |
| Slides carrusel homogéneas | Matriz de composiciones obligatoria (6 layouts distintos) |
| Texto accidental en imágenes MJ | BASE + ANTITEXT; revisión visual antes de enviar a cliente |
| Desalineación slide vs mensaje Tito | Prompt carrusel debe citar **idea** del slide, no el texto literal ES |

### 6.4 Riesgos y mitigaciones

| Riesgo | Mitigación |
|--------|------------|
| Cliente rechaza copys | Etapa 1 aislada; iterar solo TXT |
| Portada OK pero carrusel “no transmite identidad” | Brief visual por vertical (ej. capacitación digital); composiciones distintas |
| Tito entrega slides tarde | No iniciar etapa 3 hasta insumo; organizador bloquea subtarea |
| Agente inventa slides | Prohibido en reglas; solo COPY de acompañamiento en etapa 1 |
| Pérdida de contexto entre sesiones Cursor | Guardar siempre en repo; madre NL con slug + archivos |
| Midjourney ignora anti-texto | Regenerar; no enviar al cliente sin QA visual |

---

## 7. Criterios de éxito del piloto (propuesta)

1. **Copys:** 1 artículo → TXT con 6 bloques (3 formatos × A/B) que pase checklist `FORMATO-COPYS-ECR.md` sin edición mayor (< 15 min QA).  
2. **Portada:** 3 prompts generados; ≥ 1 fondo usable sin texto spurious tras ≤ 3 iteraciones MJ.  
3. **Carrusel:** 6 prompts con composiciones **todas distintas**; feedback cliente ≥ “aceptable” en primera o segunda ronda.  
4. **Video:** carrusel animado publicable en LinkedIn usando copy ya aprobado.  
5. **Trazabilidad:** madre NL en organizador con archivos enlazados en cada subtarea.  
6. **Tiempo:** reducción perceptible vs ciclo NL1–NL2 manual (registrar antes/después en 1 NL piloto).

---

## 8. Esfuerzo relativo (sin calendarios)

| Bloque | Invasividad | Dependencias |
|--------|-------------|--------------|
| Documentar playbook agente (regla `.mdc` o skill ECR-NL) | Baja | Este brief aprobado |
| Generador copys asistido (prompt + plantilla) | Media | Artículo + historial NL anterior |
| Extender UI portada → export copys | Media | API Laravel o script Node |
| Módulo prompts carrusel (matriz composiciones) | Media–alta | Textos Tito + feedback NL1 sep |
| Integración organizador (estados por etapa) | Media | `organizacion-live.json` |
| Automatización video | Alta / posiblemente no | Canva API limitada; manual viable |

---

## 9. Decisión pedida a MOVA

**¿Aprobar el flujo ECR-NL como playbook operativo automatizable** (agente Cursor + repo + organizador), con gates cliente entre etapas?

Opciones de veredicto:

| Veredicto | Significa |
|-----------|-----------|
| **Sí — playbook completo** | Regla agente + docs + UI mínima; piloto 1 NL con métricas sección 7 |
| **Sí — por fases** | Fase 1 solo Copys+Portada (ya casi listo); Fase 2 carrusel; Fase 3 video manual |
| **Sí — solo documentación** | Mantener ejecución manual; MOVA valida criterios de calidad |
| **No por ahora** | Sigue ad hoc; no invertir en generadores |
| **Bloqueo** | Riesgo marca/cliente / dependencia Tito no resoluble |

**Entregables esperados de la evaluación MOVA:**

1. Veredicto (tabla anterior).  
2. Top 3 riesgos no cubiertos en este brief.  
3. Dueño de mantenimiento (rol ECR-CM / agente Cursor / operadora).  
4. Recomendación: qué automatizar en Fase 1 vs dejar manual (copys, portada, carrusel, video).

---

## 10. Preguntas abiertas (para MOVA, no para el cliente)

1. ¿El agente debe **memorizar** emojis/CTAs del NL anterior automáticamente (leer último COPY) o basta checklist humano?  
2. ¿Conviene un **skill** `@ecr` dedicado vs ampliar agente general con reglas en repo?  
3. ¿Los prompts carrusel deben vivir en la misma UI que portada o en Markdown versionado por NL?  
4. ¿Qué nivel de automatización del **video** es realista (Canva vs After Effects vs solo checklist)?  
5. ¿Cómo registrar **aprobación cliente** (campo en organizador, comentario, fecha)?  
6. ¿MOVA audita calidad de copys (tono, claims) o solo factibilidad del pipeline?

---

## 11. Invocación sugerida

```
@mova
Evaluar flujo newsletter ECR según:
index/clientes/ecr/newsletter/BRIEF-FACTIBILIDAD-ECR-NL-FLUJO-MOVA.md

Entregar: veredicto (sección 9) + riesgos + dueño mantenimiento + recomendación por fases.
```

---

## 12. Referencias rápidas

| Recurso | Ruta |
|---------|------|
| Este brief | `index/clientes/ecr/newsletter/BRIEF-FACTIBILIDAD-ECR-NL-FLUJO-MOVA.md` |
| Formato copys | `newsletter/copys/FORMATO-COPYS-ECR.md` |
| Ejemplo copys cliente | `newsletter/copys/COPY-tecnologia-sin-integracion.txt` |
| Base estilo portadas | `newsletter/BASE-ESTILO-PORTADAS.md` |
| Prompt portada | `newsletter/PROMPT-MIDJOURNEY-PORTADA.md` |
| UI portada | `http://127.0.0.1:8000/index/clientes/ecr/` |
| JS generador | `newsletter/ecr-portada-prompt.js` |
| Tareas madre NL | `scripts/renombrar-ecr-madres-articulos.js` |
| Portal ECR | `index/clientes/ecr/index.html` |
| Agente MOVA (evaluación) | `@mova` · `docs/cursor/INVOCAR-AGENTE-MOVA.md` |
| Cliente / rol organizador | `cli-ecr` · `rol-ecr-cm` |

---

## 13. Recomendación preliminar (equipo ECR)

**Factible como flujo secuencial con gates**, con mayor madurez en **Etapa 1–2** (copys + portada) que en **Etapa 3–4** (carrusel depende de Tito; video manual).

**Siguiente paso si MOVA aprueba por fases:** piloto con el próximo artículo aprobado — agente entrega copys + 3 prompts portada; tras OK, Tito entrega slides y agente genera pack prompts carrusel guardado en `portadas-guardadas/NL{n}-{mes}-carrusel-prompts.md`.
