# Resumen — MOVA · Auditoría técnica mova_auth

**Última actualización:** 20 jul 2026  
**Cliente:** MKOF · **Proyecto:** MOVA  
**Rama:** `cursor/mova-nodo-mysql-ppt-4e97`  
**Presentación:** [`mova-etapa2-presentacion.html`](../../mkof/mova-etapa2-presentacion.html) · Guion [`docs/mova/GUION-PRESENTACION-ETAPA2.md`](../../../../docs/mova/GUION-PRESENTACION-ETAPA2.md)

---

## Objetivo (fase actual)

Documentar el login unificado `mova_auth` — inventario, reglas, núcleo, cookie y validación — **sin tocar código en servidor**.  
Quick wins: n8n en GitHub (**hecho**) · Cloudflare explicado · espejo cPanel listo para bajar ZIPs.

---

## Auditoría D1–D5 — estado

| Día | Entregable | Estado |
|-----|------------|--------|
| D1 | Inventario módulos M | Hecho |
| D2 | Reglas mova_auth | Hecho (docs) · falta firma equipo |
| D3 | 6 archivos núcleo + gap | Hecho |
| D4 | Login + cookie HttpOnly | Hecho |
| D5 | Matriz + sandbox ERP + cierre | Hecho |

---

## Quick wins playbook

| Hito | Estado |
|------|--------|
| 1.1 Respaldo n8n → GitHub | **Hecho** — flujos en repo GitHub |
| 1.2 Cloudflare delante de GoDaddy | **Explicación + conclusión listas** · activación pendiente equipo |
| Espejo cPanel → repo | **Guía entregada** · esperando ZIP `mova_auth/` |
| 3.2 Nodo MySQL en n8n | **PPT/guía entregada** · esperando implementación |

---

## Hoy (20 jul) — cierre administrativo

- [x] PPT nodo MySQL entregada a encargado n8n
- [x] Indicaciones respaldo cPanel dadas a encargado ZIP
- [x] Hoja de seguimiento + textos para pegar: [`seguimiento-admin.html`](../../mkof/seguimiento-admin.html)

---

## Cloudflare — conclusión en una línea

Sí como **escudo rápido** (HTTPS + WAF) sin mudar hosting; no es el VPS del año ni arregla el login. Ver `cloudflare-mova.html`.

---

## Pendiente humano

- [ ] ZIP `mova_auth/` en `espejo-cpanel/` (encargado respaldo)
- [ ] Nodo MySQL con Test OK (encargado n8n)
- [ ] Marcar `mkof/03`–`mkof/05` en organizador (PC local)
- [ ] Firma/correo reglas D2
- [ ] Activar Cloudflare cuando el equipo decida

## Siguiente etapa (implementación)

1. Crear `session.php` / `validate.php` / `guard.php`
2. Sandbox `/mova/erp/` → portal → AXON

---

## URLs

| Qué | Path |
|-----|------|
| Seguimiento admin | `/index/clientes/mkof/seguimiento-admin.html` |
| Nodo MySQL | `/index/clientes/mkof/mysql-nodo-n8n.html` |
| Presentación | `/index/clientes/mkof/mova-etapa2-presentacion.html` |
| Cloudflare | `/index/clientes/mkof/cloudflare-mova.html` |
| cPanel espejo | `/index/clientes/mkof/cpanel-espejo.html` |
| Documentos | `/index/clientes/MKOF/MOVA/documentos/` |
