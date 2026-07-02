@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo.
echo  === Abrir MOVA (MKOF) — servidor + portal ===
echo  Rama recomendada: cursor/mova-trabajo-d6a1
echo.

call "%~dp0CERRAR-SERVIDOR.bat"

node scripts/sync-respaldo-auto.js --force
if errorlevel 1 (
  echo Error en sync-respaldo-auto.js
  pause
  exit /b 1
)

echo.
echo  Iniciando servidor...
start "Organizacion servidor" cmd /k "cd /d "%~dp0" && node scripts/organizacion-server.js"

echo  Esperando servidor...
node scripts/wait-organizacion-server.js
if errorlevel 1 (
  echo.
  echo  El servidor tardo demasiado. Revisa la ventana "Organizacion servidor".
  pause
  exit /b 1
)

start "" "http://localhost:3000/index/clientes/mkof/"
timeout /t 1 /nobreak >nul
start "" "http://localhost:3000/index/clientes/MKOF/MOVA"

echo.
echo  MKOF:  http://localhost:3000/index/clientes/mkof/
echo  MOVA:  http://localhost:3000/index/clientes/MKOF/MOVA
echo  Organizador: http://localhost:3000/index.html?disco=1
echo.
echo  En Cursor: @mova + tu tarea
echo.
pause
