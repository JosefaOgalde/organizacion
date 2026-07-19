# Cómo ver MOVA — etapa 2

**MOVA está en `main`** (PRs #88 y #90). El **PR #89** es Impresoreando, no MOVA.

## En tu PC (si “no lo veo”)

```bat
git merge --abort
set GIT_EDITOR=true
git checkout main
git pull origin main --no-edit
ABRIR-MOVA.bat
```

Se abren: hub MOVA · documentos · presentación etapa 2 · landing MKOF.

## Links directos (:3000)

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

## Si el pull de main pide vim

```bat
set GIT_EDITOR=true
git pull origin main --no-edit
```

O cancela todo y reinicia:

```bat
git merge --abort
git fetch origin main
git reset --hard origin/main
ABRIR-MOVA.bat
```

(solo si no tienes cambios locales que quieras guardar)
