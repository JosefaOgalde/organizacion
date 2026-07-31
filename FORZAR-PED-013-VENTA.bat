@echo off
chcp 65001 >nul
cd /d "%~dp0"
title Forzar Mel PED-013 → venta I000020
echo.
echo  Mel MKOF PED-013 → I000020 $4.000 ^(pagado^)
echo.
where node >nul 2>&1
if errorlevel 1 (
  echo [ERROR] Node no esta en PATH.
  pause
  exit /b 1
)
node scripts\force-imp-ventas-014-015-fiado-008.js
echo.
echo  Abrí: http://127.0.0.1:8000/index/clientes/impresoreando/panel/?tab=ventas
echo  Ctrl+Shift+R
pause
