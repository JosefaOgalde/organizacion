# Invocar agente Herramientas (HER)

Herramientas es el **laboratorio interno**: Tendencias recetas Chile (TEND), ideación beauty → landing, y **carga de recetas a Business Manager Cencosud (CRC)**.

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

O para carga Cencosud (tú tienes el Word y los accesos BM):

```
Cliente Herramientas · Proyecto CRC
Parsear inbox/[archivo].docx, completar camposFaltantes y dejar JSON en listo-para-cargar.
```

## Ver en el navegador

Con `ABRIR-LARAVEL.bat` / `EMPEZAR-AQUI.bat` (puerto **8000**):

| Página | URL |
|--------|-----|
| Landing HER | `http://127.0.0.1:8000/index/clientes/herramientas/` |
| Tendencias (TEND) | `http://127.0.0.1:8000/index/clientes/Herramientas/Tendencias.html` |
| Carga recetas (CRC) | `http://127.0.0.1:8000/index/clientes/Herramientas/Carga-recetas.html` |
| Beauty (docs) | carpeta `index/clientes/Herramientas/tendencias-beauty-landing/` |
| Organizador | `http://127.0.0.1:8000/index.html?tarea=herramientas/01` |
| Business Manager | `https://business-manager.ecomm.cencosud.com/` |

## Refrescar el feed TEND

```bash
python3 scripts/actualizar-tendencias-comida.py
```

El JSON vive en `data/tendencias-comida-chile.json`.

## CRC — Word → BM

```bash
# 1) Word en inbox/
python3 scripts/parse-receta-word.py index/clientes/Herramientas/carga-recetas-cencosud/inbox/TU.docx

# 2) Revisar / completar out/*.json con @herramientas

# 3) Publicar (selectores mapeados + secrets/.env local)
python3 scripts/publicar-receta-cencosud.py index/clientes/Herramientas/carga-recetas-cencosud/out/TU.json --dry-run
```

Docs: `carga-recetas-cencosud/README.md` · `MAPA-CAMPOS-BM.md`

## Activación automática

Abre archivos en `index/clientes/herramientas/`, `index/clientes/Herramientas/`, assets `tendencias-*`, scripts CRC o el feed JSON — Cursor activa la regla `@herramientas`.

Regla: `.cursor/rules/herramientas.mdc`
