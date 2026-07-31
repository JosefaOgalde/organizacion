@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo.
echo  === Recargar organizador ^(disco=1^) ===
echo  No reinicia el servidor ni abre todas las pestanas.
echo.

REM Si :8000 no esta activo, avisar
netstat -ano 2>nul | findstr ":8000" | findstr "LISTENING" >nul
if errorlevel 1 (
  echo  [!] Laravel no esta corriendo en :8000
  echo  Primero: ABRIR-LARAVEL.bat
  echo.
  pause
  exit /b 1
)

where node >nul 2>&1
if not errorlevel 1 (
  if exist "scripts\add-ecr-trade-marketing-mis-servicios.js" (
    echo  Asegurar ECR Trade Marketing en hoy...
    node scripts\add-ecr-trade-marketing-mis-servicios.js --also-respaldo
  )
  if exist "scripts\sync-impresoreando-pedidos-organizacion.js" (
    echo  Sync pedidos Impresoreando → organizador ^(madre = hoy^)...
    node scripts\sync-impresoreando-pedidos-organizacion.js --also-respaldo
  )
  if exist "scripts\asegurar-tareas-cerradas.js" (
    echo  Re-cerrar tareas ya hechas...
    node scripts\asegurar-tareas-cerradas.js --also-respaldo
  )
)

echo  Recargando http://127.0.0.1:8000/index.html?disco=1
powershell -NoProfile -Command "Start-Process 'http://127.0.0.1:8000/index.html?disco=1&v=20260731imp'"
echo  Listo. Si la pestana ya estaba abierta, usa Ctrl+Shift+R.
echo.
echo  Si SIGUE viejo, en esa pestana F12 → Consola → pega y Enter:
echo    localStorage.removeItem('organizacion_v2'); location.href='http://127.0.0.1:8000/index.html?disco=1^&v=20260731imp';
echo.
