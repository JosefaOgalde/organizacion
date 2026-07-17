@echo off
chcp 65001 >nul
cd /d "%~dp0"

set "PHP=C:\laragon\bin\php\php-8.3.30-Win32-vs16-x64\php.exe"
if not exist "%PHP%" (
  for /d %%D in ("C:\laragon\bin\php\php-8*") do if exist "%%~D\php.exe" set "PHP=%%~D\php.exe"
)

echo.
echo  === Forzar SQLite ^(sin MySQL^) ===
echo.

if not exist "backend\.env" (
  echo  [ERROR] Falta backend\.env
  pause
  exit /b 1
)

if not exist "backend\database\database.sqlite" (
  type nul > "backend\database\database.sqlite"
  echo  · Creado database.sqlite
)

REM Forzar DB_CONNECTION=sqlite en .env (ruta relativa, sin espacios)
powershell -NoProfile -Command ^
  "$p='backend\.env'; $c=Get-Content $p -Raw; " ^
  "if ($c -match 'DB_CONNECTION=') { $c=$c -replace '(?m)^DB_CONNECTION=.*','DB_CONNECTION=sqlite' } else { $c += \"`nDB_CONNECTION=sqlite`n\" }; " ^
  "if ($c -match 'SESSION_DRIVER=') { $c=$c -replace '(?m)^SESSION_DRIVER=.*','SESSION_DRIVER=file' } else { $c += \"`nSESSION_DRIVER=file`n\" }; " ^
  "if ($c -match '(?m)^#?\s*DB_DATABASE=') { $c=$c -replace '(?m)^#?\s*DB_DATABASE=.*','DB_DATABASE=database/database.sqlite' } else { $c += \"`nDB_DATABASE=database/database.sqlite`n\" }; " ^
  "foreach ($k in @('DB_HOST','DB_PORT','DB_USERNAME','DB_PASSWORD')) { $c=$c -replace \"(?m)^$k=\",\"# $k=\" }; " ^
  "Set-Content -Path $p -Value $c -Encoding utf8; Write-Host '  · backend\.env → sqlite (ruta relativa)'"

"%PHP%" scripts\usar-sqlite-laravel.php
"%PHP%" scripts\configurar-laravel-unificado.php

cd backend
"%PHP%" artisan config:clear
"%PHP%" artisan config:cache
"%PHP%" artisan config:clear
"%PHP%" artisan migrate --force
"%PHP%" artisan db:seed --class=ClienteSeeder --force

echo.
echo  Verifica conexion:
"%PHP%" artisan tinker --execute="echo config('database.default').' '.App\Models\Cliente::count();"

echo.
echo  Si arriba dice sqlite y un numero, OK. Luego:
echo  "%PHP%" artisan serve --host=127.0.0.1 --port=8000
echo.
pause
