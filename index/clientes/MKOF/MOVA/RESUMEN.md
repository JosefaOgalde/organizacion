# Resumen — MOVA · Auditoría técnica mova_auth

**Última actualización:** 19 jul 2026  
**Cliente:** MKOF · **Proyecto:** MOVA  
**Rama:** `main` (PRs #88 + #90) · ver [`docs/mova/VER-ETAPA2.md`](../../../../docs/mova/VER-ETAPA2.md)  
**Presentación:** [`mova-etapa2-presentacion.html`](../../mkof/mova-etapa2-presentacion.html) · Guion [`docs/mova/GUION-PRESENTACION-ETAPA2.md`](../../../../docs/mova/GUION-PRESENTACION-ETAPA2.md)  
**Abrir todo:** `ABRIR-MOVA.bat` (hub + documentos + deck)

---

## Objetivo (fase actual)

Documentar el login unificado `mova_auth` — inventario, reglas, núcleo, cookie y validación — **sin tocar código en servidor**.  
Quick wins: n8n en GitHub (**hecho**) · Cloudflare explicado · espejo cPanel listo para bajar ZIPs.

---

## Auditoría D1–D5 — estado

| Día | Entregable | Estado |
|-----|------------|--------|
| D1 | Inventario módulos M | Hecho |
| D2 | Reglas mova_auth | Hecho |
| D3 | 6 archivos núcleo + gap | Hecho |
| D4 | Login + cookie HttpOnly | Hecho |
| D5 | Matriz + sandbox ERP + cierre | Hecho |

---

## Quick wins playbook

| Hito | Estado |
|------|--------|
| 1.1 Respaldo n8n → GitHub | **Hecho** — flujos en repo GitHub |
| 1.2 Cloudflare delante de GoDaddy | **Explicación + conclusión listas** · activación pendiente equipo |
| Espejo cPanel → repo | **Guía + carpeta `espejo-cpanel/`** · falta pegar ZIPs desde cPanel |

---

## Cloudflare — conclusión en una línea

Sí como **escudo rápido** (HTTPS + WAF) sin mudar hosting; no es el VPS del año ni arregla el login. Ver `cloudflare-mova.html`.

---

## Pendiente humano

- [ ] Pegar ZIP `mova_auth/` (y opc. `mova/erp/`) en `espejo-cpanel/`
- [ ] Marcar `mkof/03`–`mkof/05` en organizador
- [ ] Firma/correo reglas D2
- [ ] Activar Cloudflare cuando el equipo decida
- [ ] Presentar deck etapa 2 (~20 min)

## Siguiente etapa (implementación)

1. Crear `session.php` / `validate.php` / `guard.php`
2. Sandbox `/mova/erp/` → portal → AXON

---

## URLs

| Qué | Path |
|-----|------|
| Presentación | `/index/clientes/mkof/mova-etapa2-presentacion.html` |
| Cloudflare | `/index/clientes/mkof/cloudflare-mova.html` |
| cPanel espejo | `/index/clientes/mkof/cpanel-espejo.html` |
| Documentos | `/index/clientes/MKOF/MOVA/documentos/` |
