# Seguridad — Organización

Guía para **no filtrar datos personales** (tareas, citas de salud, fichas de clientes, imágenes en base64) y mantener el proyecto solo en tu PC salvo lo que decidas subir a código.

---

## Qué datos son sensibles

| Dónde | Contiene |
|-------|----------|
| `localStorage` (`organizacion_v2`) | Todo el organizador: clientes, tareas, salud, imágenes |
| `data/organizacion-live.json` | Copia en disco (auto-guardado con SERVIR.bat) |
| `data/organizacion-respaldo-*.json` | Respaldos descargados con **↓ Respaldo** |
| `cla-certificados-emitidos` (localStorage) | Nombres en certificados CLA |

**No deben ir a GitHub** salvo plantillas vacías (`organizacion-respaldo-ejemplo.json`).

---

## Rutina segura (recomendada)

### 1. Servidor solo en tu PC

Siempre usa **`SERVIR.bat`** (no abras carpetas con `file://` ni `npx serve` para trabajo diario).

El servidor escucha solo en **`127.0.0.1`** — otras PCs de la red no pueden entrar.

### 2. Respaldos fuera de Git

- **↓ Respaldo** → guarda el JSON en una carpeta segura (OneDrive cifrado, disco externo, etc.).
- **`IMPORTAR-RESPALDO.bat`** → restaura en `data/` local.
- **`SUBIR.bat`** ya **no sube** `organizacion-respaldo-*.json` ni `.env`.

### 3. Token opcional en la API

Si compartes la PC o quieres una capa extra:

1. Copia `.env.example` → `.env`
2. Genera un token:
   ```bat
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
3. Pégalo en `.env`:
   ```
   ORGANIZACION_TOKEN=tu-token-largo-aqui
   ```
4. Reinicia `SERVIR.bat`
5. En el navegador (F12 → consola), una vez por sesión:
   ```javascript
   setOrganizacionApiToken('tu-token-largo-aqui')
   ```

Sin token en `.env`, la API funciona como antes (solo localhost).

### 4. Repo en GitHub

- Marca el repositorio como **privado** si hay historial con respaldos antiguos.
- Antes de `SUBIR.bat`, revisa `git status` — no debe aparecer `organizacion-respaldo-2026-*.json`.

---

## Qué protege el servidor (desde esta versión)

| Medida | Detalle |
|--------|---------|
| Solo localhost | `HOST=127.0.0.1` por defecto |
| API con token opcional | `ORGANIZACION_TOKEN` en `.env` |
| Límite de tamaño POST | 12 MB máximo (evita llenar disco) |
| Rutas bloqueadas | `.git`, `.env`, `organizacion-live.json` directo, `backend/`, logs |
| Cabeceras HTTP | `nosniff`, `X-Frame-Options`, `Referrer-Policy` |
| Vaciar calendario por URL | Requiere `?vaciar-tareas=1&confirm=1` |

`organizacion-live.json` solo se lee/escribe por **`/api/organizacion`**, no por URL directa.

---

## Qué NO hacer

| Acción | Riesgo |
|--------|--------|
| `git add -A` manual con respaldos | Sube citas médicas y datos de clientes a GitHub |
| Repo público con JSON de respaldo | Cualquiera clona y lee todo |
| Servidor en `0.0.0.0` sin firewall | Otras máquinas en la red acceden a tus datos |
| Enviar **↓ Respaldo** por WhatsApp/email | Filtración de datos personales |

---

## Si ya subiste un respaldo por error

1. Borra el archivo del repo (`git rm data/organizacion-respaldo-....json`) y haz push.
2. En GitHub: **Settings → Danger zone → Change repository visibility** → Private.
3. Considera que el historial de Git puede conservar el archivo — para borrado definitivo hace falta `git filter-repo` o soporte de GitHub.

---

## Producción futura (Laravel)

Cuando montes backend (`docs/laravel/`):

- Implementar **autenticación** (Paso 6 — Sanctum) **antes** de exponer la API.
- Base de datos por usuario, no un JSON global.
- HTTPS obligatorio.
- No reutilizar respaldos locales como datos de producción sin cifrar.

---

## Archivos de referencia

| Archivo | Uso |
|---------|-----|
| `.env.example` | Plantilla de configuración segura |
| `.gitignore` | Excluye respaldos, `.env`, live JSON |
| `run-git.ps1` | SUBIR.bat — excluye datos sensibles del commit |
| `scripts/organizacion-server.js` | Servidor endurecido |
