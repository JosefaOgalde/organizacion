@echo off
chcp 65001 >nul
cd /d "%~dp0"

set "ORIGEN=%~1"
if "%ORIGEN%"=="" set "ORIGEN=%USERPROFILE%\Downloads\organizacion-respaldo-2026-07-03.json"

echo.
echo  === Importar diplomas CLA ===
echo  Origen: %ORIGEN%
echo.

node scripts/importar-cla-diplomas.js "%ORIGEN%"
if errorlevel 1 (
  echo.
  pause
  exit /b 1
)

echo.
echo  Siguiente: abre CLA.html con ABRIR-CLA.bat o recarga con Ctrl+F5
echo.
pause
