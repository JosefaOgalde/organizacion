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
  echo  Presiona una tecla...
  pause >nul
  exit /b 1
)

node scripts\force-imp-ventas-014-015-fiado-008.js
if errorlevel 1 (
  echo [ERROR] Fallo el force. Copia el texto de arriba.
  echo  Presiona una tecla...
  pause >nul
  exit /b 1
)

echo.
echo  OK. Ahora corre: ABRIR-LARAVEL.bat
echo  Luego Ctrl+Shift+R en Ventas.
echo.
echo  === Si ves esto, NO esta pegado: pulsa una tecla para cerrar ===
pause >nul
