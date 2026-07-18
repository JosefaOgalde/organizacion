@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo.
echo  === Aplicar agenda vigente ===
echo  TS C7/C8 hechas · Nutri 27 jul · ECR 20/22 jul · sin JM F2 antigua · Impresoreando
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

echo Abriendo julio — ECR NL1 el 20 y NL2 el 22...
start "" "http://localhost:3000/index.html?disco=1&fecha=2026-07-20&vista=mes"
echo.
echo Ctrl+F5. NL1 = lunes 20 · NL2 = miercoles 22. JM F2 antigua sale del calendario.
pause
exit /b 0
