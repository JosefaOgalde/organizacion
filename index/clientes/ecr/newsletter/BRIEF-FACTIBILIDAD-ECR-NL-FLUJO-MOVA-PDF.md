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

**Meta v1:** ≤ 4 hrs/NL (−40% mín.) · **ROI est.:** ~CLP $720.000/año a 1 NL/mes.

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

## 5. Factibilidad por principio MOVA (autoevaluación)

| # | Principio | Score esperado | Cómo se cumple |
|---|-----------|----------------|----------------|
| 1 | Sustracción | Cumple | Menos memoria, menos loops sin observación, un consolidado |
| 2 | Seguridad info | Cumple/ajuste | Estados y archivos en repo; sin credenciales en JSON; VB con timestamp |
| 3 | Interoperabilidad | Cumple/ajuste | Contratos prompt/asset/estado; no API opaca en v1 |
| 4 | Autonomía | Cumple parcial | Autonomía de *producción* (texto/prompt/estado); ejecución MJ/Canva humana acotada |
| 5 | Tiempo ejecución | Cumple | Meta ≤4 hrs/NL; loops condicionales |
| 6 | Agilidad uso | Cumple | Reglas en FORMATO-COPYS + BASE estilo (ya cumplió) |
| 7 | Escalabilidad | Cumple | N registros JSON / mismo HTML; horas humanas sublineales |
| 8 | Medibilidad | Cumple | Baseline 6–10 h → meta ≤4 h; ROI ~CLP $720k/año; KPIs en JSON |
| 9 | Tiempo creación | Cumple/ajuste | v1 en 2–4 sem; piloto 1 NL |
| 10 | TCO | Cumple | Infra/APIs nuevas $0; licencias ya en uso; mant. ~2 h/mes |
