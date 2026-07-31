@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo.
echo  === Forzar PED-007 Torreón → anulado ===
echo.
where node >nul 2>&1
if errorlevel 1 (
  echo  [ERROR] No se encontro node.exe
  pause
  exit /b 1
)
node scripts\force-imp-ped-007-anulado.js
if errorlevel 1 (
  pause
  exit /b 1
)
echo.
echo  Listo. Ahora:
echo    1^) Cierra Laravel si esta abierto ^(CERRAR-SERVIDOR.bat^)
echo    2^) ABRIR-LARAVEL.bat
echo    3^) Abre Pedidos y Ctrl+Shift+R
echo.
pause
