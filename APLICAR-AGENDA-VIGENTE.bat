@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo.
echo  === Aplicar agenda vigente ===
echo  TS C7/C8 hechas · Nutri 27 jul · ECR 20/22 ago · Impresoreando
echo.

set PATH=C:\laragon\bin\nodejs\node-v22;%PATH%

where node >nul 2>&1
if errorlevel 1 (
  echo No se encontro node.exe
  pause
  exit /b 1
)

if not exist "data\organizacion-live.json" (
  echo Falta data\organizacion-live.json
  echo Corre ABRIR-ORGANIZADOR-HOY.bat o IMPORTAR-RESPALDO.bat primero
  pause
  exit /b 1
)

node scripts\aplicar-agenda-vigente.js
set ERR=%ERRORLEVEL%
echo.
if %ERR% neq 0 (
  echo Fallo ^(codigo %ERR%^)
  pause
  exit /b %ERR%
)

echo Abriendo organizador...
start "" "http://localhost:3000/index.html?disco=1"
echo.
echo ECR en agosto: Mes siguiente → → o
echo   http://localhost:3000/index.html?disco=1^&fecha=2026-08-20^&vista=mes
echo Ctrl+F5 si no ves cambios.
pause
exit /b 0
