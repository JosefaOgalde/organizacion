# Resumen — MOVA Auditoría Charlas

**Última actualización:** 29 jun 2026  
**Cliente:** MKOF · **Proyecto:** MOVA  
**Documento completo (handoff):** [`docs/MKOF-MOVA-HANDOFF.md`](../../../../docs/MKOF-MOVA-HANDOFF.md)

---

## Objetivo del proyecto

Auditar charlas (capacitaciones, webinars o sesiones): revisar contenido, calidad, criterios y documentar hallazgos con informe. MOVA es un **subproyecto de MKOF**, no un cliente aparte.

---

## Qué se hizo en esta conversación (organizador + portal)

### Integración en el repo `organizacion`

- MOVA integrado como subproyecto bajo **MKOF** (modelo CLA / ADL).
- Eliminado cliente standalone `Mova.html` / `cli-mova`.
- Tarjeta **MOVA** en `MKOF.html` → sección Proyectos.
- Agente Cursor **`@mova`** en `.cursor/rules/mova.mdc`.
- Rama Git: `cursor/mova-cliente-portal-agente-7749` · PR #18.

### Rutas creadas

| Qué | Ruta |
|-----|------|
| Hub MOVA | `index/clientes/MKOF/MOVA.html` |
| Resumen (este archivo) | `index/clientes/MKOF/MOVA/RESUMEN.md` |
| Código del proyecto | `index/clientes/MKOF/MOVA/auditoria-charlas/` |
| Handoff completo | `docs/MKOF-MOVA-HANDOFF.md` |

### Ajustes de UX

- Fondo claro y tarjeta blanca en páginas MOVA (texto legible).
- Sección **Resumen del agente** en portal (lee este `RESUMEN.md`).

### Pendiente del workspace original

- Copiar el contenido real de **`MOVA-Auditoria-Charlas`** (Windows) a `auditoria-charlas/`.
- Completar abajo lo que hizo el **otro agente** en ese workspace (código, análisis, informes).

---

## Qué se hizo con el agente anterior (MOVA-Auditoria-Charlas)

<!-- Pega aquí el resumen del otro workspace / chat -->

- _Pendiente:_ el agente anterior trabajó en carpeta `MOVA-Auditoria-Charlas` fuera del repo.
- _Acción:_ copiar archivos a `auditoria-charlas/` y pedir a `@mova`: *«Actualiza RESUMEN.md con lo hecho»*.

---

## Entregables

| Entregable | Estado | Notas |
|------------|--------|-------|
| Integración portal MKOF/MOVA | Hecho | Ver PR #18 |
| Agente @mova en repo | Hecho | `.cursor/rules/mova.mdc` |
| Handoff online (Git) | Hecho | `docs/MKOF-MOVA-HANDOFF.md` |
| Código MOVA-Auditoria-Charlas | Pendiente | Copiar a `auditoria-charlas/` |
| Criterios / rúbrica | Pendiente | |
| Charlas auditadas | Pendiente | |
| Informe de hallazgos | Pendiente | |

---

## Comandos rápidos (otro PC)

```bat
cd /d "C:\Users\Josefa Ogalde\organizacion"
git fetch origin
git checkout cursor/mova-cliente-portal-agente-7749
git pull origin cursor/mova-cliente-portal-agente-7749
SERVIR.bat
```

URL: http://localhost:3000/index/clientes/MKOF/MOVA.html

---

## Próximos pasos

1. `git pull` en el otro computador (rama `cursor/mova-cliente-portal-agente-7749`).
2. Copiar `MOVA-Auditoria-Charlas` → `index/clientes/MKOF/MOVA/auditoria-charlas/`.
3. Completar sección «agente anterior» arriba.
4. Cursor: abrir carpeta `organizacion` → `@mova` para continuar trabajo.
5. Crear tarea en organizador: `?tarea=mkof/01` (rol MOVA).

---

## Archivos clave

- `docs/MKOF-MOVA-HANDOFF.md` — **toda la conversación y setup**
- `docs/cursor/INVOCAR-AGENTE-MOVA.md` — cómo invocar @mova
- `index/clientes/MKOF/MOVA/README.md` — URLs del portal
- `RESUMEN.md` — este resumen (visible en el navegador)
