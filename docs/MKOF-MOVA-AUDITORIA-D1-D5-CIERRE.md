# MOVA · Cierre auditoría D1–D5 + materiales etapa 2 (19 jul 2026)

**Cliente:** MKOF · **Sitio:** https://acme-chile.cl/  
**Alcance etapa 2:** documentación login unificado — **sin cambios en servidor**.

---

## Completado

| Día | Entregable | Dónde verlo |
|-----|------------|-------------|
| D1 | Inventario módulos + cPanel | `documentos/ver.html?id=d1-inventario-status` |
| D2 | Reglas único validador | `documentos/ver.html?id=d2-reglas-mova-auth` |
| D3 | 6 archivos núcleo + gap | `documentos/ver.html?id=d3-nucleo-mova-auth` |
| D4 | Flujo login + cookie + 10 pruebas | `documentos/ver.html?id=d4-login-cookie` |
| D5 | Matriz validación + sandbox ERP | `documentos/ver.html?id=d5-validacion-modulos` |

## Quick wins / ops

| Ítem | Estado | Dónde |
|------|--------|-------|
| n8n → GitHub | **Hecho** (flujos en repo) | Guías `github-*.html` |
| Cloudflare fácil + conclusión | **Hecho (docs)** | `cloudflare-mova.html` |
| Guía bajar cPanel al repo | **Hecho** | `cpanel-espejo.html` · `espejo-cpanel/` |
| Presentación etapa 2 + guion 20 min | **Hecho** | `mova-etapa2-presentacion.html` · `docs/mova/GUION-PRESENTACION-ETAPA2.md` |

## Decisiones de diseño

- Ruta: `public_html/acme-chile.cl/mova_auth/`
- Núcleo: `config`, `session`, `login`, `validate`, `guard`, `logout`
- Cookie: HttpOnly + Secure + SameSite=Lax · path `/`
- Sin JWT en localStorage
- Sandbox migración: `/mova/erp/`
- Cloudflare: sí como escudo; no muda hosting; no reemplaza VPS ~12 meses

## Pendiente fuera del repo / humano

1. Pegar ZIPs de cPanel en `espejo-cpanel/` (empezar por `mova_auth/`)
2. Marcar tareas `mkof/03`–`mkof/05` en organizador local
3. Firma/correo reglas D2
4. Activar Cloudflare (checklist en la guía)
5. Implementación en servidor (siguiente etapa)

## Rama

`cursor/mova-auditoria-etapa2-d3-d5-459d`
