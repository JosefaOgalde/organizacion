# AGENTS.md

## Cursor Cloud specific instructions

### Flujo diario unificado (obligatorio)
- **Mismos pasos en cualquier PC:** `git pull` → `ABRIR-LARAVEL.bat` → solo `http://127.0.0.1:8000/…`
- Guía: `docs/laravel/EN-CUALQUIER-PC.md` y `docs/laravel/UNIFICADO.md`
- **Stack:** Laravel + SQLite. Sin Laragon app, MySQL, Node, puerto 3000, `file://`.
- Organizador: `http://127.0.0.1:8000/index.html`
- API clientes: `http://127.0.0.1:8000/api/clientes`
- API calendario: `http://127.0.0.1:8000/api/organizacion`
- **Fuentes de verdad:** `data/organizacion-live.json` + `backend/database/database.sqlite` (localStorage solo caché).
- PHP: se puede usar `php.exe` de Laragon sin abrir la app.
- Respaldo base: `data/organizacion-respaldo-2026-07-17.json` → live al arrancar si falta.

### Separación de herramientas por cliente (obligatorio)
- **Trendseeker (TS)** — cualquier marca o producto que manejen, y en especial **prompts de videos / piezas de producto**: siempre **Gemini** (con fotos de producto como referencia). Nunca Midjourney para TS.
- **ECR** — prompts de **portada newsletter** (solo fondo): siempre **Midjourney** (flujo en `index/clientes/ecr/newsletter/`). No mezclar con Gemini ni con el estilo de prompts de TS.
- Si hay duda: TS → Gemini · ECR portadas → Midjourney.

### Trendseeker — Prompts Gemini (producto / video)
- Carpeta: `index/clientes/trendseeker/prompts/` (ver `README.md`).
- Flujo: fotos de producto primero → prompt en español orientado a **Gemini VIDEO** → priorizar fidelidad al producto.
- Videos TS: el prompt debe pensarse para Gemini **video** desde el inicio (si Gemini dice que solo genera videos, usar brief de video, no de imagen fija).
- Ejemplo vigente: `PROMPT-botas-rojas-lluvia.txt` (Hunter rojas, lluvia, jeans dentro, sin piel; detalle parche HUNTER / hebilla / suela zigzag).
- Landing: `http://localhost:3000/index/clientes/trendseeker/` muestra **Registro Trendseeker**, **Contenidos 7–12** (madres + subtareas) y biblioteca `prompts/indice.json` (Gemini).
- Serie mensual TS: cada contenido = madre + Prompt Gemini video + Copys + Programar. Script: `node scripts/add-ts-contenidos-7-12.js` (C7 vie AM · C8 vie PM · C9 lun · C10 mié · C11 vie · C12 lun).
- Prompts C7–C12: tres TXT independientes por contenido (`…-A.txt`, `…-B.txt`, `…-C.txt`). En la UI: **Copiar · Guardar · Mejorar** por versión. Mejorar abre el chat y deja entrada en `historialEntregables` (visible en la tarea y en la landing TS). Regenerar: `node scripts/generar-ts-prompts-contenidos-7-12.js` (`FORCE=1` sobrescribe).
- Copys C7–C12: igual en `copys/` con los mismos botones. Script: `node scripts/generar-ts-copys-contenidos-7-12.js` o `node scripts/refresh-ts-entregables-7-12.js`.
- Al crear prompts/entregables TS: registrar en la tarea (`entregableArchivo`) y en `prompts/indice.json` para que aparezcan en el link del cliente.
- **Videos en tareas:** en el detalle de la tarea → **+ Subir video** (MP4/WebM, hasta ~120 MB). API `POST /api/tarea-archivo` guarda en `index/uploads/tarea-videos/…` (gitignored). Copys de video: `index/clientes/trendseeker/copys/` (ej. botas Hunter Rojo Militar, tarea #04).

### ECR — Prompt Midjourney de portada
- Los prompts Midjourney de ECR son **solo para la imagen de fondo** de la portada del newsletter LinkedIn.
- Flujo: la usuaria entrega PDF/DOCX (o título) → se pulsa generar → se eligen **3 mundos** con ranking temático del texto (keywords con peso; no terna fija F·L·H).
- El mundo se muestra en la UI; **dentro del prompt pegable a Midjourney** solo va la escena en inglés (sin nombre de mundo en español ni marca ECR), porque si se incluyen Midjourney los dibuja como tipografía/logo.
- **Gotcha:** si la imagen sale con tipografía en camiones (p. ej. “Logística urbana limpia” o `#E85D04 family`), el prompt pegado es el **antiguo**. Usar botón **Copiar** de la UI con `ecr-portada-prompt.js?v=8+` (hard refresh). No pegar hex ni “LinkedIn cover”. Cada opción termina con bloque `ANTITEXT` (paneles de vehículo lisos).
- En el prompt **no poner**: nombres de marca (ECR), “LinkedIn cover”, títulos en español entre comillas, ni pedir “overlay de headline”.
- Siempre entregar **3 opciones** de prompt por artículo.
- **No incluir** al final del prompt: `--ar 1.91:1 --style raw --v 6.1 --no text…` (en este flujo Midjourney no los lee).
- No generan tipografía, logo ni la portada terminada; el título/branding se monta después en Canva.
- Base y UI: `index/clientes/ecr/newsletter/` (`BASE-ESTILO-PORTADAS.md`, `PROMPT-MIDJOURNEY-PORTADA.md`, `ecr-portada-prompt.js`).
- Landing: `http://localhost:3000/index/clientes/ecr/` → sección **Portada Midjourney**.
- **Persistencia obligatoria:** cada resultado/prompt que la usuaria entregue o que se genere debe quedar en:
  - `index/clientes/ecr/newsletter/historial-portadas.json`
  - `index/clientes/ecr/newsletter/HISTORIAL-PORTADAS.md`
  - un archivo en `index/clientes/ecr/newsletter/portadas-guardadas/`
- La UI también guarda vía `POST /api/ecr-portada-historial` y en `localStorage`.
- Nunca descartar un prompt/resultado de portada sin archivarlo en ese historial.

### ECR — Rutas de aprendizaje
- Modal finalizado. HTML para Elementor: `index/clientes/ecr/capacitaciones/modal-ruta-sectores.html`.
- Solo Excel/Power BI unificados (`Excel - Nivel` / `Power BI - Nivel`); resto de nombres literales.
- Organizador: `node scripts/add-ecr-rutas-viernes.js` y abrir `http://localhost:3000/index.html?disco=1`.
- Ecosistema NL 1 ago (viernes): madre + subtareas Copys/Portada/Carrusel/Video. Script: `node scripts/add-ecr-ecosistema-nl-agosto.js` → `?disco=1`. Copys TXT: `newsletter/COPY-ART23-equipos-en-terreno.txt`. Landing ECR muestra sección **Ecosistema NL 1 agosto**.

### Portal clientes — Nueva tarea
- En cada landing de cliente (`portal-cliente.js`) hay un botón **Nueva tarea** arriba en la toolbar.
- La tarea hereda `clienteId`, abreviatura en el título (`[ECR] …`), color del organizador y el siguiente `numeroHistorico` del cliente.
- Al guardar se escribe en `localStorage` (`organizacion_v2`) y se publica a `data/organizacion-live.json` vía `POST /api/organizacion`.
- Ver en organizador: `http://localhost:3000/index.html?disco=1` (o `?disco=1&tarea=ecr/04`).
- **Imágenes en tareas:** en el detalle de la tarea, bloque **Imágenes de la tarea** → `+ Guardar imágenes`. Se comprimen y suben a disco vía `POST /api/tarea-imagen` (`index/uploads/tarea-imagenes/…`); en `localStorage` solo queda la **URL** (evita “almacenamiento lleno”). Landing del cliente: sección **Tareas con imágenes**. Requiere `node scripts/organizacion-server.js` corriendo.

### Impresoreando — Panel socios 50/50
**Antes de tocar nada:** leer `docs/impresoreando/CONTEXTO.md` (fuente única: rutas, deuda, pedidos, SKUs, ventas I00000n, historial, status correo, checklist). **No reexplorar** `panel.js` ni el seed salvo bug concreto.
Resumen 1 línea: panel `…/impresoreando/panel/` · live `data/impresoreando-live.json` · API `/api/impresoreando` · pedidos `PED-00n` · ventas `I00000n` · historial · solo ventas bajan deuda · PLA+ negro `$17986/kg`.
**Cliente nuevo:** mínimo **nombre** + **origen** (SIE = trabajo Nico · MKOF = trabajo Josefa). Puede haber segundo nombre. **No** auto-agregar SIE (solo migración histórica). Sin SKU → generar; sin costo → pedir imagen.
**Frases gatillo:** «pedidos e impresoreando» → pedir nombre+origen+ítems+precio. «calcular costo producto impresoreando» → pedir imagen. Estado de pedidos visible en Resumen.
