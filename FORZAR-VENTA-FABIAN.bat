@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo.
echo  === Forzar venta I000016 Fabian MKOF ===
echo.

where git >nul 2>&1
if not errorlevel 1 (
  echo  git pull...
  git pull origin cursor/laravel-guardar-entrega-02f9
)

where node >nul 2>&1
if errorlevel 1 (
  echo  ERROR: no hay node en PATH
  pause
  exit /b 1
)

if not exist "data\impresoreando-seed.json" (
  echo  ERROR: falta data\impresoreando-seed.json
  pause
  exit /b 1
)

echo  Sync seed → live...
if exist "scripts\sync-impresoreando-seed-a-live.js" node scripts\sync-impresoreando-seed-a-live.js

echo  Forzar venta Fabian...
node scripts\force-imp-venta-fabian-016.js
if errorlevel 1 (
  pause
  exit /b 1
)

echo  Forzar fiados...
if exist "scripts\force-imp-fiados-012-013.js" node scripts\force-imp-fiados-012-013.js

echo.
echo  Listo. Abrí Ventas ^(Ctrl+F5^) y filtro Origen = Todos o MKOF:
echo  http://127.0.0.1:8000/index/clientes/impresoreando/panel/?tab=ventas
echo.
start "" "http://127.0.0.1:8000/index/clientes/impresoreando/panel/?tab=ventas"
pause
