@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo.
echo  === Organizacion · UN solo servidor Laravel :8000 ===
echo  API + organizador + portal en el mismo origen.
echo.

set "PHP_EXE="
if exist "C:\laragon\bin\php\php-8.3.30-Win32-vs16-x64\php.exe" set "PHP_EXE=C:\laragon\bin\php\php-8.3.30-Win32-vs16-x64\php.exe"
if not defined PHP_EXE if exist "C:\laragon\bin\php\php-8.3.16-Win32-vs16-x64\php.exe" set "PHP_EXE=C:\laragon\bin\php\php-8.3.16-Win32-vs16-x64\php.exe"
if not defined PHP_EXE (
  for /d %%D in ("C:\laragon\bin\php\php-8*") do if exist "%%~D\php.exe" set "PHP_EXE=%%~D\php.exe"
)
if not defined PHP_EXE where php >nul 2>&1 && set "PHP_EXE=php"
if not defined PHP_EXE (
  echo  [ERROR] No se encontro PHP. Abre Laragon → Start All.
  pause
  exit /b 1
)

if not exist "backend\artisan" (
  echo  [ERROR] Falta backend\artisan
  pause
  exit /b 1
)

echo  Configurando rutas API + frontend en Laravel...
"%PHP_EXE%" scripts\configurar-laravel-unificado.php
if errorlevel 1 (
  pause
  exit /b 1
)

echo  Limpiando cache de config Laravel...
pushd backend
"%PHP_EXE%" artisan config:clear >nul 2>&1
popd

if not exist "data\organizacion-live.json" (
  if exist "data\organizacion-respaldo-2026-07-17.json" (
    copy /Y "data\organizacion-respaldo-2026-07-17.json" "data\organizacion-live.json" >nul
  )
)

echo.
echo  IMPORTANTE: Laragon → Start All → MySQL en VERDE
echo  ^(sin MySQL, /api/clientes falla; el organizador si deberia abrir^)
echo.
echo  Arrancando Laravel en http://127.0.0.1:8000 ...
echo.

start "Laravel · 8000" cmd /k "cd /d "%~dp0backend" && "%PHP_EXE%" artisan serve --host=127.0.0.1 --port=8000"
timeout /t 2 >nul
start "" "http://127.0.0.1:8000/index.html?disco=1"
start "" "http://127.0.0.1:8000/api/clientes"

echo.
echo  Todo en un solo puerto:
echo    Organizador:  http://127.0.0.1:8000/index.html?disco=1
echo    Portal:       http://127.0.0.1:8000/index/clientes/
echo    API clientes: http://127.0.0.1:8000/api/clientes
echo    API calendario: http://127.0.0.1:8000/api/organizacion
echo.
echo  Ya no uses el puerto 3000 ni Node.
echo.
pause
