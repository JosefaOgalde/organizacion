# Revisión de landings — Making Of

Panel para revisar cada landing del sitio actual (`grupomakingof.com`):

- **Izquierda:** pantallazo general
- **Derecha:** texto editable + comentarios

## En tu PC (Windows)

**No uses `127.0.0.1:8765`** — ese puerto era solo del agente en la nube.

### Opción rápida
Doble clic en la raíz del repo:

`ABRIR-LANDINGS-MKOF.bat`

### Con el flujo de siempre
1. `EMPEZAR-AQUI.bat` o `ABRIR-LARAVEL.bat` (deja `:8000` andando)
2. Abre:

http://127.0.0.1:8000/index/clientes/mkof/landings-revision/

Si la carpeta no existe aún:

```bat
git fetch origin
git checkout cursor/arbol-animacion-3ba0
git pull origin cursor/arbol-animacion-3ba0
```

## Contenido

- `index.html` — panel
- `data.json` — textos base
- `shots/` — capturas

Los cambios se guardan en el navegador (localStorage). Usa **Exportar JSON** para compartir ediciones/comentarios.
