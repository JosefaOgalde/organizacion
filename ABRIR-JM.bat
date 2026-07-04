@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo.
echo  === Abrir Joyas Mercury — servidor + portal ===
echo  Rama recomendada: cursor/jm-trabajo-d6a1
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

start "" "http://localhost:3000/index/clientes/joyasmercury/"
timeout /t 1 /nobreak >nul
start "" "http://localhost:3000/index/clientes/joyasmercury/wireframes.html"
timeout /t 1 /nobreak >nul
start "" "http://localhost:3000/index.html?disco=1"

echo.
echo  Portal:      http://localhost:3000/index/clientes/joyasmercury/
echo  Wireframes:  http://localhost:3000/index/clientes/joyasmercury/wireframes.html
echo  Organizador: http://localhost:3000/index.html?disco=1
echo  Tarea (ej.): http://localhost:3000/index.html?tarea=joyas-mercury/11
echo.
echo  En Cursor: @joyas-mercury + tu tarea del dia
echo  WP backup: %%USERPROFILE%%\joyasmercury-backup
echo.
pause
