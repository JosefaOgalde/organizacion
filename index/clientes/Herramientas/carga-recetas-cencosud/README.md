# Carga recetas Cencosud (CRC)

Automatiza **tu** Word o PDF Jumbo → JSON → [Business Manager](https://business-manager.ecomm.cencosud.com/) en **tu PC**. El cliente no cambia su flujo.

## Un clic (Windows)

Arrastra `Maremoto.pdf` (o el Word) encima de `CARGAR-RECETA-BM.bat` en la raíz del repo.

O en CMD, desde la carpeta del repo:

```bat
CARGAR-RECETA-BM.bat "C:\Users\josef\Downloads\Maremoto.pdf"
```

Eso copia a `inbox/`, parsea, abre Chromium para el scraping del BM y rellena en dry-run.

## Comandos sueltos (Maremoto / cualquier receta)

Copiar y pegar en CMD, carpeta del repo. Playwright + `.env` solo la primera vez.

```bat
cd /d C:\ruta\a\organizacion

REM 0) Una vez
pip install playwright
playwright install chromium
copy index\clientes\Herramientas\carga-recetas-cencosud\secrets\env.example index\clientes\Herramientas\carga-recetas-cencosud\secrets\.env
REM Edita secrets\.env: CENCOSUD_BM_USER (nunca lo pegues en el chat)

REM 1) Parse — Word o PDF Jumbo → JSON
copy /y "%USERPROFILE%\Downloads\Maremoto.pdf" index\clientes\Herramientas\carga-recetas-cencosud\inbox\
python scripts\parse-receta-word.py index\clientes\Herramientas\carga-recetas-cencosud\inbox\Maremoto.pdf

REM 2) Scraping / mapeo del Gestor (login ADFS/MFA en la ventana)
python scripts\explorar-bm-cencosud.py --reuse-session

REM 3) Rellenar la ficha (no publica)
python scripts\publicar-receta-cencosud.py index\clientes\Herramientas\carga-recetas-cencosud\out\maremoto.json --headed --dry-run
```

El paso 2 abre Chromium: entra con tu usuario, abre la receta (5 bloques al **centro**), vuelve a la terminal y pulsa ENTER. No toques los lápices.

`--dry-run` = rellena / intenta borrador, **no publica**.
Cuando confíes: quita `--dry-run` o pon `CENCOSUD_BM_DRY_RUN=false` en `.env`.

## Qué se hace en tu máquina (no en la nube)

El login ADFS y el MFA solo funcionan bien **en tu computador**, con navegador visible.

### Alternativa — solo 5 bloques BM (cualquier receta)

```bat
copy bloques-receta.template.json bloques\mi-receta.json
REM Edita cabecera · tags · ingredientes · instrucciones · seo
python scripts\expandir-bloques-receta.py bloques\mi-receta.json
```

Ver `BLOQUES-RECETA.md`.

Salidas del scraping (solo local, gitignored):

| Archivo | Qué es |
|---------|--------|
| `secrets/bm-session.json` | Sesión (cookies) |
| `secrets/bm-estructura.json` | Campos/botones detectados |
| `secrets/bm-selectores.json` | Mapa para rellenar |
| `secrets/bm-screenshot.png` | Captura |

Si un campo no se rellena: edita `secrets/bm-selectores.json` y reintenta.

## Agente Cursor

```
@herramientas
Cliente Herramientas · Proyecto CRC
```

## Carpetas

| Ruta | Uso |
|------|-----|
| `inbox/` | Word o PDF de entrada |
| `out/` | JSON listo |
| `secrets/` | `.env`, sesión y mapas (local) |
| `schema-receta.json` | Contrato del payload |
| `MAPA-CAMPOS-BM.md` | Word/JSON ↔ BM |

## Portal

Hub: `../Carga-recetas.html` · código **CRC**
