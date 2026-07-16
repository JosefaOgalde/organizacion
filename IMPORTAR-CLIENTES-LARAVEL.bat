@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo.
echo  === Importar clientes a Laravel ===
echo.

if not exist "data\clientes-laravel-seed.json" (
  echo  [ERROR] Falta data\clientes-laravel-seed.json
  pause
  exit /b 1
)

if not exist "backend\artisan" (
  echo  [ERROR] No existe backend\artisan
  echo  Primero crea Laravel: composer create-project laravel/laravel backend
  pause
  exit /b 1
)

if not exist "backend\database\seeders" mkdir "backend\database\seeders"

copy /Y "docs\laravel\ejemplos\ClienteSeeder.php" "backend\database\seeders\ClienteSeeder.php" >nul
copy /Y "docs\laravel\ejemplos\DatabaseSeeder.php" "backend\database\seeders\DatabaseSeeder.php" >nul
copy /Y "docs\laravel\ejemplos\Model_Cliente.php" "backend\app\Models\Cliente.php" >nul

echo  Seeders y modelo copiados.
echo.
echo  Ahora ejecuta en backend ^(con Laragon PHP^):
echo.
echo    cd backend
echo    php artisan db:seed --class=ClienteSeeder
echo    php artisan serve
echo.
echo  Luego abre: http://127.0.0.1:8000/api/clientes
echo.
pause
