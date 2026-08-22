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

### 2) Explorar BM (scraping/mapeo local)

```bat
python scripts\explorar-bm-cencosud.py
```

1. Se abre Chromium en tu pantalla.  
2. Entras con tu usuario (a mano si pide MFA).  
3. Navegas hasta **Nueva receta** / el formulario.  
4. Vuelves a la terminal y pulsas **ENTER**.  

Se guardan (solo local, gitignored):

| Archivo | Qué es |
|---------|--------|
| `secrets/bm-session.json` | Sesión (cookies) |
| `secrets/bm-estructura.json` | Campos/botones detectados |
| `secrets/bm-selectores.json` | Mapa para rellenar |
| `secrets/bm-screenshot.png` | Captura |

### 3) Completar todos los campos del documento

```bat
python scripts\bm_fill_acordeones.py --headed --dry-run
```

Abre cada lápiz del CMS y rellena **acordeones** (ingredientes y pasos) ítem a ítem, más título, tiempos, tags y SEO del JSON. `--dry-run` = no publica. Cuando esté bien:

```bat
python scripts\bm_fill_acordeones.py --publish
```

## Agente Cursor

```
@herramientas
Cliente Herramientas · Proyecto CRC
```

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
