# MKOF · Prospectos RRSS orgánicas

Carpeta de trabajo para **análisis de posibles clientes** (redes sociales orgánicas).

## Cómo abrir

1. `git pull`
2. `ABRIR-LARAVEL.bat` (o `ABRIR-LARAVEL.bat todo`)
3. URL: http://127.0.0.1:8000/index/clientes/mkof/prospecto/?disco=1

También desde la landing MKOF → sección **Prospectos RRSS**.

## Estructura

```
prospecto/
  index.html          ← hub (patrones + lista de prospectos)
  README.md
  patrones/           ← láminas patrón (etapa 1 del análisis)
    01-ecosistema-rrss.png
    02-ecosistema-competencia.png
    03-oportunidades.png
    04-conclusiones.png
  slides/             ← versiones HTML rellenables
  clientes/           ← un subfolder por prospecto (cuando tengamos el nombre)
```

## Etapa 1 — láminas patrón

| # | Archivo | Uso |
|---|---------|-----|
| 01 | Ecosistema RRSS | Seguidores/alcance: 5 competidores + prospecto × FB / IG / LI / YT / TikTok |
| 02 | Ecosistema competencia | Formatos · temáticas · periodicidad (+ mockup perfil) |
| 03 | Oportunidades | 3 oportunidades en orgánico (título + bullet) |
| 04 | Conclusiones | 4 cuadrantes + centro CONCLUSIONES |

Si el prospecto avanza a otra etapa, se agregan más piezas dentro de `clientes/<slug>/`.

## Regla de data (obligatoria)

Cualquier **número** (seguidores, posts/semana, etc.) debe tener:

1. **Fuente** (URL del perfil, capturas, Social Blade, API oficial, etc.)
2. **Fecha de consulta**
3. **Nota de método** (ej. redondeo a “X mill”, alcance estimado vs seguidores exactos)

Queda en `clientes/<slug>/fuentes.json` (o markdown) para poder responder el *por qué* con fundamentos.

## Estado actual

| Prospecto | Nivel | Carpeta |
|-----------|-------|---------|
| Clínica Indisa | Detalle (RRSS + UX/UI) | `clientes/clinica-indisa/` |
| Grupo Flesan | General (marca · webs · RRSS) | `clientes/grupo-flesan/` |
