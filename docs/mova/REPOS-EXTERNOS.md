# Repos externos MOVA (registro)

Fuera del repo `organizacion`. No se mezclan con el portal Laravel salvo enlaces de documentación.

| Repo | URL | Rol | Acceso Josefa | Notas 20 jul 2026 |
|------|-----|-----|---------------|-------------------|
| **mova-repo** (Juan) | https://github.com/juanemedinar/mova-repo | Respaldos n8n JSON + PHP espejo | Colaboradora (`josefa-ogalde`) | Privado · carpetas `respaldo-10-07-2026`, `php-respaldo-20-07-2026`, `php-respaldo-mova` |
| **mova-n8n-workflows** | (GitHub MOVA / Making Of) | Backup workflows n8n versionados | Según equipo | Hito 1.1 — ya operativo |

## Cómo clonar mova-repo (Juan)

```bat
cd /d "C:\Users\Josefa Ogalde\Downloads"
git clone https://github.com/juanemedinar/mova-repo.git
```

Usuario GitHub: `josefa-ogalde` · Password: Personal Access Token (permiso `repo`).

Copia local típica: `C:\Users\Josefa Ogalde\Downloads\mova-repo`

## Relación con `organizacion`

| Qué | Dónde |
|-----|--------|
| Portal / guías / PPT / auditoría | Este repo (`organizacion`) → ver con `ABRIR-LARAVEL.bat` |
| Respaldos grandes PHP/n8n JSON | Repo Juan `mova-repo` |
| Espejo cPanel liviano (sin secretos) | `index/clientes/mkof/espejo-cpanel/` en `organizacion` |

No pegar `config.php` ni secretos en ningún repo.
