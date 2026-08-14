# IRJ · Continuar en otro PC (guardado 14-ago-2026)

**Pausa BM:** no seguir corriendo el script hasta retomar con calma.  
**Siguiente sesión:** mañana en **otro PC** → primero `git pull` de esta rama.

## Sync entre PCs

```bat
cd ruta\a\organizacion
git fetch
git checkout cursor/imp-resumen-pdf
git pull
```

Si el push de este PC falló (403), desde un PC con acceso a GitHub:

```bat
git push -u origin cursor/imp-resumen-pdf
```

Luego en el otro PC: `git pull` de esa rama.

**No vienen en Git (hay que rehacer local):**

- `secrets/bm-session.json` → login BM de nuevo (`explorar-bm-cencosud.py` o al correr publicar)
- `secrets/.env` → copiar desde `secrets/env.example` si hace falta
- Cookies / MFA

**Sí vienen en el repo (esta rama):** scripts, docs, JSON salmón, Word inbox, `CONTINUAR-*.md`, portal IRJ.

## Qué estábamos haciendo

Receta: **Salmón a la parrilla con salsa de palta**  
Vista BM: `salmon_a_la_parrilla_palta` (PRODUCTION)  
Word: `inbox/Salmón a la parrilla con salsa de palta.docx`  
JSON: `out/salmon-a-la-parrilla-con-salsa-de-palta.json`  
URL gestor (referencia): ver `secrets/bm-receta-url.txt` si existe localmente, o:

`https://business-manager.ecomm.cencosud.com/cms/projects/6597f023fdc664839ccd2a37/view-manager/view/660f47f182f32694e4a6e2a4`

Flujo: **tú** dejas bloques en el Gestor → script rellena (lápiz → datos → **Guardar** → Volver). **Nunca Publicar.**  
Meta actual: Cabecera (+ imagen Word) → Guardar → tags → **parar** (`--hasta tags`).

## Comandos al retomar

```bat
cd ruta\a\organizacion
pip install playwright
playwright install chromium

python scripts\parse-receta-word.py "index\clientes\Herramientas\implementacion-recetas-jumbo\inbox\Salmón a la parrilla con salsa de palta.docx"

python scripts\publicar-receta-cencosud.py index\clientes\Herramientas\implementacion-recetas-jumbo\out\salmon-a-la-parrilla-con-salsa-de-palta.json --headed --hasta tags
```

ENTER con Gestor listo (o «Edición de Cabecera»).

## Foto del Word

`https://drive.google.com/file/d/1u2z-oBQeGHopYUtVpam0bfGvFSpf5OIB/view?usp=drive_link`  
→ `imagenes[0].url` en el JSON → campo **Imagen** de Cabecera.

## Dificultad BM

`Muy fácil` / `Fácil` / `Intermedio` / `Difícil` / `Muy difícil`

## Scripts / docs

| Archivo | Rol |
|---------|-----|
| `scripts/parse-receta-word.py` | Word→JSON + URL `([Foto])` |
| `scripts/bm_fill_acordeones.py` | Lápiz, fill, imagen, Guardar, Volver, `--hasta` |
| `scripts/publicar-receta-cencosud.py` | Orquesta; default `--hasta tags` |
| `scripts/explorar-bm-cencosud.py` | Sesión / dump DOM |
| `MAPA-CAMPOS-BM.md` | Mapa campos |
| `README.md` | Setup |
| `Implementacion-recetas-jumbo.html` | Portal HER |

## Bug abierto (prioridad)

Tras rellenar (incluso con imagen), al Volver el bloque puede seguir **vacío**.  
Causa: Guardar deshabilitado → si se acepta «Si, acepto», se descarta todo.  
Mitigación en código: forzar dirty, no descartar si hubo datos, pedir Guardar a mano.

Validar: tras Guardar real, Cabecera ya no dice «Edita este componente vacío…».

## Pendientes después de Cabecera+tags

- Lápiz a veces abre header en vez de tags  
- `Agregar nuevo ítem` frágil  
- No correr ingredientes/instrucciones/SEO hasta que Cabecera+tags guarden bien  

## Checklist retomar

1. `git pull` rama `cursor/imp-resumen-pdf`  
2. Login BM + sesión local  
3. Gestor salmón con 5 bloques  
4. Parse + `publicar … --hasta tags`  
5. Confirmar Cabecera **persiste** tras Guardar+Volver  
6. Confirmar tags  
7. Solo entonces ingredientes  

## Reglas

- Guardar = sí · Publicar = no  
- No buscar recetas en Administrador de vistas  
- No commits de `bm-session.json` / `.env` / secrets
