@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo.
echo  === Organizacion · Laravel + SQLite ^(sin Laragon / sin MySQL^) ===
echo  Un solo servidor en :8000 — API + organizador + portal
echo.

set "PHP_EXE="
if exist "C:\laragon\bin\php\php-8.3.30-Win32-vs16-x64\php.exe" set "PHP_EXE=C:\laragon\bin\php\php-8.3.30-Win32-vs16-x64\php.exe"
if not defined PHP_EXE if exist "C:\laragon\bin\php\php-8.3.16-Win32-vs16-x64\php.exe" set "PHP_EXE=C:\laragon\bin\php\php-8.3.16-Win32-vs16-x64\php.exe"
if not defined PHP_EXE (
  for /d %%D in ("C:\laragon\bin\php\php-8*") do if exist "%%~D\php.exe" set "PHP_EXE=%%~D\php.exe"
)
if not defined PHP_EXE where php >nul 2>&1 && set "PHP_EXE=php"
if not defined PHP_EXE (
  echo  [ERROR] No se encontro php.exe
  echo  Opciones: instalar PHP en PATH, o usar el php.exe de la carpeta
  echo  C:\laragon\bin\php\... ^(solo el ejecutable; no hace falta abrir Laragon^)
  pause
  exit /b 1
)

if not exist "backend\artisan" (
  echo  [ERROR] Falta backend\artisan
  pause
  exit /b 1
)

echo  1^) SQLite + seed clientes...
"%PHP_EXE%" scripts\usar-sqlite-laravel.php
if errorlevel 1 (
  pause
  exit /b 1
)

echo  2^) Rutas API + frontend unificado...
"%PHP_EXE%" scripts\configurar-laravel-unificado.php
if errorlevel 1 (
  pause
  exit /b 1
)

echo  3^) migrate + seed...
pushd backend
"%PHP_EXE%" artisan config:clear >nul 2>&1
"%PHP_EXE%" artisan migrate --force
"%PHP_EXE%" artisan db:seed --class=ClienteSeeder --force
popd

if not exist "data\organizacion-live.json" (
  if exist "data\organizacion-respaldo-2026-07-17.json" (
    copy /Y "data\organizacion-respaldo-2026-07-17.json" "data\organizacion-live.json" >nul
  )
)

echo.
echo  Arrancando http://127.0.0.1:8000 ...
start "Laravel · 8000" cmd /k "cd /d "%~dp0backend" && "%PHP_EXE%" artisan serve --host=127.0.0.1 --port=8000"
timeout /t 2 >nul
start "" "http://127.0.0.1:8000/index.html"
start "" "http://127.0.0.1:8000/api/clientes"

echo.
echo  Stack oficial ^(sin Laragon, sin MySQL, sin Node^):
echo    Organizador:    http://127.0.0.1:8000/index.html
echo    Portal:         http://127.0.0.1:8000/index/clientes/
echo    API clientes:   http://127.0.0.1:8000/api/clientes
echo    API calendario: http://127.0.0.1:8000/api/organizacion
echo    Base de datos:  backend\database\database.sqlite
echo.
pause
