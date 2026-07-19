# Día 4 — Login único + cookie (diseño)

**Cliente:** MKOF · **Proyecto:** MOVA (login unificado)  
**Tarea:** `[MOVA] D4 — Login único + cookie · auditoría` · `mkof/04`  
**Fecha:** 19 jul 2026  
**Regla del día:** solo diseñar — **no implementar en servidor**

---

## 1. Flujo objetivo (paso a paso)

```
Usuario pide /mova/erp/
        │
        ▼
   guard.php  ──¿sesión PHP válida?──►  No  ──►  login.php?redirect=/mova/erp/
        │                                          │
       Sí                                     Login OK
        │                                    (correo+clave y/o Google)
        │                                          │
        ▼                                          ▼
   Carga módulo                          Cookie HttpOnly + Secure
                                                 │
                                                 ▼
                                         Redirect a /mova/erp/
```

1. Usuario navega a un módulo M privado.
2. El módulo incluye `guard.php` al inicio.
3. Sin sesión → redirect a `https://acme-chile.cl/mova_auth/login.php?redirect=<url-pedida>`.
4. Login exitoso → `session.php` emite cookie de sesión PHP.
5. Redirect de vuelta al `redirect` (validado: solo paths del mismo dominio).
6. Con sesión → el módulo carga; AJAX puede llamar `validate.php` con `credentials: 'include'`.

---

## 2. Especificación de cookie

| Parámetro | Valor | Motivo |
|-----------|-------|--------|
| Nombre | Sesión PHP por defecto (`PHPSESSID`) o `MOVASESSID` | Un solo nombre en todo el sitio |
| `HttpOnly` | **true** | JS no puede leerla (mitiga XSS → robo de sesión) |
| `Secure` | **true** | Solo HTTPS (Cloudflare / SSL Full) |
| `SameSite` | `Lax` | CSRF básico · permite redirect post-login |
| `Path` | `/` | Compartida entre `/mova/`, `/axon/`, etc. |
| `Domain` | `acme-chile.cl` (o host por defecto) | Misma cookie en subpaths |
| `Lifetime` | `0` (sesión de navegador) o máx. 8–12 h | Evitar sesión eterna |

**Prohibido:** guardar JWT / `access_token` / token Google en `localStorage` o `sessionStorage` del cliente.

---

## 3. Login: correo+clave y Google (sin fragmentar)

| Canal | Cómo se integra en el diseño |
|-------|------------------------------|
| Correo + clave | Form en `login.php` → valida contra fuente actual → crea sesión PHP |
| Google OAuth | `google_login.php` (o botón en login) → tokeninfo + whitelist (como n8n hoy) → **resultado en sesión PHP**, no en localStorage |
| Resultado único | Ambos canales terminan en la **misma** sesión server-side |

Regla D2: el panel `/mova/` **deja de** usar Google como puerta directa; Google solo alimenta mova_auth.

---

## 4. Redirect seguro

```
login.php?redirect=/mova/erp/
```

| Regla | Detalle |
|-------|---------|
| Solo paths relativos del sitio | Empezar con `/` · rechazar `http://`, `//evil.com` |
| Whitelist opcional | Prefijos: `/mova/`, `/axon/`, `/rrhh/`, `/admin/` |
| Default | Si falta o es inválido → `/mova/` |
| Excluir del guard | `login.php`, `logout.php`, `validate.php`, `/documentos/` |

---

## 5. Casos de prueba (escritos — ejecutar en implementación)

| # | Caso | Resultado esperado |
|---|------|-------------------|
| 1 | Sin cookie → `/mova/erp/` | Redirect a `login.php?redirect=/mova/erp/` |
| 2 | Login OK | Cookie HttpOnly+Secure visible en DevTools · vuelve a ERP |
| 3 | Recargar ERP | Entra sin pedir login de nuevo |
| 4 | Logout | Cookie destruida · ERP vuelve a pedir login |
| 5 | Ventana incógnito | Pide login (sesión no compartida) |
| 6 | DevTools → Local Storage | **Sin** claves `jwt` / `token` / `access_token` de sesión |
| 7 | `fetch('/mova_auth/validate.php', { credentials: 'include' })` con sesión | HTTP 200 + JSON `ok: true` |
| 8 | Mismo fetch sin sesión | HTTP 401 + JSON `ok: false` |
| 9 | Google OK pero sin whitelist | Rechazo · no crea sesión |
| 10 | `redirect=https://evil.com` | Ignorado · va a default `/mova/` |

---

## 6. Diagrama — sesión server-side vs JWT cliente

| Antes (fragmentado) | Después (diseño D4) |
|---------------------|---------------------|
| Google en `/mova/` | Google → mova_auth → sesión PHP |
| Clave en `/mova/erp/` | Misma sesión que el resto |
| JWT/token en cliente (riesgo) | Cookie HttpOnly · JS no lee sesión |
| Cada M valida distinto | Todos consultan mova_auth |

---

## 7. Checklist cierre Día 4

- [x] Flujo dibujado: usuario → mova_auth → módulo destino
- [x] Cookie HttpOnly + Secure documentada (nombre, duración, dominio)
- [x] Confirmado: sin JWT/token en localStorage del cliente
- [x] Google OAuth integrado en el diseño sin fragmentar
- [x] Casos de prueba escritos (logueado / sin sesión / logout / redirect malicioso)
- [x] Entregable en portal documentos MOVA
- [ ] Tarea `mkof/04` marcada completada en organizador (PC local)

---

## 8. Próximo paso — Día 5

Matriz «cómo debería validar» por módulo del inventario + criterios de cierre de la auditoría.

Tarea: `index.html?tarea=mkof/05`

---

## Referencias

- Núcleo D3: [Mapa-mova_auth-nucleo.md](Mapa-mova_auth-nucleo.md)
- Reglas D2: [Reglas-mova_auth.md](Reglas-mova_auth.md)
- Diagramas: [guia-mova-auth/diagramas.html](guia-mova-auth/diagramas.html#d3)
