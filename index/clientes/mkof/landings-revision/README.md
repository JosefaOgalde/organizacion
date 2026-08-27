# Revisión de landings — Making Of

Panel para revisar cada landing del sitio actual (`grupomakingof.com`):

- **Izquierda:** pantallazo general
- **Derecha:** texto editable + comentarios

## Cómo abrirlo

Desde esta carpeta:

```bash
python3 -m http.server 8765
```

Luego abre: http://127.0.0.1:8765/

Los cambios se guardan en el navegador (localStorage). Usa **Exportar JSON** para compartir ediciones/comentarios.

## Contenido

- `index.html` — panel
- `data.json` — textos base
- `shots/` — capturas
