# Día 5 — Validación por módulo + cierre auditoría

**Cliente:** MKOF · **Proyecto:** MOVA (login unificado)  
**Tarea:** `[MOVA] D5 — Validación por módulo · auditoría` · `mkof/05`  
**Fecha:** 19 jul 2026  
**Regla del día:** solo documentar — **no migrar módulos aún**

---

## 1. Cómo debería validar cada módulo

### Contratos de API

#### `validate.php` (JSON)

| Situación | HTTP | Body |
|-----------|------|------|
| Sesión válida | `200` | `{ "ok": true, "usuario": "…", "permisos": […] }` |
| Sin sesión / inválida | `401` | `{ "ok": false, "error": "unauthorized" }` |

Uso desde JS:

```js
const r = await fetch('/mova_auth/validate.php', { credentials: 'include' });
if (r.status === 401) location.href = '/mova_auth/login.php?redirect=' + encodeURIComponent(location.pathname);
```

#### `guard.php` (HTML/PHP)

- Incluir **al inicio** de cada `index.php` (o entrypoint) del módulo.
- Sin sesión → `302` a `login.php?redirect=…` (no JSON).
- Con sesión → continúa el módulo.

---

## 2. Matriz — hoy vs debería (inventario D1)

| Módulo | URL | Quién valida hoy | Quién debería | Mecanismo | Prioridad migración |
|--------|-----|------------------|---------------|-----------|---------------------|
| Portal MOVA | `/mova/` | Google OAuth directo | **mova_auth** | `guard.php` + sesión PHP | Alta |
| mova_auth | `/mova_auth/` | PHP correo+clave | **Es el gate** | login / validate / logout | — |
| MOVA ERP | `/mova/erp/` | Contraseña local | **mova_auth** | `guard.php` · quitar clave propia | Alta |
| Submódulos `/mova/*` | agencia, oc, facturas… | Hereda panel / desconocido | **mova_auth** | `guard.php` en entrypoint | Media |
| AXON | `/axon/` | Sin login visible | **mova_auth** | `guard.php` + validate en AJAX chat | Alta (riesgo) |
| AXON News | `/axon-news/` | ? (no revisado) | **mova_auth** (si privado) | Confirmar en navegador → guard | Media |
| Admin | `/admin/` | ? | **mova_auth** | `guard.php` | Media |
| RRHH | `/rrhh/` | 403 servidor | **mova_auth** cuando se habilite | Abrir + guard | Baja (hoy bloqueado) |
| Documentos | `/documentos/` | Público | **Excepción** | Sin guard | n/a |
| Landing `/` | `/` | Público / ? | Evaluar | Solo si hay área privada | n/a |
| `/pruebas/` | — | Obsoleto | **Fuera de alcance** | No migrar | — |
| Skill / Gamkof / Ops | varias | ? | Revisar → mova_auth si privado | Inventario residual | Baja |

### LocalStorage

| Clave vista en D1 | ¿Es sesión? | Acción diseño |
|-------------------|-------------|----------------|
| `axon_chats` | No — historial chat | Puede quedarse · **no** usarla como auth |
| JWT / token | No visto en `/mova/` | Prohibido introducir · retirar si aparece en otros M |

---

## 3. Sandbox sugerido para primera migración

**Módulo sandbox:** `https://acme-chile.cl/mova/erp/` (MOVA Financiero)

| Criterio | Por qué ERP |
|----------|-------------|
| Login propio hoy | Demuestra unificación (se elimina clave local) |
| Valor de negocio claro | Equipo lo usa · feedback rápido |
| Alcance acotado | Carpeta `mova/erp/` · no todo el panel de una vez |
| Menos riesgo que AXON | AXON abre sin gate — migrar segundo, no primero |

**Orden de migración futura (post-auditoría):**

1. Sandbox ERP (`/mova/erp/`)
2. Portal `/mova/` (reemplazar Google directo)
3. AXON (`/axon/`)
4. Resto de submódulos `/mova/*` y Admin
5. RRHH cuando deje de ser 403

---

## 4. Criterios de cierre — auditoría fase B–C (D2–D5)

La **fase auditoría** (solo documentar) se considera cerrada cuando:

| # | Criterio | Estado |
|---|----------|--------|
| 1 | D1 inventario módulos + cPanel | Hecho (PPT/PDF + MD) |
| 2 | D2 reglas único validador + excepciones | Hecho (PPT/PDF + MD) |
| 3 | D3 mapa núcleo 6 archivos + gap cPanel | **Hecho 19 jul 2026** |
| 4 | D4 flujo login + cookie + casos de prueba | **Hecho 19 jul 2026** |
| 5 | D5 matriz validación + sandbox + cierre | **Hecho 19 jul 2026** |
| 6 | Documentos visibles en portal MOVA | **Hecho** |
| 7 | Acuerdo formal equipo (correo/acta) | Pendiente firma humana |
| 8 | Tareas `mkof/03`–`mkof/05` en organizador | Marcar en PC local |

**Fuera de esta auditoría (siguiente etapa = implementación):**

- Subir `session.php` / `validate.php` / `guard.php` al servidor
- Migrar módulos uno a uno
- Cloudflare / MySQL / rutinas (Gantt post-auditoría)

---

## 5. Checklist cierre Día 5

- [x] Por cada módulo M prioritario: quién valida hoy vs quién debería
- [x] Especificación `validate.php` (200 / 401)
- [x] Especificación `guard.php` (redirect si no hay sesión)
- [x] Sandbox sugerido: `/mova/erp/`
- [x] Criterios de cierre auditoría fase B–C documentados
- [x] Entregable en portal documentos MOVA
- [ ] Tarea `mkof/05` marcada completada en organizador (PC local)
- [ ] Acuerdo formal del equipo técnico (correo/acta)

---

## 6. Handoff a implementación

Cuando el equipo firme las reglas:

1. Crear archivos faltantes en `mova_auth/` (D3).
2. Implementar cookie + login unificado (D4).
3. Migrar sandbox ERP → portal → AXON (esta matriz).
4. Seguir Gantt post-auditoría (n8n Git, Cloudflare, MySQL…).

Playbook cliente: https://acme-chile.cl/documentos/auditoria_mova.html

---

## Referencias

- Inventario: [Inventario-MOVA-modulos.md](Inventario-MOVA-modulos.md)
- Reglas: [Reglas-mova_auth.md](Reglas-mova_auth.md)
- Núcleo: [Mapa-mova_auth-nucleo.md](Mapa-mova_auth-nucleo.md)
- Cookie/login: [Flujo-login-cookie-mova_auth.md](Flujo-login-cookie-mova_auth.md)
