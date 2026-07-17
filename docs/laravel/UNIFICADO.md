# Flujo unificado — solo Laravel en :8000

**Un solo servidor. Un solo origen.**

```bat
cd "C:\Users\Josefa Ogalde\organizacion"
ABRIR-LARAVEL.bat
```

(Laragon → **Start All**, MySQL verde.)

---

## URLs (todas en 8000)

| Qué | URL |
|-----|-----|
| Organizador | http://127.0.0.1:8000/index.html?disco=1 |
| Portal clientes | http://127.0.0.1:8000/index/clientes/ |
| API clientes | http://127.0.0.1:8000/api/clientes |
| API calendario | http://127.0.0.1:8000/api/organizacion |

No uses puerto 3000 ni Node ni `SERVIR.bat`.

---

## Primera vez / si falta configuración

```bat
CONFIGURAR-LARAVEL-UNIFICADO.bat
```

Eso copia a `backend/`:

- `OrganizacionController` → `/api/organizacion`
- `FrontendStaticController` → sirve `index.html`, portal, CSS, JS
- Rutas en `routes/api.php` y `routes/web.php`

Luego `ABRIR-LARAVEL.bat`.

---

## Seguir trabajando en la API

```bat
cd backend
php artisan serve
```

Editas controladores en `backend/app/Http/Controllers/Api/`.  
MySQL = clientes.  
JSON `data/organizacion-live.json` = calendario/madres (vía `/api/organizacion`).

Importar clientes:

```bat
IMPORTAR-CLIENTES-LARAVEL.bat
cd backend
php artisan db:seed --class=ClienteSeeder
```
