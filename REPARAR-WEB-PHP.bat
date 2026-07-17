@echo off
chcp 65001 >nul
cd /d "%~dp0"
set "PHP=C:\laragon\bin\php\php-8.3.30-Win32-vs16-x64\php.exe"
if not exist "%PHP%" (
  for /d %%D in ("C:\laragon\bin\php\php-8*") do if exist "%%~D\php.exe" set "PHP=%%~D\php.exe"
)
echo.
"%PHP%" scripts\reparar-web-php.php
if errorlevel 1 (
  echo.
  echo  Si fallo, abre backend\routes\web.php y borra a mano el bloque duplicado.
  pause
  exit /b 1
)
echo.
echo  Listo. Sigue con:
echo    cd backend
echo    "%PHP%" artisan config:clear
echo    "%PHP%" artisan db:seed --class=ClienteSeeder --force
echo    "%PHP%" artisan serve --host=127.0.0.1 --port=8000
echo.
pause
