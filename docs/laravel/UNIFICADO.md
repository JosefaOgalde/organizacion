# Stack oficial — Laravel + SQLite (sin Laragon)

**De ahora en adelante:** un solo servidor. Sin Laragon, sin MySQL, sin Node, sin puerto 3000.

```bat
cd "C:\Users\Josefa Ogalde\organizacion"
ABRIR-LARAVEL.bat
```

---

## URLs

| Qué | URL |
|-----|-----|
| Organizador | http://127.0.0.1:8000/index.html |
| Portal | http://127.0.0.1:8000/index/clientes/ |
| API clientes | http://127.0.0.1:8000/api/clientes |
| API calendario | http://127.0.0.1:8000/api/organizacion |

Base de datos: `backend/database/database.sqlite`

---

## Requisitos

- Carpeta `backend/` con Laravel
- `php.exe` en PATH **o** el de `C:\laragon\bin\php\...` (solo el ejecutable; **no** abras la app Laragon)

---

## Trabajar en la API

```bat
cd backend
php artisan serve
```

Controladores: `backend/app/Http/Controllers/Api/`

---

## Respaldo del calendario

`data/organizacion-respaldo-2026-07-17.json` → se copia a `organizacion-live.json` al arrancar.
