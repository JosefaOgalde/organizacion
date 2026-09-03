# Revisión de landings — Making Of

Panel para revisar cada landing del sitio actual (`grupomakingof.com`):

- **Izquierda:** pantallazo general
- **Derecha:** texto editable + comentarios

## En tu PC (Windows) — sin servidor

1. Trae la branch:
```bat
git fetch origin
git checkout cursor/arbol-animacion-3ba0
git pull origin cursor/arbol-animacion-3ba0
```

2. Doble clic en `ABRIR-LANDINGS-MKOF.bat`  
   **o** abre directo:
   `index\clientes\mkof\landings-revision\index.html`

No hace falta `:8000` ni `:8765`.

## Con Laravel (opcional)

Si ya tienes `EMPEZAR-AQUI.bat` / `ABRIR-LARAVEL.bat` andando:

http://127.0.0.1:8000/index/clientes/mkof/landings-revision/

## Contenido

- `index.html` — panel
- `data.js` — textos base (también hay `data.json`)
- `shots/` — capturas

Los cambios se guardan en el navegador (localStorage). Usa **Exportar JSON** para compartir ediciones/comentarios.
