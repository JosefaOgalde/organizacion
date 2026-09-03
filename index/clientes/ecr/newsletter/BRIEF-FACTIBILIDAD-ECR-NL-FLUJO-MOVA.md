# Brief de factibilidad · ECR-NL v2 (MOVA)

**Código:** ECR-NL  
**Nombre:** Automatización del flujo de newsletters LinkedIn — ECR GROUP  
**Ámbito:** MOVA · operaciones de contenido (HTML + JSON)  
**Fecha:** 2026-09-03 · **Versión brief:** 2.0 (post-evaluación comité 45% → reenvío)  
**Responsable / dueño:** Josefa Ogalde · `rol-ecr-cm` · mantenimiento JSON/HTML MOVA  
**Tipo:** Automatización de *asistente operativo* (no bot end-to-end sin humano)  
**Valor comité:** ✂️ Reduce costos operacionales  
**Escalable:** ✅ Sí — crece en volumen sin rediseño (nuevo NL = nuevo registro JSON)

**Entregable MOVA (ya en repo):**
- HTML: `index/clientes/MKOF/MOVA/ecr-nl/index.html`
- JSON: `index/clientes/MKOF/MOVA/ecr-nl/ecr-nl-flujo.json`
- URL: `http://127.0.0.1:8000/index/clientes/MKOF/MOVA/ecr-nl/`

---

## 0. Por qué se reenvía (respuesta al veredicto Congelado 45%)

| Gate / principio que falló | Cómo este brief lo corrige |
|----------------------------|----------------------------|
| **Autonomía (gate duro)** | Se redefine el producto: **capa autónoma de producción textual/prompt** (copys + prompts MJ + estados). MJ/Canva/OK cliente quedan como *ejecutores*, no como “el sistema”. Se restan loops humanos: **observaciones solo si aplica**. |
| **Escalabilidad (gate duro)** | Patrón **Consolidado SEO** → 1 JSON/HTML fijo; N newsletters = N filas/registros. Volumen ↑ sin rediseñar flujo ni contratar 1:1. |
| **Medibilidad (gate duro)** | Baseline + metas + ROI + TCO numéricos (sección 8–9). |
| Trazabilidad / seguridad | Consolidado JSON con dueño por columna, timestamps de VB interno/externo, archivos enlazados. |
| Interoperabilidad | Contratos de handoff explícitos (prompt → MJ · asset → Canva · estado → organizador). |
| Sustracción | Elimina: inventar desde memoria, revalidar sin observaciones, reescribir reglas por NL. |

---

## 1. Resumen ejecutivo

Cada newsletter ECR hoy recorre un flujo manual (mapeado en papel operativo):

1. Proponer fechas + enviar copys  
2. OK cliente externo  
3. Fondo portada Midjourney  
4. Logo + texto en Canva  
5. Validación interna (Tito/Vale) → externa (ajustes **solo si aplica**)  
6. Armar carrusel (fondos MJ + textos/logo Canva)  
7. Validación interna → externa (ajustes **solo si aplica**)  
8. Animar video (carrusel) + programar / publicar  

**Propuesta:** formalizar ese recorrido en **MOVA (HTML + JSON consolidado)** y automatizar con agente Cursor todo lo que es *producción repetible de texto y prompts*, dejando humanos solo donde la herramienta externa o la marca lo exigen.

**Pregunta a MOVA:** ¿Descongelar ECR-NL como playbook v1 (Copys + Portada + consolidado estados) con métricas y autonomía parcial demostrable, y roadmap v2–v3 para carrusel/video?

---

## 2. Problema concreto

Hoy el proceso de cotización/producción de un NL toma **6–10 horas** por ciclo porque:

- Copys Feed/Carrusel/Video × A/B se escriben a mano con reglas en la cabeza (emojis/CTAs no repetir).  
- Prompts Midjourney se arman caso a caso; slides del carrusel a menudo salen “parecidas” a la portada.  
- Validaciones interna/externa se repiten aunque **no haya observaciones**.  
- No hay consolidado único (archivo ↔ etapa ↔ VB ↔ fecha) como en SEO; el estado vive en chat, Canva y memoria.  

Impacto: costo operativo alto, inconsistencia de marca, imposibilidad de subir a 2–4 NL/mes sin sumar horas lineales.

---

## 3. Flujo real (mapa de automatización)

Fuente: recorrido operativo en pizarra (imagen 1) + lista de validación (imagen 2).

```
[1] Fechas publicación + Copys          ← AUTOMATIZABLE (agente + plantilla)
        ↓
[2] OK cliente externo                  ← HUMANO (gate obligatorio)
        ↓
[3] Fondo portada Midjourney            ← ASISTIDO (agente genera prompt; humano pega en MJ)
[4] Logo + texto Canva                  ← HUMANO (montaje marca)
        ↓
[5] VB interno Tito/Vale                ← HUMANO corto
    Observaciones → SOLO SI APLICA      ← regla de sustracción
[6] VB externo                          ← HUMANO (gate)
        ↓
[7] Carrusel: fondos MJ + textos Canva  ← ASISTIDO prompts / HUMANO montaje
[8] VB interno → VB externo             ← igual; observaciones solo si aplica
        ↓
[9] Animar video + programar publicar   ← CHECKLIST asistido / HUMANO Canva + LinkedIn
```

### 3.1 Qué se automatiza vs qué queda humano (honesto)

| Paso | Automatiza MOVA/agente | Humano |
|------|------------------------|--------|
| 1.1 Fechas | Sugerir calendario NL en consolidado | Confirmar |
| 1.2 Copys | Generar Feed/Carrusel/Video A/B + emojis/hashtags | QA &lt;15 min |
| 3 Portada fondo | 3 prompts MJ (BASE+scene+ANTITEXT) | Pegar en MJ, elegir 1 |
| 4 Logo/texto | — | Canva |
| 5–6 / 8 Validaciones | Registrar estado + observaciones en JSON | Tito/Vale / cliente |
| 7 Carrusel fondos | Prompts por slide (composiciones distintas) | MJ + Canva |
| 7 Textos slides | Borrador desde artículo (v2); Tito valida | Tito/Vale |
| 9 Video + publicar | Checklist duración/transiciones | Canva + LinkedIn |

**Autonomía (definición que pide el gate):**  
> El sistema produce **sin redacción humana** los entregables de texto/prompt y **persiste estado** sin depender de memoria. No pretende operar Midjourney/Canva/LinkedIn sin persona en v1.

### 3.2 Regla de validación (imagen 2)

Checklist fijo de 9 pasos. Las **observaciones/correcciones solo existen si aplica**:

- Si VB interno = OK → no se abre loop de ajustes.  
- Si hay observación → se registra en consolidado (`observaciones[]`) con dueño y se reabre **solo** la etapa afectada (no todo el NL).  
- VB externo no se pide dos veces si no hubo cambios.

Esto baja tiempo de ciclo (principio Tiempo de ejecución / Tiempo de creación).

---

## 4. Modelo Consolidado (inspirado en SEO)

El área SEO estructura el trabajo con **consolidados** (hojas históricas + hojas mes/año + columnas con dueño + tickets VB). ECR-NL aplica el mismo patrón en **JSON** (fuente de verdad MOVA), no en Sheets sueltos.

### 4.1 Consolidado ECR-NL (por año)

| Campo | Dueño | Uso |
|-------|-------|-----|
| `id` / `mes` / `nlNumero` | Editora CM | Identidad del ciclo |
| `tituloArticulo` / `articuloArchivo` | Editora | Insumo aprobado |
| `fechaPublicacionPropuesta` | Editora (agente sugiere) | Paso 1.1 |
| `copysArchivo` + `vbCopysExterno` | Agente / Cliente | Paso 1–2 |
| `portadaPrompt` / `portadaAsset` / `vbPortadaInterno` / `vbPortadaExterno` | Agente / Tito-Vale / Cliente | Pasos 3–6 |
| `carruselPrompts[]` / `carruselAsset` / `vbCarruselInterno` / `vbCarruselExterno` | Agente / Tito-Vale / Cliente | Pasos 7–8 |
| `videoAsset` / `publicadoEn` / `urlLinkedIn` | Operadora | Paso 9 |
| `observaciones[]` | Quien observa | **Solo si aplica** |
| `hrsReales` / `rondasAjuste` | Sistema | Medición |

Administración de estructura: **dueño ECR-CM** (igual que editora SEO en consolidados). Cambios de schema = commit en repo, no chat.

Archivo vivo: `index/clientes/MKOF/MOVA/ecr-nl/ecr-nl-flujo.json` (+ array `newsletters[]`).

---

## 5. Fuera de alcance (explícito)

- Reescribir el artículo largo del cliente.  
- Login/API Midjourney o Canva en v1 (ToS / MFA).  
- Publicar en LinkedIn sin humano.  
- Sustituir VB de marca (cliente externo).  
- Cambios de CMS o branding ECR.

---

## 6. Evidencia en repo (ya existe)

| Pieza | Estado |
|-------|--------|
| Formato copys + ejemplos enviados | Hecho |
| UI + JS prompts portada Midjourney | Hecho · probado |
| Historial portadas | Hecho |
| Madre + 4 subtareas organizador | Hecho |
| HTML + JSON MOVA ECR-NL | Hecho (v1 estructura) |
| Generador copys automático | Pendiente piloto |
| Matriz composiciones carrusel | Pendiente v2 |
| Animación video | Manual + checklist |

---

## 7. Factibilidad por principio MOVA (autoevaluación)

| # | Principio | Score esperado | Cómo se cumple |
|---|-----------|----------------|----------------|
| 1 | Sustracción | Cumple | Menos memoria, menos loops sin observación, un consolidado |
| 2 | Seguridad info | Cumple/ajuste | Estados y archivos en repo; sin credenciales en JSON; VB con timestamp |
| 3 | Interoperabilidad | Cumple/ajuste | Contratos prompt/asset/estado; no API opaca en v1 |
| 4 | Autonomía | Cumple parcial | Autonomía de *producción* (texto/prompt/estado); ejecución MJ/Canva humana acotada |
| 5 | Tiempo ejecución | Cumple | Meta ≤4 hrs/NL; loops condicionales |
| 6 | Agilidad uso | Cumple | Reglas en FORMATO-COPYS + BASE estilo (ya cumplió) |
| 7 | Escalabilidad | Cumple | N registros JSON / mismo HTML; horas humanas sublineales |
| 8 | Medibilidad | Cumple | Sección 8 numérica |
| 9 | Tiempo creación | Cumple/ajuste | v1 en 2–4 sem; piloto 1 NL |
| 10 | TCO | Cumple | Sección 9 |

---

## 8. Medibilidad (baseline → meta)

| Métrica | Baseline hoy | Meta v1 | Meta v2 |
|---------|--------------|---------|---------|
| Horas por NL (total) | 6–10 h | ≤ 4 h (−40% mín.) | ≤ 3 h |
| Horas solo copys | ~2–3 h | ≤ 0,5 h (agente + QA) | ≤ 0,4 h |
| Horas prompts portada | ~1–1,5 h | ≤ 0,3 h | ≤ 0,25 h |
| Rondas ajuste portada | 2–4 | ≤ 2 | ≤ 2 |
| Rondas ajuste carrusel | 2–4 | ≤ 2 (v2) | ≤ 2 |
| NL/mes sin sumar FTE | 1 | 2 | 3–4 |
| % etapas con estado en JSON | ~0% | 100% | 100% |

**ROI v1 (orden de magnitud):**  
Ahorro 4 h/NL × 1 NL/mes × 12 = **48 h/año**. Si la hora operativa ≈ CLP $15.000 → **≈ CLP $720.000/año** solo en un NL/mes; con 2 NL/mes se duplica. Costo desarrollo v1 (sección 9) se recupera en &lt; 1 año operativo.

**KPIs en consolidado:** `hrsReales`, `rondasAjuste`, `vb*En`, `estado` por etapa.

---

## 9. TCO estimado (v1)

| Ítem | Costo / nota |
|------|----------------|
| Desarrollo HTML+JSON+agente Copys/Portada | 2–4 semanas · 1 persona (ya parcialmente hecho) |
| Licencia Cursor | Ya en uso |
| Midjourney | Ya en uso (sin cambio) |
| Canva | Ya en uso (sin cambio) |
| Infra nueva / APIs | **$0 en v1** |
| Mantenimiento | ~2 h/mes dueño ECR-CM (reglas JSON) |
| Riesgo | Bajo: no toca cliente ni credenciales cloud |

---

## 10. Escalabilidad (respuesta al gate)

- **Más volumen:** agregar objetos en `newsletters[]`; el HTML no cambia.  
- **Más clientes con mismo patrón:** clonar schema consolidado (como Sheets SEO por marca).  
- **Horas humanas:** crecen en MJ/Canva/VB, **no** en redacción de copys/prompts (esa parte es O(1) por NL vía agente).  
- **Sin rediseño** al pasar de 1 → 4 NL/mes: solo capacidad de 1 operadora de montaje.

---

## 11. Fases (roadmap honesto)

| Fase | Alcance | Autonomía | Esfuerzo |
|------|---------|-----------|----------|
| **v1 (descongelar)** | Consolidado JSON+HTML · Copys A/B · 3 prompts portada · estados VB · observaciones solo si aplica | Alta en texto/prompt | 2–4 semanas |
| **v2** | Prompts carrusel + borrador textos slides desde artículo (Tito = QA, no cuello) | Media-alta | +4–6 semanas |
| **v3** | Checklist video + plantilla animación; publicar sigue humano | Asistida | +2–3 semanas |

---

## 12. Criterios de éxito piloto (1 NL)

1. Copys A/B ×3 en &lt;15 min QA vs FORMATO-COPYS.  
2. ≥1 fondo portada usable ≤3 intentos MJ.  
3. 100% etapas con estado + timestamp en JSON.  
4. Cero loops de ajuste abiertos sin observación.  
5. `hrsReales` ≤ 4 h documentadas.  
6. Dueño mantenimiento asignado (`rol-ecr-cm`).

---

## 13. Decisión pedida a MOVA

| Veredicto | Significa |
|-----------|-----------|
| **Sí — descongelar v1** | Aprobar playbook Copys+Portada+consolidado; piloto 1 NL con KPIs §8 |
| **Sí — v1 con condiciones** | Igual + checklist seguridad/trazabilidad firmado |
| **Mantener congelado** | Falta evidencia numérica tras piloto |
| **Bloqueo** | No aplica si se acepta autonomía parcial definida en §3.1 |

**Entregables de la reevaluación:** veredicto · score estimado · top riesgos residuales · OK/NO a definir autonomía como “producción sin redacción humana”.

---

## 14. Invocación

```
@mova
Reevaluar ECR-NL v2 según:
index/clientes/ecr/newsletter/BRIEF-FACTIBILIDAD-ECR-NL-FLUJO-MOVA.md
JSON/HTML: index/clientes/MKOF/MOVA/ecr-nl/

Contexto: corrige gates Autonomía, Escalabilidad y Medibilidad del veredicto Congelado 45%.
Entregar: nuevo score estimado + veredicto descongelar v1 sí/no + riesgos residuales.
```

---

## 15. Referencias

| Recurso | Ruta |
|---------|------|
| Este brief v2 | `index/clientes/ecr/newsletter/BRIEF-FACTIBILIDAD-ECR-NL-FLUJO-MOVA.md` |
| HTML MOVA | `index/clientes/MKOF/MOVA/ecr-nl/index.html` |
| JSON consolidado | `index/clientes/MKOF/MOVA/ecr-nl/ecr-nl-flujo.json` |
| Formato copys | `newsletter/copys/FORMATO-COPYS-ECR.md` |
| Base portadas | `newsletter/BASE-ESTILO-PORTADAS.md` |
| Patrón consolidado SEO (referencia método) | Word *Consolidados SEO — Información para automatizar* |
| Evaluación previa | Congelado 45% · proyecto_mayor · impacto 8 |
