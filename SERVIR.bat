@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo.
echo  Organizacion — servidor local SEGURO (solo 127.0.0.1)
echo  Guardado automatico en data/organizacion-live.json
echo  Seguridad: docs/SEGURIDAD.md — opcional .env con ORGANIZACION_TOKEN
echo.
echo  Organizador:  http://localhost:3000/index.html
echo  Portal clientes (todas las landings): http://localhost:3000/index/clientes/
echo.
node scripts/organizacion-server.js
pause
