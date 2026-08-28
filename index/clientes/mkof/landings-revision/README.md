# Revisión de landings — Making Of

Panel para revisar cada landing del sitio actual (`grupomakingof.com`) y la **beta 2026** (`/mkof-beta-2026/`):

- **Izquierda:** captura (V1) o vista en vivo del beta (V2)
- **Derecha:** texto editable + comentarios

## Abrir el HTML (sin servidor)

En el Explorador:

`C:\Users\Josefa Ogalde\organizacion\index\clientes\mkof\landings-revision\index.html`

Doble clic en ese archivo, **o** doble clic en `ABRIR-LANDINGS-MKOF.bat` en la raíz del proyecto.

No hace falta `:8000`, ni ZIP, ni cambiar de rama.

## Versiones

| Versión | Textos | Enlace en vivo |
|--------|--------|----------------|
| **V1** | Sitio actual en producción | `https://grupomakingof.com/...` |
| **V2** | Beta 2026 (prueba cargada) | `https://grupomakingof.com/mkof-beta-2026/...` |

El selector **Versión** está arriba del panel. Los cambios se guardan por separado en el navegador (localStorage).

Hub del beta: https://grupomakingof.com/mkof-beta-2026/

## Con Laravel (opcional)

Si ya tienes `ABRIR-LARAVEL.bat` andando:

http://127.0.0.1:8000/index/clientes/mkof/landings-revision/

## Contenido

- `index.html` — panel
- `data.js` — textos V1 (sitio actual)
- `data-v2.js` — textos V2 (beta 2026)
- `shots/` — capturas V1
- `data.json` — respaldo JSON de V1

Los cambios se guardan en el navegador (localStorage). Usa **Exportar JSON** para compartir ediciones/comentarios.
