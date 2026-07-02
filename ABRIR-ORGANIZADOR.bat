@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo.
echo  === Abrir Organizador (ultima version automatica) ===
echo.

call "%~dp0CERRAR-SERVIDOR.bat"

node scripts/sync-respaldo-auto.js
if errorlevel 1 (
  echo Error en sync-respaldo-auto.js
  pause
  exit /b 1
)

echo.
echo  Iniciando servidor...
start "Organizacion servidor" cmd /k "cd /d "%~dp0" && node scripts/organizacion-server.js"

echo  Esperando servidor...
timeout /t 2 /nobreak >nul

start "" "http://localhost:3000/index.html?v=live"

echo.
echo  Listo. Si ves datos viejos: Ctrl+Shift+R en el navegador.
echo  Portal clientes: http://localhost:3000/index/clientes/
echo.
pause
