@echo off
chcp 65001 >nul
cd /d "%~dp0"
title Recuperar calendario (respaldo 28-jul)

echo.
echo  === Recuperar calendario desde respaldo 28-jul ===
echo  Copia data\organizacion-respaldo-2026-07-28.json
echo  sobre data\organizacion-live.json
echo  ^(si el live se piso con un respaldo viejo^).
echo.

if not exist "data\organizacion-respaldo-2026-07-28.json" (
  echo  [ERROR] Falta data\organizacion-respaldo-2026-07-28.json
  echo  Corre antes: TRAER-CAMBIOS.bat  ^(o git pull en la rama de entrega^)
  pause
  exit /b 1
)

if exist "data\organizacion-live.json" (
  set "STAMP=%DATE:~-4%%DATE:~3,2%%DATE:~0,2%-%TIME:~0,2%%TIME:~3,2%%TIME:~6,2%"
  set "STAMP=%STAMP: =0%"
  copy /Y "data\organizacion-live.json" "data\organizacion-live-antes-recuperar-%STAMP%.json" >nul 2>&1
  echo  Respaldo del live actual guardado ^(por si acaso^).
)

copy /Y "data\organizacion-respaldo-2026-07-28.json" "data\organizacion-live.json" >nul
if errorlevel 1 (
  echo  [ERROR] No se pudo copiar el live.
  pause
  exit /b 1
)

echo  OK: live restaurado desde 2026-07-28.
echo  Siguiente: ABRIR-LARAVEL.bat  ^(o RECARGAR.bat si ya corre :8000^)
echo.
pause
exit /b 0
