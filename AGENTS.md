# AGENTS.md

## Cursor Cloud specific instructions

Este repo es una app web **estática** (organizador semanal en español) servida por un
servidor HTTP de Node **sin dependencias externas** (solo módulos nativos de Node). No hay
`package.json`, ni `node_modules`, ni paso de build, ni linters, ni tests automatizados.

### Servicios y cómo correrlos

- **Organizador + portal de clientes (único servicio):**
  - Ejecutar: `node scripts/organizacion-server.js` (ver `SERVIR.bat`).
  - Escucha en `PORT` (por defecto `3000`) y solo en `HOST=127.0.0.1` por defecto. Ajustables vía `.env` (ver `.env.example`).
  - URLs: `http://localhost:3000/index.html` (organizador) y `http://localhost:3000/index/clientes/` (portal).
  - `SERVIR.bat` primero corre `node scripts/sync-respaldo-auto.js` (copia el respaldo más reciente a `data/organizacion-live.json`); en un repo limpio no hay respaldos con PII, así que ese paso es opcional.

### Notas no obvias

- **PC local (Windows):** usuario de trabajo **`Josefa Ogalde`** (no `josef`). Repo: `C:\Users\Josefa Ogalde\organizacion`. Descargas: `C:\Users\Josefa Ogalde\Downloads\`. Rutas con espacio → entre comillas en PowerShell/CMD.
- **Importar respaldo:** `IMPORTAR-RESPALDO.bat "C:\Users\Josefa Ogalde\Downloads\organizacion-respaldo-YYYY-MM-DD.json"` → luego `ABRIR-ORGANIZADOR.bat` y `http://localhost:3000/index.html?disco=1` + Ctrl+Shift+R.
- **Persistencia:** los datos se guardan en `localStorage` del navegador. La API opcional `POST/GET /api/organizacion` escribe/lee `data/organizacion-live.json` (gitignoreado, contiene PII — no commitear).
- **Gotcha de calendario:** una tarea creada sin `Hora inicio` y `Hora fin` se guarda pero **no aparece** en las vistas de calendario (Mes/Semana/Día). Para verla en el grid hay que darle horas.
- **`ORGANIZACION_TOKEN`** en `.env` es opcional; si se define, la API exige la cabecera `X-Organizacion-Token`.
- No hay comandos de lint/test/build. La validación es manual (abrir la app y crear/mover tareas) o con `curl` contra la API.
- Los scripts `scripts/*.py` son utilidades auxiliares de datos (seeds/scraping), no parte del servicio principal.
