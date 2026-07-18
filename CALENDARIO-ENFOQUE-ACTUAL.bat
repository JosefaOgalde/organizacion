@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo.
echo  === Calendario · solo trabajo actual ===
echo  Quita JM F2 / MOVA auth y restaura TS 7–12 + ECR NL agosto
echo.

set PATH=C:\laragon\bin\nodejs\node-v22;%PATH%

where node >nul 2>&1
if errorlevel 1 (
  echo No se encontro node.exe en el PATH.
  pause
  exit /b 1
)

if not exist "data\organizacion-live.json" (
  echo Falta data\organizacion-live.json
  echo Corre primero ABRIR-ORGANIZADOR-HOY.bat o IMPORTAR-RESPALDO.bat
  pause
  exit /b 1
)

node scripts\calendario-enfoque-actual.js
set ERR=%ERRORLEVEL%
echo.
if %ERR% neq 0 (
  echo Fallo ^(codigo %ERR%^).
  pause
  exit /b %ERR%
)

echo Abriendo organizador con datos de disco...
start "" "http://localhost:3000/index.html?disco=1"
echo.
echo Si el server no esta corriendo: SERVIR.bat o ABRIR-ORGANIZADOR.bat
pause
exit /b 0
