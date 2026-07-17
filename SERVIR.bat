@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo.
echo  Organizacion — servidor en la red local (HOST=0.0.0.0)
echo  Tip: usa ABRIR-ORGANIZADOR.bat para sync + abrir navegador
echo  Ventas publicas (cualquier lugar): ABRIR-VENTA-PUBLICA.bat
echo.
if not exist .env (
  echo  Creando .env desde .env.example…
  copy /y .env.example .env >nul
)
node scripts/sync-respaldo-auto.js
echo.
echo  En ESTA PC:     http://localhost:3000/index.html
echo  Portal:         http://localhost:3000/index/clientes/
echo  Ventas (LAN):   http://TU-IP:3000/index/clientes/impresoreando/panel/venta/
echo  ^(la IP la imprime el servidor al arrancar^)
echo.
node scripts/organizacion-server.js
pause
