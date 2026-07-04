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

Siempre usa **`SERVIR.bat`** o **`ABRIR-ORGANIZADOR.bat`** (no abras carpetas con `file://` ni `npx serve` para trabajo diario).

El servidor escucha solo en **`127.0.0.1`** — otras PCs de la red no pueden entrar.

### 2. Clave de acceso (login) — **recomendado**

La forma más práctica de proteger el organizador y los portales de clientes:

1. Ejecuta **`CONFIGURAR-CLAVE.bat`** (genera `.env` con una clave larga aleatoria).
2. **Anota la clave** en un gestor de contraseñas (1Password, Bitwarden, bloc seguro).
3. Reinicia el servidor (`SERVIR.bat` o `ABRIR-ORGANIZADOR.bat`).
4. Al abrir `http://localhost:3000` te redirige a **`/login.html`** — introduces la clave una vez por sesión.

**Qué protege:**

| Capa | Detalle |
|------|---------|
| Pantalla de login | Nadie ve calendario, clientes ni portales sin la clave |
| Cookie HttpOnly | La sesión no la lee JavaScript de la página |
| API `/api/organizacion` | Sin sesión no lee ni guarda el JSON en disco |
| Archivos estáticos | HTML, wireframes JM, portales ADL/MOVA, etc. |

**Qué NO protege (limitaciones):**

- Si alguien ya tiene acceso a tu Windows y abre el JSON en `data/` directamente desde el Explorador.
- Si compartes el archivo `.env` o la clave por WhatsApp/email.
- Exponer el servidor a internet (`HOST=0.0.0.0`) sin HTTPS ni firewall.

Para uso en **PC compartida o portátil**, el login es la capa mínima recomendada.

### 3. Respaldos fuera de Git

- **↓ Respaldo** → guarda el JSON en una carpeta segura (OneDrive cifrado, disco externo, etc.).
- **`IMPORTAR-RESPALDO.bat`** → restaura en `data/` local.
- **`SUBIR.bat`** ya **no sube** `organizacion-respaldo-*.json` ni `.env`.

### 4. Repo en GitHub

- Marca el repositorio como **privado** si hay historial con respaldos antiguos.
- Antes de `SUBIR.bat`, revisa `git status` — no debe aparecer `organizacion-respaldo-2026-*.json`.

---

## Configuración `.env`

| Variable | Uso |
|----------|-----|
| `ORGANIZACION_ACCESS_KEY` | **Recomendado** — login + protección total del sitio |
| `ORGANIZACION_TOKEN` | Legacy — solo API (sin pantalla login) si no hay ACCESS_KEY |
| `ORGANIZACION_SESSION_HOURS` | Horas de sesión tras login (default 24) |
| `HOST` | Siempre `127.0.0.1` en local |
| `PORT` | Default `3000` |

Generar clave manualmente:

```bat
node scripts/generar-clave-organizacion.js --mostrar
```

Cerrar sesión desde consola del navegador (F12):

```javascript
cerrarSesionOrganizacion()
```

---

## Qué protege el servidor

| Medida | Detalle |
|--------|---------|
| Solo localhost | `HOST=127.0.0.1` por defecto |
| Login con clave | `ORGANIZACION_ACCESS_KEY` → `/login.html` |
| Cookie de sesión | HttpOnly, SameSite=Strict, expira en N horas |
| API protegida | Sin sesión → 401; datos live no accesibles |
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
| Dejar `.env` en el escritorio o subirlo a Git | Cualquiera con la clave entra al organizador |

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
|---------|---------|
| `CONFIGURAR-CLAVE.bat` | Genera clave y crea `.env` |
| `.env.example` | Plantilla de configuración segura |
| `.gitignore` | Excluye respaldos, `.env`, live JSON |
| `login.html` | Pantalla de acceso |
| `run-git.ps1` | SUBIR.bat — excluye datos sensibles del commit |
| `scripts/organizacion-server.js` | Servidor endurecido |
| `scripts/generar-clave-organizacion.js` | Generador de clave |
