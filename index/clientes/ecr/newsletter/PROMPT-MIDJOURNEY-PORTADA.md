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

1. **Cargar el PDF/DOCX del artículo** en la landing (o pedir/escribir el nombre si no hay archivo).  
2. El sistema **lee el texto**, sugiere el título y el mundo visual A–P.  
3. Une título/temática + la **base de estilo guardada** y muestra el prompt.

`http://localhost:3000/index/clientes/ecr/` → sección **Portada Midjourney**

Formatos: **PDF** (recomendado), **DOCX**, **TXT**. El `.doc` antiguo no se lee: convertir a PDF/DOCX.

Archivo de la UI: [`ecr-portada-prompt.js`](./ecr-portada-prompt.js)

## Persistencia (obligatorio)

Cada prompt/resultado generado o entregado queda en:

- [`historial-portadas.json`](./historial-portadas.json)
- [`HISTORIAL-PORTADAS.md`](./HISTORIAL-PORTADAS.md)
- carpeta [`portadas-guardadas/`](./portadas-guardadas/)

La landing también guarda al generar (API `/api/ecr-portada-historial` + localStorage).

---

## Bloque BASE (siempre; sin flags Midjourney)

```
ONLY a LinkedIn newsletter cover BACKGROUND image (not a finished cover): Editorial illustration background for ECR Capacitacion brand system, empty reserved space for later text overlay in Canva, NO text, NO logos, NO letters, NO watermarks, NO typography layout, modern corporate flat vector illustration with depth, stylized faceless characters, clean geometric shapes, high-contrast complementary palette of warm orange/amber (#E85D04 family) and deep teal/navy blue, generous negative space for later headline overlay, professional Chilean corporate learning mood, polished editorial composition, wide landscape
```

## Prompt final

Se arman **3 opciones** cuando el usuario entrega el **nombre del artículo**:

`BASE` + escena del mundo visual + concepto del título  

**Sin** `--ar` / `--style` / `--v` / `--no …`.

El resultado de Midjourney es **solo el fondo**; el armado final de portada (título, subtítulo, branding) es en Canva.

---

## Checklist antes de generar

- [ ] Nombre del artículo confirmado por el usuario  
- [ ] 3 opciones distintas  
- [ ] Prompt pide **solo fondo** (no portada final)  
- [ ] Sin flags Midjourney al final del prompt  
- [ ] Sin texto / sin logos en el prompt  
- [ ] Espacio negativo para título en Canva después  
