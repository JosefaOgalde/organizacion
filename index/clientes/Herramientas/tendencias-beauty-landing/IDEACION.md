# Ideación · Tendencias beauty → brief de landing

Espejo de **Tendencias recetas · Chile**, adaptado al servicio cotizado (cliente Maicao / beauty retail).

---

## 1. Servicio (lo que vende el equipo)

| Paso | Quién | Qué |
|------|--------|-----|
| 1 | Nosotros | Detectamos tendencia beauty (ej. skincare coreano, serum glow) |
| 2 | Nosotros | Recomendamos: “armá una landing sobre X” |
| 3 | Nosotros | Escribimos el **texto / brief** de la landing |
| 4 | Cliente | Programa, crea y diseña la landing |

Volumen: **1–3 tendencias/mes**.

---

## 2. Qué cambia vs recetas

| Recetas (TEND actual) | Beauty → landing (nuevo) |
|----------------------|---------------------------|
| Viral de comida Chile | Concepto beauty buscable / viral |
| Resumen de receta + ingredientes | Brief de landing (ángulo, copy, CTA, SEO) |
| Producción de contenido RRSS | Input para página web del cliente |
| Feed JSON de virales food | Feed JSON de tendencias beauty + plantilla brief |

Misma arquitectura mental: **feed curado + panel HTML en Herramientas + script de refresh**.

---

## 3. Herramienta propuesta (HER)

**Nombre:** Tendencias beauty · Chile (landing)  
**Código sugerido:** `TEND-BEAUTY` o proyecto bajo Herramientas  
**URL objetivo:** `…/Herramientas/Tendencias-beauty.html` (o `/tendencias-beauty/`)

### Qué muestra cada tarjeta

1. **Concepto** — ej. “Skincare coreano / glass skin”  
2. **Señal** — por qué está al alza (búsqueda, TikTok/IG, medios CL)  
3. **Encaje retail** — por qué sirve a una tienda beauty / Maicao  
4. **Recomendación** — sí/no landing + ángulo sugerido  
5. **Brief landing (exportable)**  
   - H1 / subtítulo  
   - Secciones (H2)  
   - Bullets de beneficios  
   - CTA  
   - Keywords / términos de búsqueda  
   - Texto intro ~120–180 palabras (borrador)  
6. **Fuentes** — links a evidencia  

### Datos

- Archivo: `data/tendencias-beauty-chile.json`  
- Script: `scripts/actualizar-tendencias-beauty.py` (mismo patrón que comida)  
- Seed inicial: 5–8 conceptos beauty con fuente verificable  

### Filtros del panel (como recetas)

- Período · red · prioridad · “listo para landing”  

---

## 4. Entregable operativo por tendencia (sin esperar la tool)

Plantilla mínima (también en `PLANTILLA-BRIEF-LANDING.txt`):

```
Tendencia:
Señal (por qué ahora):
Fuentes:
¿Conviene landing?: Sí / No — por qué
Ángulo de la landing:
H1:
Subtítulo:
Secciones (H2):
1.
2.
3.
Bullets beneficios:
-
CTA:
Keywords:
Borrador intro (texto):
Notas para diseño/dev del cliente:
```

Tiempo estimado: **2–3 h** la primera vez; **1,5–2,5 h** con herramienta.

---

## 5. Roadmap corto

| Fase | Qué | Esfuerzo |
|------|-----|----------|
| A | Cotizar con tiempos de `RESPUESTA-COTIZACION.txt` | Ya |
| B | Entregar 1 brief piloto (skincare coreano) a mano con plantilla | 2–3 h |
| C | Clonar panel Tendencias → beauty + JSON seed | ~1–1,5 días |
| D | Ritmo 1–3 briefs/mes usando el panel | 6–9 h/mes |

---

## 6. Ejemplo de conceptos (seed mental)

- Skincare coreano / rutina 10 pasos  
- Glass skin / glow serum  
- Retinol para principiantes  
- Protector solar coreano (UV beauty)  
- Skin cycling  
- Clean beauty / ingredientes limpios  

Cada uno → una landing potencial.

---

## Relación con lo ya hecho

- Portal: `index/clientes/Herramientas/Tendencias.html`  
- Feed: `data/tendencias-comida-chile.json`  
- Script: `scripts/actualizar-tendencias-comida.py`  
- Correo portable: `CORREO-tendencias-recetas-chile.txt`  

Reutilizar estilos (`tendencias-feed.css`, `tendencias-buscador.js`) cambiando nicho y campos del brief.
