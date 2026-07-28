@echo off
chcp 65001 >nul
cd /d "%~dp0"
title Reparar columna clientes.activo

echo.
echo  === Reparar SQLite: columna clientes.activo ===
echo  Corrige: SQLSTATE no such column: activo
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
  pause
  exit /b 1
)

if not exist "backend\database\database.sqlite" (
  echo  [ERROR] Falta backend\database\database.sqlite
  echo  Primero corre ABRIR-LARAVEL.bat una vez (o crea el backend Laravel).
  pause
  exit /b 1
)

echo  1^) ALTER columna activo...
"%PHP_EXE%" scripts\asegurar-columna-activo-clientes.php
if errorlevel 1 (
  echo  [ERROR] Fallo el script asegurar-columna.
  pause
  exit /b 1
)

echo  2^) Re-copiar Modelo + ClienteSeeder (version segura)...
"%PHP_EXE%" scripts\usar-sqlite-laravel.php
if errorlevel 1 (
  echo  [ERROR] Fallo usar-sqlite-laravel.php
  pause
  exit /b 1
)

echo  3^) Seed clientes...
"%PHP_EXE%" scripts\asegurar-columna-activo-clientes.php
pushd backend
"%PHP_EXE%" artisan config:clear >nul 2>&1
"%PHP_EXE%" artisan db:seed --class=ClienteSeeder --force
set "SEED_ERR=%ERRORLEVEL%"
popd

if not "%SEED_ERR%"=="0" (
  echo.
  echo  [ERROR] El seed fallo otra vez.
  echo  Copia el texto rojo de arriba y pegalo en el chat.
  pause
  exit /b 1
)

echo.
echo  OK. Proba: http://127.0.0.1:8000/api/clientes
echo  Luego: ABRIR-LARAVEL.bat
echo.
pause
exit /b 0
