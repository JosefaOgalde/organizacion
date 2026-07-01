@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo.
echo  Organizacion — servidor local SEGURO (solo 127.0.0.1)
echo  Guardado automatico en data/organizacion-live.json
echo  Seguridad: docs/SEGURIDAD.md — opcional .env con ORGANIZACION_TOKEN
echo  Abre: http://localhost:3000/index.html
echo  Portal clientes: http://localhost:3000/index/clientes/
echo  Landing JM: http://localhost:3000/index/clientes/joyasmercury/index.html?v=secciones3
echo  Si ves version antigua: ejecuta RECUPERAR-JM.bat
echo.
node scripts/organizacion-server.js
pause
