@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo.
echo  === Forzar venta I000016 Fabian MKOF ===
echo  Carpeta: %CD%
echo.

where git >nul 2>&1
if not errorlevel 1 (
  echo  Rama actual:
  git branch --show-current
  echo  git fetch + checkout rama del agente...
  git fetch origin cursor/laravel-guardar-entrega-02f9
  git checkout cursor/laravel-guardar-entrega-02f9 2>nul
  git pull origin cursor/laravel-guardar-entrega-02f9
  echo  Commit:
  git rev-parse --short HEAD
  echo.
)

findstr /C:"I000016" "data\impresoreando-seed.json" >nul 2>&1
if errorlevel 1 (
  echo  ERROR: el seed NO tiene I000016. El git pull no trajo la rama correcta.
  echo  Probá: git checkout cursor/laravel-guardar-entrega-02f9
  pause
  exit /b 1
) else (
  echo  Seed OK: contiene I000016
)

where node >nul 2>&1
if errorlevel 1 (
  echo  ERROR: no hay node en PATH
  pause
  exit /b 1
)

echo.
echo  Cerrando servidor :8000...
if exist "%~dp0CERRAR-SERVIDOR.bat" (
  call "%~dp0CERRAR-SERVIDOR.bat"
) else (
  for /f "tokens=5" %%P in ('netstat -ano 2^>nul ^| findstr ":8000" ^| findstr "LISTENING"') do taskkill /F /PID %%P >nul 2>&1
)
timeout /t 1 >nul

echo  Sync + forzar venta...
if exist "scripts\sync-impresoreando-seed-a-live.js" node scripts\sync-impresoreando-seed-a-live.js
node scripts\force-imp-venta-fabian-016.js
if errorlevel 1 (
  pause
  exit /b 1
)
if exist "scripts\force-imp-fiados-012-013.js" node scripts\force-imp-fiados-012-013.js

echo.
echo  Verificacion live:
findstr /C:"I000016" "data\impresoreando-live.json" >nul 2>&1
if errorlevel 1 (
  echo  ERROR: live sigue SIN I000016
  pause
  exit /b 1
) else (
  echo  Live OK: tiene I000016 Fabian
)

echo.
echo  Reiniciando servidor...
call "%~dp0ABRIR-LARAVEL.bat" sin-nav
timeout /t 2 >nul

echo.
echo  Abrí Ventas con Ctrl+F5. Origen = Todos o MKOF ^(no SIE^).
echo  http://127.0.0.1:8000/index/clientes/impresoreando/panel/?tab=ventas^&v=fabian016
echo.
powershell -NoProfile -Command "Start-Process 'http://127.0.0.1:8000/index/clientes/impresoreando/panel/?tab=ventas&v=fabian016'"
pause
