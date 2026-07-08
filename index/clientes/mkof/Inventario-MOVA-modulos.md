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
| Portal MOVA | `acme-chile.cl/mova/` | https://acme-chile.cl/mova/ | **Google OAuth** | ? | ? | **no** | | Login «Iniciar sesión con Google» · cuentas `@mkof.cl` `@talkprod.cl` `@acme-chile.cl` |
| mova_auth (núcleo actual) | `acme-chile.cl/mova_auth/` | https://acme-chile.cl/mova_auth/login.php | **mova_auth PHP** (correo + clave) | ? | ? | **parcial** | | Formulario email/clave · también existe `google_login.php` en carpeta |
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
| Pruebas / sandbox | `acme-chile.cl/pruebas/` | https://acme-chile.cl/pruebas/mova.html | **Google OAuth** | ? | ? | **no** | | Misma pantalla Google que `/mova/` — **candidato sandbox Día 5** |
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
| **ERP** | `mova/erp/` | https://acme-chile.cl/mova/erp/ | ? | ? | ? | ? | Reemplaza MAESTRO raíz — abrir subcarpetas |
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

Hipótesis (confirmar en DevTools): login Google + sesión PHP; aún no valida todos los módulos M.

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

| Webhook / URL | Módulo que lo usa | ¿Auth? | Notas |
|---------------|-------------------|--------|-------|
| | | | _Completar con DevTools → Network_ |

---

## Checklist de cierre (Día 1)

- [x] Acceso cPanel / FTP GoDaddy confirmado
- [x] Listado de carpetas en `public_html/acme-chile.cl/` pegado arriba
- [ ] URL completa de cada módulo M verificada en navegador
- [ ] Flujo actual documentado (Google / mova_auth / otro) — columnas Auth sin `?`
- [ ] JWT o localStorage identificados donde existan
- [ ] Endpoints n8n listados
- [ ] Tabla compartida con el equipo técnico

**Criterio de cierre:** columnas Auth, JWT, n8n y mova_auth sin `?` en módulos M.

---

## Historial

| Fecha | Autor | Cambio |
|-------|-------|--------|
| 6 jul 2026 | | Plantilla creada en repo |
| 8 jul 2026 | cPanel | Árbol real + tablas con URLs y carpetas |
