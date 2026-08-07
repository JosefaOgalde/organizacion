# Invocar agente Herramientas (HER)

Herramientas es el **laboratorio interno** (utilidades propias): Tendencias recetas Chile (TEND) y ideación beauty → landing.

## Forma más rápida

1. **Ctrl + L** (chat)
2. Escribe **`@herramientas`**
3. Tu pregunta:

```
Cliente Herramientas · Proyecto TEND
Refrescar el feed de tendencias y revisar ítems sin fecha verificable.
```

O para beauty:

```
Cliente Herramientas · Proyecto beauty
Armar brief de landing para la tendencia [nombre] con la plantilla PLANTILLA-BRIEF-LANDING.txt.
```

## Ver en el navegador

Con `ABRIR-LARAVEL.bat` / `EMPEZAR-AQUI.bat` (puerto **8000**):

| Página | URL |
|--------|-----|
| Landing HER | `http://127.0.0.1:8000/index/clientes/herramientas/` |
| Tendencias (TEND) | `http://127.0.0.1:8000/index/clientes/Herramientas/Tendencias.html` |
| Beauty (docs) | carpeta `index/clientes/Herramientas/tendencias-beauty-landing/` |
| Organizador | `http://127.0.0.1:8000/index.html?tarea=herramientas/01` |

## Refrescar el feed TEND

```bash
python3 scripts/actualizar-tendencias-comida.py
```

El JSON vive en `data/tendencias-comida-chile.json`.

## Activación automática

Abre archivos en `index/clientes/herramientas/`, `index/clientes/Herramientas/`, assets `tendencias-*` o el feed JSON — Cursor activa la regla `@herramientas`.

Regla: `.cursor/rules/herramientas.mdc`
