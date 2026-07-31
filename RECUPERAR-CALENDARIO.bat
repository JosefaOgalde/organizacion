@echo off
chcp 65001 >nul
cd /d "%~dp0"
title Recuperar calendario (respaldo mas reciente)

echo.
echo  === Recuperar calendario desde respaldo ===
echo  Prioridad: Descargas 31-jul → data\ 31-jul → mas reciente → 29 → 28
echo.

set "ORIGEN="
if exist "%USERPROFILE%\Downloads\organizacion-respaldo-2026-07-31.json" (
  set "ORIGEN=%USERPROFILE%\Downloads\organizacion-respaldo-2026-07-31.json"
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
  echo  Pon el del 31-jul en Descargas o en data\ y vuelve a correr.
  echo  Ejemplo:
  echo    IMPORTAR-RESPALDO.bat "%%USERPROFILE%%\Downloads\organizacion-respaldo-2026-07-31.json"
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
  echo  Copia del live actual guardada ^(por si acaso^).
)

copy /Y "%ORIGEN%" "data\organizacion-live.json" >nul
if errorlevel 1 (
  echo  [ERROR] No se pudo copiar el live.
  pause
  exit /b 1
)

REM Guardar tambien como respaldo con fecha del nombre
for /f "usebackq delims=" %%i in (`powershell -NoProfile -Command "$n=[IO.Path]::GetFileNameWithoutExtension('%ORIGEN%'); if ($n -match 'organizacion-respaldo-(\d{4}-\d{2}-\d{2})') { $matches[1] }"`) do set "FECHA=%%i"
if defined FECHA (
  copy /Y "%ORIGEN%" "data\organizacion-respaldo-%FECHA%.json" >nul
  echo  Respaldo en repo: data\organizacion-respaldo-%FECHA%.json
)

node scripts\asegurar-impresoreando-live.js 2>nul

echo  OK: live restaurado desde
echo      %ORIGEN%
echo  Siguiente: ABRIR-LARAVEL.bat  ^(o RECARGAR.bat si ya corre :8000^)
echo  URL: http://127.0.0.1:8000/index.html?disco=1
echo  ^(Ctrl+Shift+R si ves datos viejos^)
echo.
pause
exit /b 0
