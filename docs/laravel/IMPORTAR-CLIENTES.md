# Importar clientes recuperados a Laravel (MySQL)

**Meta:** `http://127.0.0.1:8000/api/clientes` muestra **todos** los clientes del respaldo (9), no solo Joyas Mercury.

Fuente: `data/clientes-laravel-seed.json` (generado desde `organizacion-live.json` / respaldo 2026-07-16).

---

## Requisitos

1. Laragon → **Start All** (MySQL verde)
2. Laravel en `backend/` con tabla `clientes` (Paso 2–3)
3. Archivo seed en:
   ```
   C:\Users\Josefa Ogalde\organizacion\data\clientes-laravel-seed.json
   ```

---

## Opción rápida — bat

```cmd
cd "C:\Users\Josefa Ogalde\organizacion"
IMPORTAR-CLIENTES-LARAVEL.bat
```

Luego:

```cmd
cd backend
"C:\laragon\bin\php\php-8.3.30-Win32-vs16-x64\php.exe" artisan db:seed --class=ClienteSeeder
"C:\laragon\bin\php\php-8.3.30-Win32-vs16-x64\php.exe" artisan serve
```

Abre: `http://127.0.0.1:8000/api/clientes`

---

## Opción manual

### 1) Asegura columnas en `clientes`

Si tu migración solo tiene `nombre`, `abrev`, `tipo`, agrega (nueva migración o edita y `migrate:fresh`):

- `slug` (unique)
- `color_border`, `color_bg`, `color_text`
- `agente`, `resumen`

Ejemplo: [`ejemplos/migration_create_clientes_table.php`](./ejemplos/migration_create_clientes_table.php)

Modelo: [`ejemplos/Model_Cliente.php`](./ejemplos/Model_Cliente.php)

### 2) Copia el seeder

```cmd
copy docs\laravel\ejemplos\ClienteSeeder.php backend\database\seeders\ClienteSeeder.php
copy docs\laravel\ejemplos\DatabaseSeeder.php backend\database\seeders\DatabaseSeeder.php
```

### 3) Ejecuta el seed

```cmd
cd backend
php artisan db:seed --class=ClienteSeeder
```

O limpia y vuelve a migrar+seed:

```cmd
php artisan migrate:fresh --seed
```

### 4) Verifica

```cmd
php artisan tinker
```

```php
\App\Models\Cliente::count();
\App\Models\Cliente::pluck('nombre');
```

Debe ser **9** clientes.

API:

```
http://127.0.0.1:8000/api/clientes
```

---

## Portal HTML

1. `php artisan serve` (8000)
2. `SERVIR.bat` (3000)
3. `http://127.0.0.1:3000/index/clientes/`

Las tarjetas deben mostrar **· API**.

---

## Nota sobre datos personales

- `organizacion-live.json` y `organizacion-respaldo-*.json` **no van a Git** (tareas, salud).
- `clientes-laravel-seed.json` solo tiene metadatos de clientes (slug, nombre, colores) y **sí puede** versionarse.
