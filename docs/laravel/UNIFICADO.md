# Stack oficial — Laravel + SQLite (cualquier PC)

Guía corta: [`EN-CUALQUIER-PC.md`](./EN-CUALQUIER-PC.md)

## Siempre igual

```bat
cd "C:\Users\Josefa Ogalde\organizacion"
git pull
ABRIR-LARAVEL.bat
```

| Qué | URL |
|-----|-----|
| Organizador | http://127.0.0.1:8000/index.html |
| Portal | http://127.0.0.1:8000/index/clientes/ |
| API clientes | http://127.0.0.1:8000/api/clientes |
| API calendario | http://127.0.0.1:8000/api/organizacion |

**Sin** Laragon, MySQL, Node ni puerto 3000.

## Dónde vive la info (no duplicar)

| Dato | Archivo |
|------|---------|
| Calendario / madres | `data/organizacion-live.json` |
| Clientes API | `backend/database/database.sqlite` |

Al cambiar de PC, lleva esos dos archivos con la carpeta del proyecto (OneDrive) o cópialos a mano.

## API

```bat
cd backend
php artisan serve --host=127.0.0.1 --port=8000
```

Controladores: `backend/app/Http/Controllers/Api/`
