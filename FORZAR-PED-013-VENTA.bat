@echo off
chcp 65001 >nul
cd /d "%~dp0"
title Mel PED-013 → I000020

echo.
echo  Forzando Mel pagada → venta I000020 ...
echo.

where node >nul 2>&1
if errorlevel 1 (
  echo [ERROR] Falta Node en PATH.
  goto :fin
)

node scripts\force-imp-mel-013-venta.js
if errorlevel 1 goto :fin

echo.
echo  Si el servidor esta abierto, recarga con Ctrl+Shift+R:
echo  http://127.0.0.1:8000/index/clientes/impresoreando/panel/?tab=ventas
echo.
echo  Mel NO debe aparecer en Fiados.
echo.

:fin
echo  Pulsa Enter para cerrar...
pause >nul
