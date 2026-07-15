# AGENTS.md

## Cursor Cloud specific instructions

### ECR — Prompt Midjourney de portada
- Los prompts Midjourney de ECR son **solo para la imagen de fondo** de la portada del newsletter LinkedIn.
- Flujo: la usuaria entrega PDF/DOCX (o título) → se pulsa generar → el **mundo visual se define automáticamente** según el contenido y queda **incluido en el prompt** (`visual world "…": …`).
- No pedir selección manual de mundo visual antes de generar.
- Siempre entregar **3 opciones** de prompt por artículo.
- **No incluir** al final del prompt: `--ar 1.91:1 --style raw --v 6.1 --no text, typography, letters, logo, watermark, signage, UI words, brand marks` (Midjourney no los lee en este flujo).
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

### Portal clientes — Nueva tarea
- En cada landing de cliente (`portal-cliente.js`) hay un botón **Nueva tarea** arriba en la toolbar.
- La tarea hereda `clienteId`, abreviatura en el título (`[ECR] …`), color del organizador y el siguiente `numeroHistorico` del cliente.
- Al guardar se escribe en `localStorage` (`organizacion_v2`) y se publica a `data/organizacion-live.json` vía `POST /api/organizacion`.
- Ver en organizador: `http://localhost:3000/index.html?disco=1` (o `?disco=1&tarea=ecr/04`).
