@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo.
echo  === Sync Impresoreando → organizador ===
echo  Copia pedidos del panel al calendario (sin borrar TS/ECR/JM)
echo.

set PATH=C:\laragon\bin\nodejs\node-v22;%PATH%

where node >nul 2>&1
if errorlevel 1 (
  echo No se encontro node.exe
  pause
  exit /b 1
)

if not exist "data\organizacion-live.json" (
  echo Falta data\organizacion-live.json — corre ABRIR-ORGANIZADOR-HOY.bat primero
  pause
  exit /b 1
)

node scripts\asegurar-impresoreando-live.js
node scripts\sync-impresoreando-organizador.js
set ERR=%ERRORLEVEL%
echo.
if %ERR% neq 0 (
  echo Fallo ^(codigo %ERR%^)
  pause
  exit /b %ERR%
)

echo Abriendo dia de hoy en el organizador...
start "" "http://localhost:3000/index.html?disco=1&fecha=2026-07-18&vista=dia"
echo.
echo Panel Impresoreando: http://localhost:3000/index/clientes/impresoreando/panel/
echo Si el server no corre: SERVIR.bat
pause
exit /b 0
