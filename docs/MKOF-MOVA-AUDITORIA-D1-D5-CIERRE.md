# MOVA · Cierre auditoría D1–D5 (19 jul 2026)

**Cliente:** MKOF · **Sitio:** https://acme-chile.cl/  
**Alcance:** documentación de login unificado `mova_auth` — **sin cambios en servidor**.

---

## Completado

| Día | Entregable | Dónde verlo |
|-----|------------|-------------|
| D1 | Inventario módulos + cPanel | `documentos/ver.html?id=d1-inventario-status` |
| D2 | Reglas único validador | `documentos/ver.html?id=d2-reglas-mova-auth` |
| D3 | 6 archivos núcleo + gap | `documentos/ver.html?id=d3-nucleo-mova-auth` |
| D4 | Flujo login + cookie + 10 pruebas | `documentos/ver.html?id=d4-login-cookie` |
| D5 | Matriz validación + sandbox ERP + criterios cierre | `documentos/ver.html?id=d5-validacion-modulos` |

## Decisiones de diseño

- Ruta: `public_html/acme-chile.cl/mova_auth/`
- Núcleo: `config`, `session`, `login`, `validate`, `guard`, `logout`
- Cookie: HttpOnly + Secure + SameSite=Lax · path `/`
- Sin JWT en localStorage
- Sandbox migración: `/mova/erp/`
- Excepción pública: `/documentos/`

## Pendiente fuera del repo

1. Marcar tareas `mkof/03`–`mkof/05` en el organizador local.
2. Firma/correo del equipo técnico sobre reglas D2.
3. Implementación en servidor (siguiente etapa).

## Rama

`cursor/mova-auditoria-etapa2-d3-d5-459d`
