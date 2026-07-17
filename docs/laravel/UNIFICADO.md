# Flujo unificado — solo Laravel / PHP

**De ahora en adelante usa un solo arranque:** `ABRIR-LARAVEL.bat`

No uses `node scripts/organizacion-server.js` ni `SERVIR.bat` para el día a día.

---

## Qué abre el bat

| Pieza | URL | Rol |
|-------|-----|-----|
| **Laravel** | http://127.0.0.1:8000/api/clientes | Clientes en MySQL (fuente de verdad del portal) |
| **Organizador (PHP)** | http://localhost:3000/index.html | Calendario, madres, subtareas |
| **Portal** | http://localhost:3000/index/clientes/ | Landings; leen clientes desde Laravel |

Ambos corren con **PHP de Laragon**. Cero Node.

---

## En la terminal (si no usas el bat)

```bat
cd "C:\Users\Josefa Ogalde\organizacion"

REM Terminal 1 — API Laravel
cd backend
php artisan serve

REM Terminal 2 — Organizador (misma carpeta raíz)
cd "C:\Users\Josefa Ogalde\organizacion"
php -S localhost:3000 scripts\servir-organizacion.php
```

Abre: http://localhost:3000/index.html?disco=1

---

## Datos

| Dónde | Qué |
|-------|-----|
| MySQL vía Laravel | Clientes del portal (`/api/clientes`) |
| `data/organizacion-live.json` | Calendario / madres / tareas (respaldo 2026-07-17) |
| `data/clientes-laravel-seed.json` | Seed para importar clientes a MySQL |

Importar clientes a Laravel:

```bat
IMPORTAR-CLIENTES-LARAVEL.bat
cd backend
php artisan db:seed --class=ClienteSeeder
```

---

## Por qué existía Node

El agente en la nube levantaba `organizacion-server.js` porque es el servidor viejo del calendario.  
Eso **ya no es el flujo oficial** en tu PC: usa `ABRIR-LARAVEL.bat`.
