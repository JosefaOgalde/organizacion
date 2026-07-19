@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo.
echo  === Abrir Impresoreando — panel socios ===
echo  Rama: cursor/impresoreando-bob-productos-459d
echo  (Porta Bob · naves · llaveros · gastos diseño)
echo.

echo  Cambiando a la rama con productos nuevos...
git fetch origin cursor/impresoreando-bob-productos-459d 2>nul
git checkout cursor/impresoreando-bob-productos-459d 2>nul
if errorlevel 1 (
  git checkout -b cursor/impresoreando-bob-productos-459d origin/cursor/impresoreando-bob-productos-459d
)
git pull origin cursor/impresoreando-bob-productos-459d
if errorlevel 1 (
  echo.
  echo  AVISO: no se pudo actualizar la rama. Sigue con lo que haya en disco.
  echo.
)

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

start "" "http://localhost:3000/index/clientes/impresoreando/panel/?tab=costos"
timeout /t 1 /nobreak >nul
start "" "http://localhost:3000/index/clientes/impresoreando/"
timeout /t 1 /nobreak >nul
start "" "http://localhost:3000/index/clientes/"

echo.
echo  PANEL SOCIOS: http://localhost:3000/index/clientes/impresoreando/panel/?tab=costos
echo  Landing:      http://localhost:3000/index/clientes/impresoreando/
echo  Portal:       http://localhost:3000/index/clientes/
echo.
echo  Pestaña Costos producto: Porta Bob · Naves · Llaveros Ranger/Stanley
echo  Pestaña Gastos: diseños Cults (Bob + bulldog + nave)
echo  Pestaña Pedidos: PED-002 listo · PED-003 naves
echo.
echo  Color unico: ambar (#d4b06a)
echo  Para compartir en WiFi con tu socio:
echo    set HOST=0.0.0.0 ^&^& node scripts\organizacion-server.js
echo.
pause
