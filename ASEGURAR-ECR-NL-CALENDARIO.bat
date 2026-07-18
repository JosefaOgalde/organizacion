@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo.
echo  === ECR NL 1 y NL 2 → calendario julio ===
echo  NL 1 = lunes 20 jul · NL 2 = miercoles 22 jul
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
  pause
  exit /b 1
)

node scripts\asegurar-ecr-nl-calendario.js
set ERR=%ERRORLEVEL%
echo.
if %ERR% neq 0 (
  echo Fallo ^(codigo %ERR%^)
  pause
  exit /b %ERR%
)

echo Abriendo julio — mira el 20 y el 22...
start "" "http://localhost:3000/index.html?disco=1&fecha=2026-07-20&vista=mes"
echo.
echo Ctrl+F5 si no ves las tareas celestes ECR.
pause
exit /b 0
