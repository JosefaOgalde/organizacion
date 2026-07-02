@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo.
echo  === Abrir Organizador (ultima version automatica) ===
echo.

node scripts/sync-respaldo-auto.js
if errorlevel 1 (
  echo Error en sync-respaldo-auto.js
  pause
  exit /b 1
)

echo.
echo  Iniciando servidor en ventana aparte...
start "Organizacion servidor" cmd /k "cd /d "%~dp0" && node scripts/organizacion-server.js"

echo  Esperando servidor...
timeout /t 2 /nobreak >nul

start "" "http://localhost:3000/index.html"

echo.
echo  Listo — organizador abierto con datos de data/organizacion-live.json
echo  Portal clientes: http://localhost:3000/index/clientes/
echo  Al cerrar: usa "Respaldo" en la app o cierra el servidor en la otra ventana.
echo.
pause
