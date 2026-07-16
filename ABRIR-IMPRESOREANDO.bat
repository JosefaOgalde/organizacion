@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo.
echo  === Abrir Impresoreando — panel socios ===
echo  Rama: cursor/ts-prompt-botas-rojas-6a09
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

start "" "http://localhost:3000/index/clientes/impresoreando/panel/"
timeout /t 1 /nobreak >nul
start "" "http://localhost:3000/index/clientes/impresoreando/"
timeout /t 1 /nobreak >nul
start "" "http://localhost:3000/index/clientes/"

echo.
echo  PANEL SOCIOS: http://localhost:3000/index/clientes/impresoreando/panel/
echo  Landing:      http://localhost:3000/index/clientes/impresoreando/
echo  Portal:       http://localhost:3000/index/clientes/
echo.
echo  Color unico: ambar (#d4b06a)
echo  Para compartir en WiFi con tu socio:
echo    set HOST=0.0.0.0 ^&^& node scripts\organizacion-server.js
echo.
pause
