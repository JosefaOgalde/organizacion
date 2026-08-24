# Mapa de campos · Word → JSON → Business Manager Cencosud

Destino: https://business-manager.ecomm.cencosud.com/  
Público de referencia: https://www.jumbo.cl/recetas

## Cómo mapear (local, con tu usuario)

1. En tu PC: `python scripts/explorar-bm-cencosud.py`
2. Login ADFS en la ventana (tu usuario; MFA si aplica).
3. Abre el formulario de **nueva receta**.
4. ENTER en la terminal → genera `secrets/bm-estructura.json` + `secrets/bm-selectores.json`.
5. Revisa/ajusta selectores y prueba:
   `python scripts/publicar-receta-cencosud.py out/….json --headed --dry-run`

No se scrapea desde un servidor en la nube: es **navegador local** con tus credenciales.

## Quién hace qué

| Actor | Rol |
|-------|-----|
| **Cliente final** | No envía Word ni entra al BM. |
| **Tú** | Word + accesos BM en tu PC. |
| **Scripts CRC** | Parsean Word, mapean formulario, rellenan campos. |

## Campos

| Campo JSON | Suele venir del Word | Clave en `bm-selectores.json` |
|------------|----------------------|-------------------------------|
| `titulo` | Título editorial | `field_titulo` |
| `descripcion` / meta desc | Meta descripción | `field_descripcion` |
| `porciones` | Barra `N porciones` | `field_porciones` |
| `tiempoTotal` | Barra `35 min` | `field_tiempo` |
| `dificultad` | Barra `Fácil` | `field_dificultad` |
| `categorias[]` | Tags | lápiz bloque tags → popup → **`Sí, acepto`** (`btn_tags_guardar`) |
| `ingredientes[]` | Lista | `field_ingredientes` |
| `pasos[]` | Paso a paso | `field_pasos` |
| `seo.metaTitulo` | Meta título | `field_meta_titulo` |
| `seo.metaDescripcion` | Meta descripción | `field_meta_descripcion` |
| — | Botón guardar | `btn_guardar_borrador` |
| — | Botón publicar | `btn_publicar` |
| — | Link nueva receta | `nav_nueva_receta` |

## Checklist

1. Login ADFS OK (sesión en `bm-session.json`).
2. Formulario de receta abierto al capturar.
3. Selectores revisados en `bm-selectores.json`.
4. Prueba `--dry-run` antes de publicar.
5. Nunca commits de `secrets/.env` ni `bm-session.json`.
