# Brief de factibilidad · CRC (Carga Recetas Cencosud) como herramienta SEO

**Código:** CRC  
**Ámbito:** Herramientas (HER) · candidato a catálogo **SEO MOVA**  
**Fecha:** 2026-08-07  
**Estado:** prototipo interno (parser Word + esqueleto Playwright); **sin login BM en esta etapa**  
**Restricción dura:** **cero cambios** de estructura, desarrollo, CMS o proceso pedidas al cliente  

**Evaluación sugerida:** `@mova` · registrar en https://acme-chile.cl/mova/seo/ si se aprueba  
**Invocar operativo:** `@herramientas` · Proyecto CRC  

---

## 1. Resumen ejecutivo

Hoy la carga de recetas a Business Manager Cencosud (`business-manager.ecomm.cencosud.com`) es **manual**: una operadora con acceso toma un Word ya redactado (formato editorial Jumbo) y lo transcribe campo a campo en la interfaz del BM hasta publicar (contenido que termina en espacios tipo `jumbo.cl/recetas`).

**Propuesta:** herramienta interna que, **sin pedirle nada al cliente**:

1. Lee el Word que ya usamos nosotros.  
2. Extrae y estructura la información (título, SEO meta, tiempos, tags, ingredientes, pasos, tips).  
3. En un segundo momento (en la PC de la operadora), abre el BM con **nuestras** credenciales y completa el formulario / publica.

El cliente sigue igual: no cambia plantillas Word, no usa APIs nuevas, no desarrolla, no abre el BM.

**Pregunta a MOVA:** ¿vale incorporarlo al catálogo de automatizaciones SEO (junto a Apify y similares) como herramienta de **productividad de publicación de contenido recetas**?

---

## 2. Problema (dolor real)

| Hoy | Impacto |
|-----|---------|
| Copiar/pegar desde Word al BM | Tiempo humano por receta, errores de omisión (meta SEO, tags, tips) |
| Formato Word ya incluye meta título/descripción | Si se carga mal, se pierde señal SEO on-page |
| Publicación depende 100% de una persona frente al formulario | No escala si el volumen de recetas sube |
| No hay API pública de “recetas” en BM | No existe integración oficial “limpia” documentada para este contenido |

No es un problema de “el cliente no tiene Word”: **nosotros** tenemos el Word y los accesos. El cuello de botella es la **carga repetitiva** en una UI cerrada (ADFS).

---

## 3. Objetivo del proyecto

| Objetivo | Medición tentativo |
|----------|-------------------|
| Reducir tiempo de carga por receta | De “transcripción completa” a “revisar + confirmar” |
| Conservar fidelidad SEO del Word (meta title/description, slug, tags) | Checklist post-carga vs Word |
| Cero fricción al cliente | Ningún ticket de cambio de estructura/desarrollo |
| Dejarlo evaluable como herramienta SEO MOVA | Brief + evidencia de prueba en seco / piloto interno |

---

## 4. Fuera de alcance (explícito)

- Pedir al cliente APIs, webhooks, campos nuevos en BM, cambios en VTEX/Jumbo, permisos IT adicionales más allá de la cuenta que **ya** usamos.  
- Hostear credenciales en la nube / repo / chat.  
- Scraping desde servidores cloud del agente (ADFS/MFA debe ser **local** en la PC de la operadora).  
- Sustituir la estrategia editorial de recetas (solo automatiza la **carga**).  
- Garantizar SKUs de productos del carro si el BM los exige y el Word no los trae (queda como paso humano o búsqueda posterior).

---

## 5. Principio de diseño: “el cliente no se entera”

```
[Word editorial actual] → (nosotros) parser → JSON interno
                                      ↓
                         (nosotros) login BM local
                                      ↓
                         formulario BM rellenado / publicado
                                      ↓
                         contenido visible en sitio (ej. Jumbo/recetas)
```

- Misma fuente de contenido de siempre (Word).  
- Mismos accesos de siempre (usuario BM de la operadora).  
- Misma URL pública de destino.  
- **Ningún** cambio de proceso pedido al cliente.

---

## 6. Qué existe ya en el repo (evidencia)

| Pieza | Ubicación | Estado |
|-------|-----------|--------|
| Carpeta proyecto CRC | `index/clientes/Herramientas/carga-recetas-cencosud/` | Hecho |
| Hub portal | `index/clientes/Herramientas/Carga-recetas.html` | Hecho |
| Schema JSON | `schema-receta.json` | Hecho |
| Parser Word (formato Jumbo) | `scripts/parse-receta-word.py` | Hecho · probado con *Anticuchos de verduras con chimichurri* |
| Exploración BM local (Playwright) | `scripts/explorar-bm-cencosud.py` | Hecho · **pendiente prueba real en PC** |
| Relleno/publicación | `scripts/publicar-receta-cencosud.py` | Hecho · depende de mapa de selectores tras 1ª sesión BM |
| Credenciales | `secrets/.env` (gitignored) | Plantilla `env.example` |
| Agente | `@herramientas` · Proyecto CRC | Hecho |

**Prueba de parser (2026-08-07):** Word Jumbo → JSON `listo-para-cargar` con título, meta SEO, 35 min / fácil / 4 porciones, 6 tags, 14 ingredientes, 4 pasos, 3 tips. Falta típica: `skuCencosud` (no viene en el Word).

---

## 7. Análisis de factibilidad

### 7.1 Factibilidad técnica

| Factor | Evaluación | Notas |
|--------|------------|-------|
| Extracción desde Word `.docx` | **Alta** | Formato Jumbo ya soportado (meta + barra + tags + paso a paso) |
| Completar UI BM sin API | **Media** | Playwright local; depende de estabilidad de selectores DOM |
| Login ADFS / MFA | **Media–baja automatizable** | Viable con navegador **headed** + login manual/MFA una vez + reutilizar `bm-session.json` |
| Publicación end-to-end sin humano | **Media** | Primer mapeo humano obligatorio; luego dry-run → publicar |
| SKUs / link a productos carro | **Baja–media** | Si el BM obliga SKU, sigue habiendo un paso (búsqueda o tabla interna nuestra) |
| Sin cambios al cliente | **Alta** | Cumple por diseño |

### 7.2 Factibilidad operativa

- Corre en la **PC de la operadora** (Windows), no en un bot 24/7 en la nube.  
- Requiere Python + Playwright instalados (ya avanzado en setup local).  
- Mantenimiento: si Cencosud rediseña el formulario BM, hay que **re-mapear selectores** (`explorar-bm-cencosud.py`), no pedir desarrollo al cliente.  
- Riesgo de ToS / política interna Cencosud sobre automatización de UI: **validar con criterio del equipo** (uso de cuenta propia para acelerar trabajo ya autorizado).

### 7.3 Factibilidad SEO (ángulo MOVA)

| Señal SEO | Cómo ayuda CRC |
|-----------|----------------|
| Meta title / meta description | El Word ya los trae; el parser los preserva → menos olvidos al cargar |
| Consistencia de slugs / títulos H1 | JSON genera `slugSugerido` alineado al título |
| Tags / categorías / intención (vegetariano, parrilla…) | Se extraen de `Tags:` del Word |
| Velocidad de publicación de contenido evergreen (recetas) | Más URLs/contenido indexable en menos tiempo operativo |
| Calidad vs volumen | El humano pasa a **QA** (revisar dry-run) en vez de teclear |

**No es** un crawler SEO ni un rank tracker. Es una **automatización de publishing** de contenido con impacto SEO indirecto (cobertura y fidelidad on-page). Encaja en el anaquel MOVA SEO como *herramienta de operaciones de contenido*, junto a otras automatizaciones (p. ej. Apify), no como sustituto de auditoría técnica.

### 7.4 Riesgos y mitigaciones

| Riesgo | Mitigación |
|--------|------------|
| ADFS/MFA bloquea headless | Solo headed + sesión guardada local |
| DOM BM cambia | Script de re-exploración; dry-run obligatorio |
| Publicar mal una receta | Default `CENCOSUD_BM_DRY_RUN=true`; revisión visual |
| Credenciales filtradas | Solo `secrets/` gitignored; nunca chat/GitHub |
| Expectativa de “cero clics” | Comunicar: 1 mapeo + QA por lote |
| SKUs faltantes | Campo en `camposFaltantes`; proceso opcional nuestra, no del cliente |

### 7.5 Esfuerzo relativo (sin calendarios)

| Bloque | Invasividad | Dependencias |
|--------|-------------|--------------|
| Parser Word → JSON | Baja (ya hecho) | Ninguna del cliente |
| Mapa BM + relleno | Media | 1 sesión real en PC con acceso BM |
| Piloto 5–10 recetas + checklist SEO | Baja–media | Operadora |
| Ficha en catálogo SEO MOVA | Baja | Aprobación `@mova` / equipo |
| Hardening (reintentos, log, batch) | Media | Solo si el piloto funciona |

---

## 8. Criterios de éxito del piloto (propuesta)

1. ≥ 5 recetas Word → JSON sin pérdida de meta title/description/tags.  
2. Tras un mapeo BM: ≥ 80 % de campos del formulario rellenados en dry-run sin edición manual.  
3. 0 solicitudes de cambio enviadas al cliente.  
4. Checklist SEO post-publicación (meta, H1, tags, pasos visibles) OK en muestra.  
5. Tiempo percibido de carga claramente menor que copia manual (anotar antes/después en 3 piezas).

---

## 9. Decisión pedida a MOVA

**¿Incorporar CRC al inventario de herramientas SEO MOVA** (documentada en `acme-chile.cl/mova/seo/` o equivalente interno) como:

> *Automatización interna de carga de recetas (Word → Business Manager Cencosud) orientada a fidelidad SEO on-page y velocidad de publicación, sin cambios al cliente.*

Opciones de veredicto:

| Veredicto | Significa |
|-----------|-----------|
| **Sí — catálogo SEO** | Ficha en SEO MOVA + dueño + rutina de mantenimiento de selectores |
| **Sí — laboratorio HER** | Sigue en Herramientas; MOVA solo referencia el enlace |
| **No por ahora** | Parser útil internamente; no priorizar publicación automática |
| **Bloqueo** | Riesgo ADFS/ToS / prioridad baja frente a otras automatizaciones |

---

## 10. Preguntas abiertas (para la evaluación, no para el cliente)

1. ¿El módulo exacto de “recetas” en BM es estable y único por bandera (Jumbo vs otras)?  
2. ¿La publicación exige obligatoriedad de SKUs/productos del catálogo?  
3. ¿Hay política interna que prohíba RPA/Playwright sobre BM?  
4. ¿Quién mantiene selectores si el DOM cambia (HER vs equipo SEO MOVA)?  
5. ¿Volumen mensual estimado de recetas nuevas/actualizadas?

---

## 11. Recomendación preliminar (equipo HER)

**Factible como herramienta interna** con alto cumplimiento del constraint “cero cambios al cliente”.  
**Factible como ítem SEO MOVA** si se acepta que el valor SEO es **operacional** (publicar bien y más rápido contenido on-page), no analítica.  

Siguiente paso técnico (cuando se retome el BM, en la PC local): una sesión `explorar-bm-cencosud.py` + dry-run de Anticuchos.  
Siguiente paso de gobernanza: veredicto `@mova` según sección 9 y, si aplica, ficha en el hub SEO.

---

## 12. Referencias rápidas

| Recurso | Ruta / URL |
|---------|------------|
| Este brief | `index/clientes/Herramientas/carga-recetas-cencosud/BRIEF-FACTIBILIDAD-CRC-SEO.md` |
| README operativo | `…/carga-recetas-cencosud/README.md` |
| Mapa campos | `…/MAPA-CAMPOS-BM.md` |
| BM | https://business-manager.ecomm.cencosud.com/ |
| Recetas públicas (ref.) | https://www.jumbo.cl/recetas |
| Hub SEO MOVA (catálogo) | https://acme-chile.cl/mova/seo/ |
| Agente HER | `@herramientas` |
| Agente MOVA | `@mova` |
