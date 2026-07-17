# Prompt Midjourney — Portada newsletter ECR

**Alcance fijo:** el prompt genera **solo la imagen de fondo** de la portada.  
No genera tipografía, logo, ni la portada terminada. El título/logo se montan después en Canva.

**Siempre 3 opciones** de prompt por artículo.  
**No incluir flags** `--ar` / `--style` / `--v` / `--no …` en el texto del prompt: en este flujo Midjourney **no los lee**.

Ver siempre primero: [`BASE-ESTILO-PORTADAS.md`](./BASE-ESTILO-PORTADAS.md)  
(ADN visual de referencia: solo fondos, sin textos ni logos).

**Referencia de tamaño LinkedIn (fuera del prompt):** ~1200×627  
**Ignorar siempre en refs:** logo ECR GROUP + tipografías.

---

## Flujo (obligatorio)

1. La usuaria **entrega el PDF/DOCX** (o escribe el nombre del artículo).  
2. Pulsa **Generar prompt**.  
3. El sistema **define el mundo visual** según el contenido y entrega **3 opciones**.  
4. Se copia **solo** el bloque del prompt (botón **Copiar**).  
5. Se guarda en el historial.

No se elige el mundo visual a mano antes de generar.

`http://localhost:3000/index/clientes/ecr/` → sección **Portada Midjourney**

Formatos: **PDF** (recomendado), **DOCX**, **TXT**. El `.doc` antiguo no se lee: convertir a PDF/DOCX.

Archivo de la UI: [`ecr-portada-prompt.js`](./ecr-portada-prompt.js) (`?v=10` o superior).

## Persistencia (obligatorio)

Cada prompt/resultado generado o entregado queda en:

- [`historial-portadas.json`](./historial-portadas.json)
- [`HISTORIAL-PORTADAS.md`](./HISTORIAL-PORTADAS.md)
- carpeta [`portadas-guardadas/`](./portadas-guardadas/)

La landing también guarda al generar (API `/api/ecr-portada-historial` + localStorage).

---

## Qué NO debe ir en el prompt pegable

Si Midjourney pinta tipografía en camiones/paredes, casi siempre es porque el prompt incluía uno de estos triggers:

- Nombre de marca (`ECR`, `Capacitacion`, etc.)
- Frases en español (título del artículo, nombre del mundo visual)
- Hex de color (`#E85D04`, `family`)
- Wording de “LinkedIn cover / newsletter cover / headline overlay”

La paleta naranja/teal se describe **en palabras** (`warm orange and amber… deep teal and navy`), nunca con códigos.

---

## Bloque BASE (siempre; sin flags Midjourney)

Fuente de verdad: constante `BASE` + `ANTITEXT` en `ecr-portada-prompt.js`.

```
Pure editorial flat-vector BACKGROUND ILLUSTRATION ONLY, glyphless and anepigraphic, modern corporate illustration with depth, stylized faceless characters, clean geometric shapes, warm orange and amber accents with deep teal and navy, large empty unmarked negative space as blank sky or solid color block, polished professional composition, wide landscape
```

Cierre anti-tipografía (va al final de cada opción):

```
critical: the entire image has zero text of any language, zero letters, zero numbers, zero hex codes, zero logos, zero wordmarks, zero watermarks, zero captions, zero street signs with writing, zero UI labels; every vehicle has solid blank unmarked side panels with no graphics, no fleet names, no slogans; walls boxes screens and maps are unlabeled abstract shapes only
```

## Prompt final

`BASE` + `scene:` (inglés) + `thematic mood:` + `ANTITEXT`  

**Sin** `--ar` / `--style` / `--v` / `--no …`.

El resultado de Midjourney es **solo el fondo**; el armado final de portada (título, subtítulo, branding) es en Canva.

---

## Checklist antes de generar

- [ ] Prompt en inglés de escena (sin título ES ni marca)
- [ ] Sin hex codes
- [ ] Sin “LinkedIn / cover / headline”
- [ ] Vehículos descritos como paneles lisos en blanco (blank side panels)
- [ ] Copiado con el botón **Copiar** de la UI (no seleccionar el título de la opción)
