@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo.
echo  === Organizador — inicio del dia ===
echo.
echo  (No cambia de rama git: conserva Impresoreando y tu trabajo local)
echo.

set PATH=C:\laragon\bin\nodejs\node-v22;%PATH%

echo  Sincronizando respaldo mas reciente ^(Descargas / data^)...
node scripts/sync-respaldo-auto.js
if errorlevel 1 (
  echo.
  echo  Sin respaldo en disco. Si tienes JSON en Descargas:
  echo    IMPORTAR-RESPALDO.bat
  echo.
)

echo  Asegurando cliente Impresoreando en el live...
node scripts/asegurar-impresoreando-live.js

call "%~dp0ABRIR-LARAVEL.bat"
