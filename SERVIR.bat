@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo.
echo  Organizacion — servidor con guardado automatico en data/organizacion-live.json
echo  Abre: http://localhost:3000/index/clientes/
echo  Herramientas: http://localhost:3000/index/clientes/Herramientas.html
echo  Tendencias:   http://localhost:3000/index/clientes/Herramientas/Tendencias.html
echo  Landing JM: http://localhost:3000/index/clientes/joyasmercury/index.html?v=secciones3
echo  Si ves version antigua: ejecuta RECUPERAR-JM.bat
echo.
node scripts/organizacion-server.js
pause
