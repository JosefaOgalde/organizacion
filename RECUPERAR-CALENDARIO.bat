@echo off
chcp 65001 >nul
cd /d "%~dp0"
title Recuperar calendario (respaldo mas reciente)

echo.
echo  === Recuperar calendario desde el respaldo mas reciente ===
echo  Usa data\organizacion-respaldo-YYYY-MM-DD.json con la fecha
echo  mas nueva del nombre ^(hoy: prioriza 30-jul si existe^).
echo.

set "ORIGEN="
for /f "usebackq delims=" %%i in (`node scripts/respaldo-reciente.js --solo-repo 2^>nul`) do set "ORIGEN=%%i"

if "%ORIGEN%"=="" (
  echo  [ERROR] No hay organizacion-respaldo-*.json en data\
  echo  Importa primero:
  echo    IMPORTAR-RESPALDO.bat "%%USERPROFILE%%\Downloads\organizacion-respaldo-2026-07-30.json"
  echo  O corre: TRAER-CAMBIOS.bat
  pause
  exit /b 1
)

if not exist "%ORIGEN%" (
  echo  [ERROR] No existe: %ORIGEN%
  pause
  exit /b 1
)

if exist "data\organizacion-live.json" (
  set "STAMP=%DATE:~-4%%DATE:~3,2%%DATE:~0,2%-%TIME:~0,2%%TIME:~3,2%%TIME:~6,2%"
  set "STAMP=%STAMP: =0%"
  copy /Y "data\organizacion-live.json" "data\organizacion-live-antes-recuperar-%STAMP%.json" >nul 2>&1
  echo  Respaldo del live actual guardado ^(por si acaso^).
)

copy /Y "%ORIGEN%" "data\organizacion-live.json" >nul
if errorlevel 1 (
  echo  [ERROR] No se pudo copiar el live.
  pause
  exit /b 1
)

echo  OK: live restaurado desde %ORIGEN%
echo  Siguiente: ABRIR-LARAVEL.bat  ^(o RECARGAR.bat si ya corre :8000^)
echo.
pause
exit /b 0
