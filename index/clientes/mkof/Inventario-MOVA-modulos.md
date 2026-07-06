# Inventario MOVA — módulos en acme-chile.cl

**Cliente:** MKOF · **Proyecto:** MOVA (login unificado mova_auth)  
**Tarea:** Día 1 · `[MOVA] D1 — Inventario módulos M`  
**Fecha inicio:** 6 jul 2026  
**Regla del día:** solo inventario — **no tocar código**

---

## Cómo completar este documento

1. Entra a **cPanel → Administrador de archivos → `public_html`** (GoDaddy).
2. Lista **todas las carpetas** bajo `public_html` en la sección [Carpetas en servidor](#carpetas-en-servidor).
3. Por cada módulo M, abre la URL en el navegador (logueado y en incógnito).
4. En DevTools → **Application**: revisa `localStorage` / `sessionStorage` (¿hay JWT?).
5. En **Network**: busca llamadas a webhooks n8n al cargar o al validar sesión.
6. Marca en **rojo** (columna «¿Pasa mova_auth?» = `no`) todo lo que valide por su cuenta o use JWT en el cliente.
7. Comparte este archivo (o la hoja Sheets equivalente) con el equipo técnico.

**Enlaces útiles**

- Sitio: https://acme-chile.cl/
- Panel MOVA: https://acme-chile.cl/mova/
- Playbook: https://acme-chile.cl/documentos/auditoria_mova.html
- Guía mova_auth: [mova-auth-guia.html](mova-auth-guia.html)
- Tarea organizador: `index.html?tarea=mkof/01`

---

## Tabla de módulos

| Módulo | Carpeta cPanel | URL | Auth actual | ¿JWT/localStorage? | ¿n8n? | ¿Pasa mova_auth? | Responsable | Notas |
|--------|----------------|-----|-------------|-------------------|-------|------------------|-------------|-------|
| Landing corporativa | `/` | https://acme-chile.cl/ | ? | ? | ? | ? | | Página pública |
| Portal MOVA (panel) | `mova/` | https://acme-chile.cl/mova/ | ? | ? | ? | ? | | Menú lateral interno |
| MOVA (memoria operacional) | ? | https://acme-chile.cl/mova/ | ? | ? | ? | ? | | Vista dentro del panel |
| AXON | ? | ? | ? | ? | ? | ? | | Administrador GMO |
| Brújula | ? | ? | ? | ? | ? | ? | | |
| Evaluador | ? | ? | ? | ? | ? | ? | | |
| Pulso | ? | ? | ? | ? | ? | ? | | |
| Stack | ? | ? | ? | ? | ? | ? | | |
| Biblioteca | ? | ? | ? | ? | ? | ? | | |
| News | ? | ? | ? | ? | ? | ? | | |
| Talent | ? | ? | ? | ? | ? | ? | | |
| ERP & Finanzas (área) | ? | ? | ? | ? | ? | ? | | Ver MAESTRO abajo |
| MOVA MAESTRO | `MAESTRO/` (confirmar) | ? | ? | ? | ? | ? | | Módulo M — playbook |
| INGRESOS | `INGRESOS/` (confirmar) | ? | ? | ? | ? | ? | | Submódulo ERP |
| EGRESOS | `EGRESOS/` (confirmar) | ? | ? | ? | ? | ? | | Submódulo ERP |
| Estrategia (área) | ? | ? | ? | ? | ? | ? | | |
| RRHH (área) | ? | ? | ? | ? | ? | ? | | |
| mova_auth (actual) | `mova_auth/` (confirmar) | https://acme-chile.cl/mova_auth/ | ? | ? | ? | parcial | | Meta: único validador |
| Playbook auditoría | `documentos/` | https://acme-chile.cl/documentos/auditoria_mova.html | público | no | no | n/a | | Solo documentación |

> **Valores auth:** `Google OAuth` · `mova_auth` · `JWT local` · `sesión PHP` · `ninguno` · `otro (describir)`  
> **¿Pasa mova_auth?:** `sí` · `parcial` · `no` · `n/a`

---

## Carpetas en servidor

_Pega aquí el listado de `public_html` desde cPanel (una carpeta por línea):_

```
public_html/
├── (pegar listado real)
```

---

## Endpoints n8n detectados

| Webhook / URL | Módulo que lo usa | ¿Auth? | Notas |
|---------------|-------------------|--------|-------|
| | | | |

---

## Checklist de cierre (Día 1)

- [ ] Acceso cPanel / FTP GoDaddy confirmado
- [ ] Listado de carpetas en `public_html` pegado arriba
- [ ] URL completa de cada módulo M anotada
- [ ] Flujo actual documentado (Google / mova_auth / otro)
- [ ] JWT o localStorage identificados donde existan
- [ ] Endpoints n8n listados
- [ ] Tabla compartida con el equipo técnico

**Criterio de cierre:** inventario 100% con columnas sin `?` en módulos M (excepto playbook público). Listo para Día 2 (acuerdo mova_auth).

---

## Historial

| Fecha | Autor | Cambio |
|-------|-------|--------|
| 6 jul 2026 | | Plantilla creada en repo — completar desde cPanel |
