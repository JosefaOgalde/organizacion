# MOVA — Artefactos que aún faltan

**Fecha:** 20 jul 2026  
**Qué ya no falta en documentación:** D1–D5, deck etapa 2, explicación Cloudflare, guía espejo cPanel, repo n8n en GitHub.

---

## A) Artefactos / acciones humanas (pendientes)

| # | Artefacto | Qué es | Quién | Bloquea implementación? |
|---|-----------|--------|-------|-------------------------|
| 1 | **Espejo cPanel en disco** | ZIP(s) de `mova_auth/` (y opc. `mova/erp/`) pegados en `index/clientes/mkof/espejo-cpanel/` | Tú (mañana) | Sí, conviene antes de crear PHP |
| 2 | **Cloudflare activo** | Dominio `acme-chile.cl` detrás de Cloudflare (nameservers + SSL) | Tú + quien tenga GoDaddy DNS | No para bajar cPanel; sí recomendable antes de cookies `Secure` en prod |
| 3 | **Firma / correo D2** | Acuerdo escrito: “si no pasó por mova_auth, no entra” | Cliente / equipo | Sí para implementar con respaldo |
| 4 | **Presentación etapa 2 hecha** | Deck entregado/presentado (~20 min) | Tú | No técnico; cierra la etapa 2 |
| 5 | **Tareas organizador** | `mkof/03`–`mkof/05` marcadas / cerradas | Tú | No |

---

## B) Artefactos de código (siguiente etapa — aún no existen en servidor)

Estos están **diseñados** en la auditoría, pero **faltan crear/subir**:

| # | Archivo / pieza | Dónde debería vivir | Estado hoy |
|---|-----------------|---------------------|------------|
| 6 | `session.php` | `/mova_auth/` | Diseñado · no implementado |
| 7 | `validate.php` | `/mova_auth/` | Diseñado · no implementado |
| 8 | `guard.php` | `/mova_auth/` | Diseñado · no implementado |
| 9 | Login unificado cableado a módulos M | portal → ERP → AXON | Pendiente sandbox |
| 10 | MySQL como fuente en flujos n8n (antes de Sheets) | n8n | Guía lista · no aplicado a flujos |

---

## C) Ya entregados (no te faltan)

- Repo GitHub con flujos n8n  
- Documentos D1–D5 (HTML/PDF/PPT según catálogo)  
- Deck presentación etapa 2  
- Guía Cloudflare (explicación + paso a paso)  
- Guía espejo cPanel  
- Guía n8n MySQL antes de Sheets (PR #93 si aún no está en main)

---

## Orden práctico para ti

1. **Mañana:** artefacto **#1** (espejo cPanel).  
2. Cuando el equipo diga sí: artefacto **#2** (Cloudflare) — ver `docs/mova/PASO-A-PASO-CLOUDFLARE.md`.  
3. Pedir **#3** (firma D2) si aún no hay correo.  
4. **#4** presentar deck.  
5. Recién después: **#6–#9** implementación.
