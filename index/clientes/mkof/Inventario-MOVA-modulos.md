# Inventario MOVA — módulos en acme-chile.cl

**Cliente:** MKOF · **Proyecto:** MOVA (login unificado mova_auth)  
**Tarea:** Día 1 · `[MOVA] D1 — Inventario módulos M`  
**Fecha inicio:** 6 jul 2026 · **Actualizado:** 8 jul 2026 (cPanel)  
**Regla del día:** solo inventario — **no tocar código**

**Ruta real del sitio en hosting:** `public_html/acme-chile.cl/`

---

## Cómo completar este documento

1. ~~Entra a cPanel → `public_html`~~ ✅
2. ~~Lista carpetas de `acme-chile.cl/`~~ ✅ (ver abajo)
3. Por cada módulo M: abre URL en navegador (logueado + incógnito).
4. DevTools → **Application**: ¿JWT en localStorage/sessionStorage?
5. DevTools → **Network**: ¿llamadas a webhooks n8n?
6. Marca `no` en «¿Pasa mova_auth?» lo que valide por su cuenta.
7. Comparte este archivo con el equipo técnico.

**Enlaces útiles**

- Sitio: https://acme-chile.cl/
- Panel MOVA: https://acme-chile.cl/mova/
- Playbook: https://acme-chile.cl/documentos/auditoria_mova.html
- Guía mova_auth: [mova-auth-guia.html](mova-auth-guia.html)
- Tarea organizador: `index.html?tarea=mkof/01`

---

## Tabla de módulos (nivel 1 — carpetas principales)

| Módulo | Carpeta cPanel | URL | Auth actual | ¿JWT/localStorage? | ¿n8n? | ¿Pasa mova_auth? | Responsable | Notas |
|--------|----------------|-----|-------------|-------------------|-------|------------------|-------------|-------|
| Landing corporativa | `acme-chile.cl/` (raíz) | https://acme-chile.cl/ | ? | ? | ? | ? | | Página pública — no revisada en navegador |
| Portal MOVA (producción) | `acme-chile.cl/mova/` | https://acme-chile.cl/mova/ | **Google OAuth** | **sí** — clave `axon_chats` | ver nota n8n | **no** | Josefa | Sesión Google · localStorage en `acme-chile.cl` · sin clave `jwt`/`token` visible |
| mova_auth (núcleo actual) | `acme-chile.cl/mova_auth/` | https://acme-chile.cl/mova_auth/login.php | **mova_auth PHP** (correo + clave) | ? | ? | **parcial** | | Login **independiente** — no es el gate del panel MOVA |
| MOVA ERP | `acme-chile.cl/mova/erp/` | https://acme-chile.cl/mova/erp/ | **Contraseña local** (solo campo clave) | ? | ? | **no** | | Login separado del panel MOVA y de mova_auth |
| AXON | `acme-chile.cl/axon/` | https://acme-chile.cl/axon/ | **Sin login visible** (carga chat directo) | ? | ? | **no** | | En incógnito abre UI AXON sin pantalla previa — revisar auth al enviar mensaje |
| AXON News | `acme-chile.cl/axon-news/` | https://acme-chile.cl/axon-news/ | ? | ? | ? | ? | | No revisado en navegador |
| Boletín AXON | `acme-chile.cl/Boletin_Axon/` | https://acme-chile.cl/Boletin_Axon/ | ? | ? | ? | ? | | No revisado |
| Admin | `acme-chile.cl/admin/` | https://acme-chile.cl/admin/ | ? | ? | ? | ? | | No revisado |
| CRM | `acme-chile.cl/crm/` | https://acme-chile.cl/crm/ | ? | ? | ? | ? | | Solo `versiones_anteriores/` en cPanel |
| Documentos / playbooks | `acme-chile.cl/documentos/` | https://acme-chile.cl/documentos/auditoria_mova.html | público | no | no | n/a | | Solo documentación |
| GAMKOF | `acme-chile.cl/gamkof/` | https://acme-chile.cl/gamkof/ | ? | ? | ? | ? | | No revisado |
| Gestión EERR | `acme-chile.cl/gestion/eerr/` | https://acme-chile.cl/gestion/eerr/ | ? | ? | ? | ? | | `resumen/` vacía |
| Operaciones | `acme-chile.cl/operaciones/` | https://acme-chile.cl/operaciones/comite.html | ? | ? | ? | ? | | `comite.html` en cPanel |
| Pruebas (obsoleto etapa 1) | `acme-chile.cl/pruebas/` | https://acme-chile.cl/pruebas/mova.html | — | — | — | — | | **No usar en adelante** — solo referencia histórica |
| RRHH | `acme-chile.cl/rrhh/` | https://acme-chile.cl/rrhh/ | **403 Forbidden** (servidor) | n/a | n/a | **no** | | Sin acceso web directo · probar subrutas: `/rrhh/capacitaciones/` etc. |
| Skill (herramientas) | `acme-chile.cl/skill/` | https://acme-chile.cl/skill/ | ? | ? | ? | ? | | No revisado |
| Multimedia | `acme-chile.cl/multimedia/` | https://acme-chile.cl/multimedia/ | ? | ? | ? | ? | | No revisado |

> **Valores auth:** `Google OAuth` · `mova_auth` · `JWT local` · `sesión PHP` · `ninguno` · `otro`  
> **¿Pasa mova_auth?:** `sí` · `parcial` · `no` · `n/a`

---

## Tabla de submódulos MOVA (`mova/`)

| Submódulo | Carpeta | URL probable | Auth | JWT | n8n | mova_auth | Notas |
|-----------|---------|--------------|------|-----|-----|-----------|-------|
| Agencia | `mova/agencia/` | https://acme-chile.cl/mova/agencia/ | ? | ? | ? | ? | |
| Brief | `mova/brief/` | https://acme-chile.cl/mova/brief/ | ? | ? | ? | ? | |
| Cotizador | `mova/cotizador/` | https://acme-chile.cl/mova/cotizador/ | ? | ? | ? | ? | |
| Cuentas | `mova/cuentas/` | https://acme-chile.cl/mova/cuentas/ | ? | ? | ? | ? | |
| Doc | `mova/doc/` | https://acme-chile.cl/mova/doc/ | ? | ? | ? | ? | |
| **ERP** | `mova/erp/` | https://acme-chile.cl/mova/erp/ | **Contraseña local** | ? | ? | **no** | Login solo clave · independiente de mova_auth |
| Estudios | `mova/estudios/` | https://acme-chile.cl/mova/estudios/ | ? | ? | ? | ? | |
| Facturas | `mova/facturas/` | https://acme-chile.cl/mova/facturas/ | ? | ? | ? | ? | |
| Forecast | `mova/forecast/` | https://acme-chile.cl/mova/forecast/ | ? | ? | ? | ? | |
| Negocios | `mova/negocios/` | https://acme-chile.cl/mova/negocios/ | ? | ? | ? | ? | |
| OC | `mova/oc/` | https://acme-chile.cl/mova/oc/ | ? | ? | ? | ? | |
| Operación | `mova/operacion/` | https://acme-chile.cl/mova/operacion/ | ? | ? | ? | ? | |
| Restringido | `mova/restringido/` | https://acme-chile.cl/mova/restringido/ | ? | ? | ? | ? | |
| SEO | `mova/seo/` | https://acme-chile.cl/mova/seo/ | ? | ? | ? | ? | |
| Strack | `mova/strack/` | https://acme-chile.cl/mova/strack/ | ? | ? | ? | ? | |
| Suscripciones | `mova/suscripciones/` | https://acme-chile.cl/mova/suscripciones/ | ? | ? | ? | ? | |

**Nota:** No existen carpetas `MAESTRO/`, `INGRESOS/`, `EGRESOS/` en la raíz. El ERP está bajo **`mova/erp/`** — abrir en cPanel para listar INGRESOS/EGRESOS si están ahí.

---

## Archivos en `mova_auth/` (referencia)

```
mova_auth/
├── auth.php
├── config.php
├── google_login.php
├── login.php
├── logout.php
├── panel.php
└── setup.sql
```

Hipótesis confirmada parcial: **fragmentación de login** — Google en `/mova/`, correo+clave en `/mova_auth/`, contraseña en `/mova/erp/`.

---

## Hallazgos navegador (8 jul 2026)

| URL | Auth | ¿Pasa mova_auth? | Observación |
|-----|------|------------------|-------------|
| `/mova/` | Google OAuth | no | Pantalla «Iniciar sesión con Google» |
| `/mova_auth/login.php` | PHP correo+clave | parcial | Es mova_auth pero no usado por todos los M |
| `/mova/erp/` | Contraseña local | no | Campo «Contraseña de acceso» |
| `/axon/` | Sin login visible | no | Chat AXON carga directo |
| `/mova/` (logueado) | Google OAuth | no | Panel MOVA · `josefa@talkprod.cl` · **localStorage:** `axon_chats` |
| `/pruebas/mova.html` | — | — | **Ignorar** — etapa 1, no producción |
| `/rrhh/` | 403 Forbidden | no | Bloqueo servidor — probar subcarpetas |

**Conclusión (problema real):** validación **fragmentada** — Google en panel MOVA, login PHP en `/mova_auth/` (no usado por el panel), contraseña en `/mova/erp/`, AXON sin gate visible.

### Menú lateral MOVA (sesión Google en **`/mova/`** — producción)

| Ítem menú | Área | Mapeo carpeta probable |
|-----------|------|------------------------|
| Panel MOVA | Principal | `mova/` |
| Portal Admin | Principal | `admin/` |
| AXON News | Principal | `axon-news/` |
| Pulso | Estrategia | `mova/` o `skill/` |
| Eval. Proyectos | Estrategia | `mova/evaluador` o similar |
| Recomienda IAs | Estrategia | `skill/` |
| Stack GMO | Estrategia | `mova/strack/` |
| Biblioteca GMOF | RRHH | `mova/doc/` o `multimedia/` |
| Repositorio Documentos | RRHH | `documentos/` |
| Talent Intelligence | RRHH | `mova/` o `rrhh/` |
| Informe RRHH | RRHH | `rrhh/informe_rrss/` |
| MOVA Financiero | ERP | `mova/erp/` |
| Registro Ventas y CV | ERP | `mova/negocios/` |
| Generador OC | ERP | `mova/oc/` |
| Ctas. Cobrar/Pagar | ERP | `mova/cuentas/` |

**Importante:** entrar al panel por Google **no desbloquea** `/mova_auth/login.php` ni `/mova/erp/` (siguen con login propio).

### Local Storage — `https://acme-chile.cl` (sesión en `/mova/`)

| Clave | Uso probable | ¿JWT/sesión? |
|-------|--------------|--------------|
| `axon_chats` | Historial chats widget AXON | No — datos de chat en cliente |

También existe Local Storage en `https://accounts.google.com` (sesión Google OAuth).

**Conclusión JWT:** hay **localStorage**, pero en `/mova/` no se vio clave típica (`jwt`, `token`, `access_token`). La sesión principal parece **Google OAuth + cookies**, no JWT explícito en `acme-chile.cl`.

---

## Carpetas en servidor (completado desde cPanel)

```
public_html/
├── .well-known/
├── acme-chile.cl/
│   ├── .well-known/
│   ├── admin/
│   ├── assets/
│   ├── axon/
│   ├── axon-news/
│   ├── Boletin_Axon/
│   ├── cgi-bin/
│   ├── crm/
│   │   └── versiones_anteriores/
│   ├── css/
│   ├── documentos/          ← playbooks HTML (mova, n8n, playbook…)
│   ├── gamkof/
│   ├── gestion/
│   │   └── eerr/
│   │       └── resumen/     ← vacío
│   ├── js/
│   ├── multimedia/
│   ├── mova/                ← submódulos (agencia, erp, facturas…)
│   ├── mova_auth/           ← login actual (PHP)
│   ├── operaciones/         ← comite.html
│   ├── pruebas/             ← mova.html, brujula_1.html
│   ├── rrhh/
│   └── skill/
├── assets/
├── cgi-bin/
├── css/
└── respaldo/
```

---

## Endpoints n8n detectados

> **Nota:** n8n lo administra otro equipo. En Día 1 se deja como **pendiente de confirmación** (no bloquea cierre si Auth/JWT están documentados).

| Webhook / URL | Módulo que lo usa | ¿Auth? | Notas |
|---------------|-------------------|--------|-------|
| _Pendiente equipo n8n_ | — | — | Josefa no administra n8n — solicitar listado al responsable |

---

## Checklist de cierre (Día 1)

- [x] Acceso cPanel / FTP GoDaddy confirmado
- [x] Listado de carpetas en `public_html/acme-chile.cl/` pegado arriba
- [x] URL completa de módulos prioritarios verificada en navegador (6 URLs)
- [x] Flujo actual documentado para módulos revisados (Google / mova_auth / contraseña / 403)
- [x] JWT o localStorage identificados en **`/mova/`** — clave `axon_chats` (sin JWT obvio)
- [x] Endpoints n8n — **delegado** al equipo que administra n8n (no bloquea D1)
- [ ] Tabla compartida con el equipo técnico

**Criterio de cierre D1 (ajustado):** Auth y mova_auth documentados · JWT verificado en `/mova/` · n8n pendiente equipo n8n · **no usar `/pruebas/`**.

---

## Historial

| Fecha | Autor | Cambio |
|-------|-------|--------|
| 6 jul 2026 | | Plantilla creada en repo |
| 8 jul 2026 | Navegador | Auth documentada: Google (/mova/), PHP (/mova_auth/), clave (/erp/), 403 (/rrhh/) |
