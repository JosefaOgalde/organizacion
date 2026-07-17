@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo.
echo  === Laravel sin MySQL / sin Laragon → SQLite ===
echo.

set "PHP_EXE="
if exist "C:\laragon\bin\php\php-8.3.30-Win32-vs16-x64\php.exe" set "PHP_EXE=C:\laragon\bin\php\php-8.3.30-Win32-vs16-x64\php.exe"
if not defined PHP_EXE (
  for /d %%D in ("C:\laragon\bin\php\php-8*") do if exist "%%~D\php.exe" set "PHP_EXE=%%~D\php.exe"
)
if not defined PHP_EXE where php >nul 2>&1 && set "PHP_EXE=php"
if not defined PHP_EXE (
  echo  [ERROR] No se encontro PHP. Puedes usar el php.exe de Laragon aunque la licencia falle:
  echo  C:\laragon\bin\php\php-8.3.30-Win32-vs16-x64\php.exe
  pause
  exit /b 1
)

if not exist "backend\artisan" (
  echo  [ERROR] Falta backend\artisan
  pause
  exit /b 1
)

"%PHP_EXE%" scripts\usar-sqlite-laravel.php
if errorlevel 1 (
  pause
  exit /b 1
)

"%PHP_EXE%" scripts\configurar-laravel-unificado.php

echo.
echo  Migrando y sembrando clientes...
pushd backend
"%PHP_EXE%" artisan config:clear
"%PHP_EXE%" artisan migrate --force
"%PHP_EXE%" artisan db:seed --class=ClienteSeeder --force
popd

echo.
echo  Listo. Arranca con:
echo    ABRIR-LARAVEL.bat
echo  o:
echo    cd backend
echo    php artisan serve
echo.
echo  http://127.0.0.1:8000/api/clientes
echo  http://127.0.0.1:8000/index.html?disco=1
echo.
pause
