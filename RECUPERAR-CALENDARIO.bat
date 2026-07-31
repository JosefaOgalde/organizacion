@echo off
chcp 65001 >nul
cd /d "%~dp0"
title Recuperar calendario (respaldo 31-jul)

echo.
echo  === Recuperar calendario desde respaldo 31-jul ===
echo  Prioridad: Descargas (1) → data\31-jul → mas reciente
echo.

set "DL=%USERPROFILE%\Downloads"
set "ORIGEN="

if exist "%DL%\organizacion-respaldo-2026-07-31 (1).json" (
  set "ORIGEN=%DL%\organizacion-respaldo-2026-07-31 (1).json"
)
if not defined ORIGEN if exist "%DL%\organizacion-respaldo-2026-07-31.json" (
  set "ORIGEN=%DL%\organizacion-respaldo-2026-07-31.json"
)
if not defined ORIGEN if exist "data\organizacion-respaldo-2026-07-31.json" (
  set "ORIGEN=data\organizacion-respaldo-2026-07-31.json"
)
if not defined ORIGEN (
  for /f "usebackq delims=" %%i in (`node scripts/respaldo-reciente.js 2^>nul`) do set "ORIGEN=%%i"
)
if not defined ORIGEN if exist "data\organizacion-respaldo-2026-07-29.json" (
  set "ORIGEN=data\organizacion-respaldo-2026-07-29.json"
)
if not defined ORIGEN if exist "data\organizacion-respaldo-2026-07-28.json" (
  set "ORIGEN=data\organizacion-respaldo-2026-07-28.json"
)

if not defined ORIGEN (
  echo  [ERROR] No hay organizacion-respaldo-*.json
  echo  Ejemplo:
  echo    IMPORTAR-RESPALDO.bat "%DL%\organizacion-respaldo-2026-07-31 (1).json"
  pause
  exit /b 1
)

if not exist "%ORIGEN%" (
  echo  [ERROR] No existe: %ORIGEN%
  pause
  exit /b 1
)

if not exist "data" mkdir data

if exist "data\organizacion-live.json" (
  set "STAMP=%DATE:~-4%%DATE:~3,2%%DATE:~0,2%-%TIME:~0,2%%TIME:~3,2%%TIME:~6,2%"
  set "STAMP=%STAMP: =0%"
  copy /Y "data\organizacion-live.json" "data\organizacion-live-antes-recuperar-%STAMP%.json" >nul 2>&1
  echo  Copia del live actual guardada.
)

copy /Y "%ORIGEN%" "data\organizacion-live.json" >nul
if errorlevel 1 (
  echo  [ERROR] No se pudo copiar el live.
  pause
  exit /b 1
)

copy /Y "%ORIGEN%" "data\organizacion-respaldo-2026-07-31.json" >nul 2>&1

node scripts\asegurar-impresoreando-live.js 2>nul

echo  OK: live restaurado desde
echo      %ORIGEN%
echo  Siguiente: ABRIR-LARAVEL.bat
echo  URL: http://127.0.0.1:8000/index.html?disco=1
echo  ^(Ctrl+Shift+R^)
echo.
pause
exit /b 0
