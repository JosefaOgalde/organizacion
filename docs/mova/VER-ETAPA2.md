# Cómo ver MOVA — etapa 2 (auditoría D1–D5 + deck)

**Importante:** esto está en `main` (PRs **#88** y **#90**). El **PR #89** es Impresoreando, no MOVA.

## En tu PC

```bat
git checkout main
git pull
ABRIR-MOVA.bat
```

Se abren el portal MKOF, el hub MOVA, el catálogo de documentos y la presentación.

## URLs (servidor en :3000)

| Qué | URL |
|-----|-----|
| Hub MOVA | http://localhost:3000/index/clientes/MKOF/MOVA.html |
| Todos los documentos | http://localhost:3000/index/clientes/MKOF/MOVA/documentos/ |
| Deck etapa 2 (19 slides) | http://localhost:3000/index/clientes/mkof/mova-etapa2-presentacion.html |
| Landing MKOF | http://localhost:3000/index/clientes/mkof/ |
| D1 Inventario | http://localhost:3000/index/clientes/MKOF/MOVA/documentos/ver.html?id=d1-inventario-status |
| D2 Reglas | http://localhost:3000/index/clientes/MKOF/MOVA/documentos/ver.html?id=d2-reglas-mova-auth |
| D3 Núcleo | http://localhost:3000/index/clientes/MKOF/MOVA/documentos/ver.html?id=d3-nucleo-mova-auth |
| D4 Login + cookie | http://localhost:3000/index/clientes/MKOF/MOVA/documentos/ver.html?id=d4-login-cookie |
| D5 Validación | http://localhost:3000/index/clientes/MKOF/MOVA/documentos/ver.html?id=d5-validacion-modulos |
| Cloudflare fácil | http://localhost:3000/index/clientes/mkof/cloudflare-mova.html |
| Espejo cPanel | http://localhost:3000/index/clientes/mkof/cpanel-espejo.html |
| Guion 20 min | `docs/mova/GUION-PRESENTACION-ETAPA2.md` |
| Cierre D1–D5 | `docs/MKOF-MOVA-AUDITORIA-D1-D5-CIERRE.md` |

## Si no ves D3–D5 / la presentación

Estás en una rama vieja (p. ej. Impresoreando). Volvé a `main` y `git pull`.
