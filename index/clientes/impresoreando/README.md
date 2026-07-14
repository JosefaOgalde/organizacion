# Impresoreando (IMP)

Cliente nuevo en el portal y el organizador.

## Color (único)

| Key organizer | border | bg | text |
|---|---|---|---|
| `ambar` | `#d4b06a` | `#faf6eb` | `#7a5c28` |

No reutilizar `ambar` en otro cliente.

## Cómo visualizarlo (Windows)

Doble clic:

```bat
ABRIR-IMPRESOREANDO.bat
```

O desde la carpeta del repo:

```bat
SERVIR.bat
```

Luego abre en el navegador:

- Landing: http://localhost:3000/index/clientes/impresoreando/
- Portal clientes: http://localhost:3000/index/clientes/
- Organizador: http://localhost:3000/index.html?disco=1

Alternativa sin `.bat`:

```bat
node scripts\organizacion-server.js
```

## Cómo visualizarlo (Cloud / Linux)

```bash
cd /workspace
node scripts/organizacion-server.js
```

URLs iguales (`localhost:3000`…).

## Archivos

| Archivo | Rol |
|---------|-----|
| `index/assets/clientes-data.js` | Card del portal + tema |
| `index/clientes/impresoreando/index.html` | Landing |
| `index/clientes/Impresoreando.html` | Redirect |
| `app.js` | Color `ambar` + seed + agente |
| `ABRIR-IMPRESOREANDO.bat` | Atajo Windows |
