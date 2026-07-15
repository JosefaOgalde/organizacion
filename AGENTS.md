# AGENTS.md

## Cursor Cloud specific instructions

### ECR — Prompt Midjourney de portada
- Los prompts Midjourney de ECR son **solo para la imagen de fondo** de la portada del newsletter LinkedIn.
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

### Servidor local
- `node scripts/organizacion-server.js` → puerto 3000.
- Si el puerto está ocupado (`EADDRINUSE`), matar el proceso previo antes de relanzar.
- Para forzar datos de disco en el organizador: `?disco=1` (evita localStorage viejo).
