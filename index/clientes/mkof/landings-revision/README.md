# Revisión de landings — Making Of

Panel para revisar cada landing del sitio actual (`grupomakingof.com`):

- **Izquierda:** pantallazo general
- **Derecha:** texto editable + comentarios

## Abrir el HTML (sin servidor)

En el Explorador:

`C:\Users\Josefa Ogalde\organizacion\index\clientes\mkof\landings-revision\index.html`

Doble clic en ese archivo, **o** doble clic en `ABRIR-LANDINGS-MKOF.bat` en la raíz del proyecto.

No hace falta `:8000`, ni ZIP, ni cambiar de rama.

## Con Laravel (opcional)

Si ya tienes `ABRIR-LARAVEL.bat` andando:

http://127.0.0.1:8000/index/clientes/mkof/landings-revision/

## Contenido

- `index.html` — panel
- `data.js` — textos base (también hay `data.json`)
- `shots/` — capturas

Los cambios se guardan en el navegador (localStorage). Usa **Exportar JSON** para compartir ediciones/comentarios.
