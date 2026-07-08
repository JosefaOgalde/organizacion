# Reglas mova_auth — documento de auditoría

**Cliente:** MKOF · **Proyecto:** MOVA  
**Tarea:** Día 2 · `[MOVA] D2 — Reglas mova_auth · auditoría`  
**Organizador:** `index.html?tarea=mkof/02`  
**Fecha:** 8 jul 2026 · **GRUPO MAKING OF**  
**Regla del día:** solo documentar y acordar — **no tocar código en servidor**

**Sitio:** https://acme-chile.cl/ · **Ruta hosting:** `public_html/acme-chile.cl/`

---

## 1. Por qué existe este documento

El **Día 1** confirmó que el login está **fragmentado**: Google OAuth en `/mova/`, correo+clave en `/mova_auth/`, contraseña local en `/mova/erp/`, y módulos sin gate unificado.

Antes de crear o mover archivos (Días 3–5), el equipo debe **acordar por escrito** cómo funcionará el acceso cuando `mova_auth` sea el único validador.

### Mapa conceptual — situación HOY

```
                    Usuario
                       │
       ┌───────┬───────┼───────┬───────┐
       ▼       ▼       ▼       ▼       │
   Google   login.php  clave   sin     │
   /mova/  mova_auth  /erp/   /axon/  │
   (no     (parcial,  (login  (¿quién │
   pasa)   no gate)   aparte) valida?)│
       └───────┴───────┴───────┴───────┘
              Ningún módulo M usa mova_auth como único validador
```

---

## 2. Regla de oro (propuesta para acuerdo)

> **Si el usuario no pasó por `mova_auth` con sesión válida, no entra a ningún módulo M.**

Traducción operativa:

1. Todo módulo **privado** bajo `acme-chile.cl` incluye `guard.php` (o equivalente) al inicio.
2. `guard.php` consulta sesión PHP server-side — **no** JWT en `localStorage`.
3. Sin sesión → redirect a `https://acme-chile.cl/mova_auth/login.php?redirect=<url-pedida>`.
4. Tras login exitoso → redirect de vuelta al módulo pedido.
5. Ningún módulo implementa su propio login paralelo (Google directo, contraseña local, etc.) salvo excepciones documentadas abajo.

### Mapa conceptual — flujo OBJETIVO

```
Usuario pide /mova/erp/
        │
        ▼
   guard.php  ──¿sesión?──►  No  ──►  login.php?redirect=/mova/erp/
        │                              │
       Sí                         Login OK + cookie
        │                              │
        ▼                              ▼
   Carga módulo              Vuelve a /mova/erp/
```

---

## 3. Qué es un «módulo M»

En esta auditoría, **módulo M** = cualquier app o sección MOVA que:

- Maneja datos internos del negocio, o
- Requiere identificar al usuario, o
- Está bajo `mova/` o depende del ecosistema MOVA.

Referencia completa: [Inventario-MOVA-modulos.md](Inventario-MOVA-modulos.md)

---

## 4. Clasificación por módulo (basado en inventario D1)

| Módulo | URL | Auth hoy | ¿Debe pasar por mova_auth? | Notas auditoría |
|--------|-----|----------|---------------------------|-----------------|
| Portal MOVA | `/mova/` | Google OAuth | **Sí** | Hoy no pasa por mova_auth |
| mova_auth | `/mova_auth/login.php` | PHP correo+clave | **Es el gate** | Parcial — no controla el panel |
| MOVA ERP | `/mova/erp/` | Contraseña local | **Sí** | Login aparte hoy |
| AXON | `/axon/` | Sin login visible | **Sí** (revisar al enviar) | Validar en D5 |
| RRHH | `/rrhh/` | 403 Forbidden | **Sí** | Sin acceso público hoy |
| Documentos | `/documentos/` | Público | **No (excepción)** | Solo playbooks HTML |
| Landing raíz | `/` | ? | **Evaluar** | Página corporativa |
| `/pruebas/` | — | — | **Fuera de alcance** | Etapa 1 obsoleta |

### Submódulos bajo `/mova/`

Todos los submódulos privados (`agencia`, `facturas`, `oc`, `erp`, etc.) heredan la regla: **deben pasar por mova_auth** cuando se implemente la unificación.

### Lectura fila por fila (puente explicativo)

| Módulo | Qué significa en lenguaje simple |
|--------|----------------------------------|
| Portal MOVA | Hoy Google directo → debe pasar por mova_auth primero |
| mova_auth | Es el portero; hoy parcial porque no controla todo |
| MOVA ERP | Clave propia hoy → misma sesión que el resto |
| AXON | Sin login visible → validar en D5 |
| RRHH | 403 hoy → privado, mova_auth cuando se habilite |
| Documentos | **Excepción** pública a propósito |

---

## 5. Excepciones y contenido público

| Tipo | Ejemplo | Regla |
|------|---------|-------|
| **Público sin login** | `/documentos/auditoria_mova.html` | No requiere mova_auth · `n/a` |
| **Assets estáticos** | CSS, JS, imágenes públicas | No requieren sesión |
| **Login mismo** | `/mova_auth/login.php` | Página de entrada — no se protege con guard |
| **Logout** | `/mova_auth/logout.php` | Accesible con o sin sesión |
| **API validate** | `/mova_auth/validate.php` | Responde JSON 200/401 — no redirect |

Cualquier **nueva excepción** debe quedar por escrito en este documento con responsable y fecha.

### Mapa — dentro vs afuera del edificio

```
  DENTRO (requiere mova_auth)     │  AFUERA (público)
  ─────────────────────────     │  ─────────────────
  /mova/ y submódulos           │  /documentos/ playbooks
  /mova/erp/                    │  CSS · JS · imágenes
  /axon/                        │  login.php (entrada)
  /rrhh/                        │  logout.php · validate.php
         ▲                      │
         └── mova_auth (portero)─┘
```

---

## 6. Lo que NO se permite (post-acuerdo)

- Validar usuario solo con **Google OAuth** en el módulo sin pasar por mova_auth.
- Guardar **JWT / access_token** en `localStorage` del cliente.
- Duplicar pantallas de login por módulo (ERP con clave propia, etc.).
- Asumir sesión por cookies de terceros (`accounts.google.com`) como sesión MOVA.

---

## 7. Roles y responsabilidades (borrador)

| Rol | Responsabilidad en mova_auth |
|-----|------------------------------|
| **Usuario** | Un solo login en mova_auth |
| **mova_auth** | Crear sesión, cookie HttpOnly, validar redirect |
| **Cada módulo M** | Incluir guard · no decidir permisos por su cuenta |
| **Equipo n8n** | Mantener validaciones backend existentes donde aplique |
| **Auditoría MOVA** | Documentar gaps · no implementar en Día 2 |

---

## 8. Criterios de cierre Día 2

- [ ] Regla de oro leída y **sin objeciones** del equipo técnico
- [ ] Tabla de módulos (sección 4) revisada — marcar «de acuerdo» o comentar cambios
- [ ] Excepciones públicas confirmadas (sección 5)
- [ ] Documento compartido (PDF/PPT o enlace al portal)
- [ ] Tarea `mkof/02` marcada completada en organizador

**Pendiente de firma verbal/correo:** _________________________ · Fecha: _______

---

## 9. Próximo paso — Día 3

Sin subir archivos aún: documentar **carpetas y archivos núcleo** que deberían existir en `mova_auth/` (config, session, login, validate, guard, logout).

Tarea: `index.html?tarea=mkof/03`

---

## Referencias

- Inventario D1: [Inventario-MOVA-modulos.md](Inventario-MOVA-modulos.md)
- Status D1: [MOVA/documentos/ver.html?id=d1-inventario-status](../MKOF/MOVA/documentos/ver.html?id=d1-inventario-status)
- Playbook cliente: https://acme-chile.cl/documentos/auditoria_mova.html
- Guía mova_auth: [mova-auth-guia.html](mova-auth-guia.html)
