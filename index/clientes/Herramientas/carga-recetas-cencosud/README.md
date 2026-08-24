# Carga recetas Cencosud (CRC)

Automatiza **tu** Word → completar ficha → [Business Manager](https://business-manager.ecomm.cencosud.com/) en **tu PC**. El cliente no cambia su flujo.

## Qué se hace en tu máquina (no en la nube)

El login ADFS y el MFA solo funcionan bien **en tu computador**, con navegador visible. No hace falta otra “máquina virtual”: es tu Windows + esta carpeta del repo.

### Una vez — preparar

```bat
cd ruta\a\organizacion
pip install playwright
playwright install chromium
copy index\clientes\Herramientas\carga-recetas-cencosud\secrets\env.example index\clientes\Herramientas\carga-recetas-cencosud\secrets\.env
```

Edita `secrets\.env` y pon tu usuario (y password si quieres intento de login automático). **Nunca subas `.env` a Git ni lo pegues en el chat.**

### 1) Word → JSON

```bat
copy TU-RECETA.docx index\clientes\Herramientas\carga-recetas-cencosud\inbox\
python scripts\parse-receta-word.py index\clientes\Herramientas\carga-recetas-cencosud\inbox\TU-RECETA.docx
```

Si ya existe el JSON o el `.raw.txt` del mismo título, el parser se detiene sin modificar
ninguno para proteger SKUs y ediciones manuales. Solo usa `--force` si quieres reemplazar
ambos archivos de forma destructiva.

### 2) Explorar BM (scraping/mapeo local)

```bat
python scripts\explorar-bm-cencosud.py --reuse-session
```

1. Se abre Chromium en tu pantalla.  
2. Entras con tu usuario (a mano si pide MFA).  
3. Abres la **receta** en el Gestor de contenido (lista de componentes).  
4. Vuelves a la terminal y pulsas **ENTER**.  
5. **No toques los lápices:** el script los abre solo (Cabecera, tags, ingredientes, instrucciones, SEO), captura campos y cierra cada editor.

Se guardan (solo local, gitignored):

| Archivo | Qué es |
|---------|--------|
| `secrets/bm-session.json` | Sesión (cookies) |
| `secrets/bm-estructura.json` | Campos/botones detectados (por componente) |
| `secrets/bm-selectores.json` | Mapa para rellenar + `lapiz_*` |
| `secrets/bm-screenshot.png` | Captura |

### 3) Completar la info en la interfaz (relleno + guardar)

`explorar` solo mapea. Para **cargar** la receta:

```bat
python scripts\publicar-receta-cencosud.py index\clientes\Herramientas\carga-recetas-cencosud\out\anticuchos-de-verduras-con-chimichurri.json --headed --dry-run
```

`--dry-run` = rellena cada componente, **guarda** el editor y intenta borrador; **no publica**.  
Cuando confíes: quita `--dry-run` o pon `CENCOSUD_BM_DRY_RUN=false` en `.env`.

En modo publicación, tanto el publicador como `explorar-bm-cencosud.py --publish` solo
aceptan JSON en `estado: listo-para-cargar`. Bloquean antes de abrir el navegador si hay
`camposFaltantes` bloqueantes o faltan título, descripción, ingredientes o pasos
(`ingredientes.skuCencosud` sigue siendo opcional). También abortan si alguno de esos
cuatro campos no logra rellenarse. El clic en
**Publicar** deja el JSON en `estado: cargado`; solo una confirmación posterior en BM
permite marcarlo como `publicado`. Así, volver a ejecutar por accidente no duplica una
solicitud ya enviada.

Si un campo no se rellena: edita `secrets/bm-selectores.json` (selectores) y reintenta. También puedes re-explorar con la receta abierta en el CMS (sin clic en lápices).
Los campos editoriales y SEO usan selectores distintos; un botón combinado
«Guardar y publicar» nunca se usa como guardado de borrador en `--dry-run`.

Si tras explorar ves todos los selectores en `None` (BM sin id/name), regenera sin abrir el navegador:

```bat
python scripts\explorar-bm-cencosud.py --remap
```

(usa los labels de `bm-estructura.json`). Si sigue vacío, vuelve a explorar con la ficha de la receta abierta en el Gestor de contenido.
## Pruebas automáticas (sin BM real)

```bat
pip install playwright
playwright install chromium
python -m unittest discover -s tests -v
```

Incluye HTML fixtures (`bm-formulario-receta.html` y `bm-cms-componentes.html`) para probar mapeo, auto-lápiz del CMS y relleno dry-run **sin login ADFS**. La exploración real del BM sigue siendo solo en tu PC.
## Carpetas

| Ruta | Uso |
|------|-----|
| `inbox/` | Word de entrada |
| `out/` | JSON listo |
| `secrets/` | `.env`, sesión y mapas (local) |
| `schema-receta.json` | Contrato del payload |
| `MAPA-CAMPOS-BM.md` | Word/JSON ↔ BM |

## Portal

Hub: `../Carga-recetas.html` · código **CRC**
