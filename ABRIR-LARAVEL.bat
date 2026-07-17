@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo.
echo  === Organizacion UNIFICADA · Laravel + PHP ===
echo  Un solo stack. No uses Node / SERVIR.bat para el dia a dia.
echo.

REM --- PHP de Laragon ---
set "PHP_EXE="
if exist "C:\laragon\bin\php\php-8.3.30-Win32-vs16-x64\php.exe" set "PHP_EXE=C:\laragon\bin\php\php-8.3.30-Win32-vs16-x64\php.exe"
if not defined PHP_EXE if exist "C:\laragon\bin\php\php-8.3.16-Win32-vs16-x64\php.exe" set "PHP_EXE=C:\laragon\bin\php\php-8.3.16-Win32-vs16-x64\php.exe"
if not defined PHP_EXE (
  for /d %%D in ("C:\laragon\bin\php\php-8*") do if exist "%%~D\php.exe" set "PHP_EXE=%%~D\php.exe"
)
if not defined PHP_EXE (
  where php >nul 2>&1 && set "PHP_EXE=php"
)
if not defined PHP_EXE (
  echo  [ERROR] No se encontro PHP. Abre Laragon y Start All, o instala PHP en PATH.
  pause
  exit /b 1
)

if not exist "backend\artisan" (
  echo  [ERROR] Falta backend\artisan
  echo  Crea Laravel: composer create-project laravel/laravel backend
  echo  Guia: docs\laravel\PASO-1-entorno.md
  pause
  exit /b 1
)

REM Asegurar respaldo oficial como live si falta
if not exist "data\organizacion-live.json" (
  if exist "data\organizacion-respaldo-2026-07-17.json" (
    echo  Copiando respaldo 2026-07-17 → organizacion-live.json
    copy /Y "data\organizacion-respaldo-2026-07-17.json" "data\organizacion-live.json" >nul
  )
)

echo  1^) Laravel API  → http://127.0.0.1:8000
start "Laravel API · 8000" cmd /k "cd /d "%~dp0backend" && "%PHP_EXE%" artisan serve --host=127.0.0.1 --port=8000"

echo  2^) Organizador   → http://localhost:3000  ^(PHP, sin Node^)
start "Organizacion web · 3000" cmd /k "cd /d "%~dp0" && "%PHP_EXE%" -S localhost:3000 scripts\servir-organizacion.php"

timeout /t 2 >nul
start "" "http://localhost:3000/index.html?disco=1"
start "" "http://127.0.0.1:8000/api/clientes"

echo.
echo  Listo.
echo    Organizador:  http://localhost:3000/index.html?disco=1
echo    Clientes API: http://127.0.0.1:8000/api/clientes
echo    Portal:       http://localhost:3000/index/clientes/
echo.
echo  Si ves datos viejos: Ctrl+Shift+R en Chrome.
echo  Para reimportar clientes a MySQL: IMPORTAR-CLIENTES-LARAVEL.bat
echo.
pause
