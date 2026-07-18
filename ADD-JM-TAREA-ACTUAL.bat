@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo.
echo  === JM · unica tarea vigente ^(Novedades mobile^) ===
echo.

set PATH=C:\laragon\bin\nodejs\node-v22;%PATH%

where node >nul 2>&1
if errorlevel 1 (
  echo No se encontro node.exe
  pause
  exit /b 1
)

node scripts\archivar-jm-fase2-calendario.js
node scripts\add-jm-tarea-actual.js
set ERR=%ERRORLEVEL%
echo.
if %ERR% neq 0 (
  echo Fallo ^(codigo %ERR%^)
  pause
  exit /b %ERR%
)

start "" "http://localhost:3000/index.html?disco=1&fecha=2026-07-18&vista=dia"
echo Ctrl+F5 — mira hoy 18 jul: [JM] Novedades mobile
pause
exit /b 0
