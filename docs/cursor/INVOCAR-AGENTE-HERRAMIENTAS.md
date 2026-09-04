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

## CRC — Word → BM (en TU PC)

El login ADFS/MFA y el relleno del formulario se hacen con Playwright **en tu computador** (navegador visible), no en un servidor remoto.

```bash
# Una vez
pip install playwright && playwright install chromium
cp index/clientes/Herramientas/carga-recetas-cencosud/secrets/env.example \
   index/clientes/Herramientas/carga-recetas-cencosud/secrets/.env
# Edita .env con tu usuario (nunca lo pegues en el chat)

# Parse Word o PDF Jumbo
python3 scripts/parse-receta-word.py index/clientes/Herramientas/carga-recetas-cencosud/inbox/Maremoto.pdf

# Mapear estructura del BM (abre Chromium; tú entras; abres la receta; ENTER)
python3 scripts/explorar-bm-cencosud.py --reuse-session

# Rellenar interfaz (dry-run = no publicar)
python3 scripts/publicar-receta-cencosud.py \
  index/clientes/Herramientas/carga-recetas-cencosud/out/maremoto.json --headed --dry-run
```

Un clic en Windows: `CARGAR-RECETA-BM.bat "C:\Users\josef\Downloads\Maremoto.pdf"`

Docs: `carga-recetas-cencosud/README.md` · `MAPA-CAMPOS-BM.md`

## Activación automática

Abre archivos en `index/clientes/herramientas/`, `index/clientes/Herramientas/`, assets `tendencias-*`, scripts CRC o el feed JSON — Cursor activa la regla `@herramientas`.

Regla: `.cursor/rules/herramientas.mdc`
