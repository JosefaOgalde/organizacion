# Mapa de campos · Word → JSON → Business Manager Cencosud

Destino: https://business-manager.ecomm.cencosud.com/  
Público de referencia: https://www.jumbo.cl/recetas

## Cómo mapear (local, con tu usuario)

1. En tu PC: `python scripts/explorar-bm-cencosud.py --reuse-session`
2. Login ADFS en la ventana (tu usuario; MFA si aplica).
3. El script te deja en el **Administrador de vistas** (Recetas_Jumbo).
4. Busca la receta a mano, ábrela hasta ver **Cabecera / tags / listas / SEO**.
5. Pulsa **ENTER** en la terminal. **No hagas clic en los lápices.**
6. El scraping abre solo cada lápiz, captura inputs y cierra el editor.
7. Genera `secrets/bm-estructura.json` + `secrets/bm-selectores.json`
   (incluye `lapiz_*` por componente).
8. El navegador espera un segundo ENTER antes de cerrar.
9. Prueba **relleno** (esto sí escribe la receta; explorar solo mapea):
   `python scripts/publicar-receta-cencosud.py out/….json --headed --dry-run`
   (también aterriza en el Administrador de vistas para que busques y abras la ficha).

URL de vistas (configurable en `secrets/.env`):
`CENCOSUD_BM_VIEW_MANAGER_URL=https://business-manager.ecomm.cencosud.com/cms/projects/6597f023fdc664839ccd2a37/view-manager`


Opcional: `--no-auto-lapiz` solo captura la vista actual (diagnóstico).

No se scrapea desde un servidor en la nube: es **navegador local** con tus credenciales.
## Quién hace qué

| Actor | Rol |
|-------|-----|
| **Cliente final** | No envía Word ni entra al BM. |
| **Tú** | Word + accesos BM en tu PC; abres la receta en el CMS. |
| **Scripts CRC** | Parsean Word, abren lápices, mapean y rellenan campos. |

## Campos

| Campo JSON | Suele venir del Word | Clave en `bm-selectores.json` |
|------------|----------------------|-------------------------------|
| `titulo` | Título editorial | `field_titulo` (comp. Cabecera) |
| `descripcion` / meta desc | Meta descripción | `field_descripcion` |
| `porciones` | Barra `N porciones` | `field_porciones` |
| `tiempoTotal` | Barra `35 min` | `field_tiempo` |
| `dificultad` | Barra `Fácil` | `field_dificultad` |
| `categorias[]` | Tags | `field_tags` |
| `ingredientes[]` | Lista | `field_ingredientes` |
| `pasos[]` | Paso a paso | `field_pasos` |
| `seo.metaTitulo` | Meta título | `field_meta_titulo` |
| `seo.metaDescripcion` | Meta descripción | `field_meta_descripcion` |
| — | Lápiz Cabecera | `lapiz_cabecera` |
| — | Lápiz tags | `lapiz_tags` |
| — | Lápiz ingredientes | `lapiz_ingredientes` |
| — | Lápiz instrucciones | `lapiz_instrucciones` |
| — | Lápiz SEO | `lapiz_seo` |
| — | Botón guardar | `btn_guardar_borrador` |
| — | Botón publicar | `btn_publicar` |
| — | Link nueva receta | `nav_nueva_receta` |

## Checklist

1. Login ADFS OK (sesión en `bm-session.json`).
2. Receta abierta en el Gestor de contenido al pulsar ENTER.
3. Selectores revisados en `bm-selectores.json` (campos + `lapiz_*`).
4. Prueba `--dry-run` antes de publicar.
5. Nunca commits de `secrets/.env` ni `bm-session.json`.
6. Durante el relleno: **no cierres Chromium** ni uses **Ctrl+C** a mitad
   (provoca `TargetClosedError`). El script ya no pulsa Escape si no ve Guardar.
