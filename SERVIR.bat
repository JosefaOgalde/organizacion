@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo.
echo  Organizacion — servidor local SEGURO (solo 127.0.0.1)
echo  Tip: usa ABRIR-ORGANIZADOR.bat para sync + abrir navegador automatico
echo.
node scripts/sync-respaldo-auto.js
echo.
echo  Organizador:  http://localhost:3000/index.html
echo  Portal clientes: http://localhost:3000/index/clientes/
echo.
node scripts/organizacion-server.js
pause
