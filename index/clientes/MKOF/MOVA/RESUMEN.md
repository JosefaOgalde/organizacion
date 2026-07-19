# Resumen — MOVA · Auditoría técnica mova_auth

**Última actualización:** 19 jul 2026  
**Cliente:** MKOF · **Proyecto:** MOVA  
**Rama:** `cursor/mova-auditoria-etapa2-d3-d5-459d`  
**Handoff portal:** [`docs/MKOF-MOVA-HANDOFF.md`](../../../../docs/MKOF-MOVA-HANDOFF.md)

---

## Objetivo (fase actual)

Documentar el login unificado `mova_auth` en **acme-chile.cl** — inventario, reglas, núcleo, cookie y validación por módulo — **sin tocar código en servidor**.  
Siguiente etapa (después de firmar): implementar archivos faltantes y migrar módulos (sandbox ERP primero).

---

## Auditoría D1–D5 — estado 19 jul 2026

| Día | Tarea | Entregable | Estado |
|-----|-------|------------|--------|
| D1 | Inventario módulos M | PPT/PDF + `Inventario-MOVA-modulos.md` | Hecho |
| D2 | Reglas mova_auth | PPT/PDF + `Reglas-mova_auth.md` | Hecho |
| D3 | Carpetas y archivos núcleo | `Mapa-mova_auth-nucleo.md` + HTML | **Hecho hoy** |
| D4 | Login único + cookie | `Flujo-login-cookie-mova_auth.md` + HTML | **Hecho hoy** |
| D5 | Validación por módulo + cierre | `Matriz-validacion-modulos-mova_auth.md` + HTML | **Hecho hoy** |

Portal documentos: `index/clientes/MKOF/MOVA/documentos/`  
Landing MKOF: sección «Guías en curso · MOVA».

---

## Hallazgos clave

1. Login **fragmentado**: Google en `/mova/`, correo+clave en `/mova_auth/`, clave local en `/mova/erp/`, AXON sin gate visible.
2. Gap núcleo: faltan `session.php`, `validate.php`, `guard.php` en cPanel.
3. Diseño acordado: cookie **HttpOnly + Secure**, sin JWT en localStorage.
4. Sandbox primera migración: **`/mova/erp/`**.

---

## Pendiente humano (no bloquea docs)

- [ ] Marcar `mkof/03`, `mkof/04`, `mkof/05` completadas en organizador (PC local / `organizacion-live.json`)
- [ ] Acuerdo formal del equipo técnico (correo o acta sobre reglas D2)
- [ ] Equipo n8n: enviar JSON + capturas para primer push a `mova-n8n-workflows`

---

## Próxima etapa (implementación — no es esta PR)

1. Crear `session.php` / `validate.php` / `guard.php` en servidor.
2. Migrar sandbox ERP → portal `/mova/` → AXON.
3. Seguir Gantt post-auditoría (Cloudflare, MySQL, rutinas).

Playbook: https://acme-chile.cl/documentos/auditoria_mova.html

---

## URLs (Laravel :8000 o SERVIR :3000)

| Página | Path |
|--------|------|
| Hub MOVA | `/index/clientes/MKOF/MOVA.html` |
| Documentos | `/index/clientes/MKOF/MOVA/documentos/` |
| D3 | `…/documentos/ver.html?id=d3-nucleo-mova-auth` |
| D4 | `…/documentos/ver.html?id=d4-login-cookie` |
| D5 | `…/documentos/ver.html?id=d5-validacion-modulos` |
| Landing MKOF | `/index/clientes/mkof/` |

---

## Archivos clave

- `data/mkof-mova-auth-plan.js` — plan D1–D5
- `data/mova-documentos.js` — catálogo portal
- `index/clientes/mkof/Mapa-mova_auth-nucleo.md`
- `index/clientes/mkof/Flujo-login-cookie-mova_auth.md`
- `index/clientes/mkof/Matriz-validacion-modulos-mova_auth.md`
