# JSON de 5 bloques · Carga recetas Cencosud (CRC)

Plantilla para **cualquier receta**: solo editas los **5 bloques** del lienzo BM (Cabecera → tags → Ingredientes → Instrucciones → SEO).

## Archivos

| Archivo | Uso |
|---------|-----|
| `bloques-receta.template.json` | Copiar y renombrar en `bloques/` |
| `bloques/<slug>.json` | Tu receta (solo 5 bloques) |
| `scripts/expandir-bloques-receta.py` | Convierte → `out/<slug>.json` completo |
| `scripts/publicar-receta-cencosud.py` | Carga en BM (acepta bloques o receta completa) |

## Flujo rápido

```bat
copy bloques-receta.template.json bloques\mi-receta.json
REM Edita los 5 bloques en bloques\mi-receta.json

python scripts\expandir-bloques-receta.py bloques\mi-receta.json
python scripts\publicar-receta-cencosud.py bloques\mi-receta.json --headed --dry-run
```

`publicar-receta-cencosud.py` detecta solo y expande si el JSON trae `bloques`.

## Los 5 bloques (orden BM)

| # | Bloque JSON | Qué va en el BM |
|---|-------------|-----------------|
| 1 | `bloques.cabecera` | Título, descripción, porciones, tiempo, dificultad, alt foto |
| 2 | `bloques.tags` | Etiquetas / categorías |
| 3 | `bloques.ingredientes` | Lista de ingredientes |
| 4 | `bloques.instrucciones` | Pregunta H3 + pasos |
| 5 | `bloques.seo` | Meta título, meta descripción, consejos (HTML) |

### Dificultad (`cabecera.dificultad`)

Valores válidos: `muy facil` · `facil` · `media` · `dificil` · `absurdamente dificil` (sin tildes).

## Ejemplo mínimo

Ver `ejemplos/churrascas-bloques.json`.

## Payload real del CMS (post-carga)

Tras cargar en BM, el JSON de la vista queda con `component`: `cabecera` → `tags` → `list_ingredients` → `list_instructions` → `seo_html`.

Referencia cargada: `ejemplos/torta-de-yogurt-bm-view.json` (+ bloques CRC en `ejemplos/torta-de-yogurt-bloques.json`).

- `complexity`: `"5"` = Difícil · `duration` / `servings` = números
- Instrucciones: `group[0].title` = pregunta; cada `instruction` = un `<p>` HTML
- SEO: `seo_html.content` = `<h2>` + `<ul>` de tips
