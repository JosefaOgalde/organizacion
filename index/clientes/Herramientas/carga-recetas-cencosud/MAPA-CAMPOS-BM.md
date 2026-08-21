# Mapa de campos · Word → JSON → Business Manager Cencosud

Destino: https://business-manager.ecomm.cencosud.com/  
Público de referencia: https://www.jumbo.cl/recetas

## Cómo mapear (local, con tu usuario)

1. En tu PC: `python scripts/explorar-bm-cencosud.py --reuse-session`
2. Login ADFS en la ventana (tu usuario; MFA si aplica).
3. Abre la receta en el **Gestor de contenido** (CMS por componentes).
4. Pulsa **ENTER** en la terminal. **No hagas clic en los lápices.**
5. El scraping abre solo cada lápiz (Cabecera, tags, Lista Ingredientes,
   Lista de Instrucciones, SEO HTML), captura inputs y cierra el editor.
6. Genera `secrets/bm-estructura.json` + `secrets/bm-selectores.json`
   (incluye `lapiz_*` por componente).
7. El navegador espera un segundo ENTER antes de cerrar.
8. Prueba (rellena acordeones ítem a ítem, sin publicar):
   `python scripts/bm_fill_acordeones.py`
   o `python scripts/publicar-receta-cencosud.py --headed --dry-run`

El BM Jumbo no es un formulario plano: título, tags, ingredientes, pasos y SEO viven
en componentes distintos. Ingredientes y pasos van en **acordeones** (Edición de Lista):
cada ítem del Word ocupa su fila (nombre / cantidad / unidad, o texto del paso).
El explorador y el publicador abren esos lápices automáticamente.

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
