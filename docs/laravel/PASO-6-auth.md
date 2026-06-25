# Paso 6 — Autenticación (opcional, después)

> Cuando el portal y la API básica funcionen.

**Meta:** solo usuarios logueados pueden crear/editar tareas.

```mermaid
flowchart LR
    U["Usuario"] -->|"POST /login"| L["Laravel Sanctum"]
    L -->|"token"| U
    U -->|"Authorization: Bearer"| API["API protegida"]
```

Laravel incluye **Sanctum** para APIs simples.

Confirmación futura: **«Paso 6 Laravel OK»**
