@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo.
echo  === Juan MKOF PED-008 → venta I000019 \$7.000 ===
echo.
where node >nul 2>&1
if errorlevel 1 (
  echo  [ERROR] No se encontro node.exe
  pause
  exit /b 1
)
node scripts\force-imp-ventas-014-015-fiado-008.js
if errorlevel 1 (
  pause
  exit /b 1
)
echo.
echo  Listo. Reinicia Laravel y Ctrl+Shift+R en Ventas/Pedidos.
echo    CERRAR-SERVIDOR.bat
echo    ABRIR-LARAVEL.bat
echo.
pause
