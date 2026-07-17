# Flujo unificado — solo Laravel en :8000 (sin MySQL)

**No necesitas Laragon ni MySQL.** Si Laragon tira error de licencia, usa **SQLite**.

```bat
cd "C:\Users\Josefa Ogalde\organizacion"
git pull origin cursor/botones-tarea-madre-d478
USAR-SQLITE.bat
ABRIR-LARAVEL.bat
```

(Usa el `php.exe` de Laragon aunque la app Laragon no abra; solo hace falta PHP.)

---

## URLs (todas en 8000)

| Qué | URL |
|-----|-----|
| Organizador | http://127.0.0.1:8000/index.html?disco=1 |
| Portal | http://127.0.0.1:8000/index/clientes/ |
| API clientes | http://127.0.0.1:8000/api/clientes |
| API calendario | http://127.0.0.1:8000/api/organizacion |

---

## Qué hace SQLite

- Base en `backend/database/database.sqlite` (archivo local)
- Sin puerto 3306, sin servicio MySQL
- Misma API Laravel (`/api/clientes`, etc.)

---

## Seguir trabajando en la API

```bat
cd backend
php artisan serve
```

Editas `backend/app/Http/Controllers/Api/`.
