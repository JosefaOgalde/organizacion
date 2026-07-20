# Cómo ver / escuchar MOVA — etapa 2

**MOVA etapa 2** (docs + deck) está en `main` (PRs #88 y #90).  
**Audio de la charla** está en la rama `cursor/mova-ver-ahora-459d` (PR #92).  
El **PR #89** es Impresoreando, no MOVA.

## En tu PC (recomendado si main está “divergido”)

Tu `main` local a veces tiene 2 commits viejos y `origin/main` cientos. No uses `git pull` a ciegas.

```bat
git merge --abort
set GIT_EDITOR=true
git fetch origin cursor/mova-ver-ahora-459d
git checkout cursor/mova-ver-ahora-459d
git pull origin cursor/mova-ver-ahora-459d
ABRIR-MOVA.bat
```

El bat **ya no fuerza** cambiar a `main` si los archivos MOVA están en disco.  
Si el servidor Node falla (ruta con espacios), abre el **MP3 local** igual.

## Solo escuchar el audio (sin servidor)

En el Explorador de archivos:

`organizacion\index\clientes\mkof\audio\mova-etapa2-charla.mp3`

Doble clic → se reproduce en el reproductor de Windows.

## Links con servidor Node (:3000)

| Qué | URL |
|-----|-----|
| Hub MOVA | http://localhost:3000/index/clientes/MKOF/MOVA.html |
| Todos los documentos | http://localhost:3000/index/clientes/MKOF/MOVA/documentos/ |
| Deck 19 slides | http://localhost:3000/index/clientes/mkof/mova-etapa2-presentacion.html |
| Audio charla (~12 min) | http://localhost:3000/index/clientes/mkof/audio/ |
| MP3 directo | http://localhost:3000/index/clientes/mkof/audio/mova-etapa2-charla.mp3 |
| D3 Núcleo | http://localhost:3000/index/clientes/MKOF/MOVA/documentos/ver.html?id=d3-nucleo-mova-auth |
| D4 Login + cookie | http://localhost:3000/index/clientes/MKOF/MOVA/documentos/ver.html?id=d4-login-cookie |
| D5 Validación | http://localhost:3000/index/clientes/MKOF/MOVA/documentos/ver.html?id=d5-validacion-modulos |
| Cloudflare | http://localhost:3000/index/clientes/mkof/cloudflare-mova.html |
| Espejo cPanel | http://localhost:3000/index/clientes/mkof/cpanel-espejo.html |

## Links con Laravel (:8000)

```bat
ABRIR-LARAVEL.bat
```

Luego: http://127.0.0.1:8000/index/clientes/mkof/audio/

## Si querés alinear main con GitHub (borra commits locales de main)

```bat
git merge --abort
set GIT_EDITOR=true
git fetch origin main
git checkout main
git reset --hard origin/main
```

(solo si no tienes cambios locales en main que quieras guardar)

## Error típico que ya está corregido en ABRIR-MOVA.bat

- `Your branch and origin/main have diverged` → el bat ya no hace pull de main si los archivos están.
- `El sistema no puede encontrar la ruta especificada` → era el `start` con espacios en `Josefa Ogalde`; ahora usa `start /D`.
