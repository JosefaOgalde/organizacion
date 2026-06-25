# Backend Laravel — Organización

Aquí vivirá la API PHP. **Aún no está instalado** — lo creas en el [Paso 1](../docs/laravel/PASO-1-entorno.md).

```powershell
cd "C:\Users\Josefa Ogalde\organizacion"
composer create-project laravel/laravel backend
```

## Estructura final (preview)

```
backend/
├── app/
│   ├── Http/Controllers/Api/   ← lógica de la API
│   └── Models/                 ← Cliente, Tarea, Proyecto
├── database/
│   └── migrations/             ← tablas SQL versionadas
├── routes/
│   └── api.php                 ← URLs /api/clientes, etc.
└── .env                        ← conexión MySQL
```

## Arrancar

```powershell
cd backend
php artisan serve
```

→ http://127.0.0.1:8000
