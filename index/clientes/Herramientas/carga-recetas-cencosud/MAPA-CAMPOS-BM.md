# Mapa de campos · Word → JSON → Business Manager Cencosud

Destino: https://business-manager.ecomm.cencosud.com/  
Público de referencia: https://www.jumbo.cl/recetas

## Cómo mapear (local, con tu usuario)

1. En tu PC: `python scripts/explorar-bm-cencosud.py --reuse-session`
2. Login ADFS en la ventana (tu usuario; MFA si aplica).
3. Abre la receta en el **Gestor de contenido** (CMS por componentes).
4. **No captures la lista vacía.** Haz clic en el **lápiz** de un componente
   (p. ej. **Cabecera**, **Lista Ingredientes**, **Lista de Instrucciones**, **SEO HTML**)
   hasta ver inputs editables.
5. ENTER en la terminal → genera `secrets/bm-estructura.json` + `secrets/bm-selectores.json`.
6. El navegador espera un segundo ENTER antes de cerrar.
7. Revisa/ajusta selectores y prueba:
   `python scripts/publicar-receta-cencosud.py out/….json --headed --dry-run`

El BM Jumbo no es un formulario plano: título, tags, ingredientes, pasos y SEO viven
en componentes distintos. Puede hacer falta mapear **varios** editores (un capture por componente).

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
| `categorias[]` | Tags | `field_tags` |
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
