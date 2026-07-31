@echo off
chcp 65001 >nul
cd /d "%~dp0"

set "ORIGEN=%~1"
set "LIVE=data\organizacion-live.json"
set "RESPALDO=data\organizacion-respaldo-2026-07-30.json"

if "%ORIGEN%"=="" (
  for /f "usebackq delims=" %%i in (`node scripts/respaldo-reciente.js 2^>nul`) do set "ORIGEN=%%i"
)

if "%ORIGEN%"=="" (
  echo.
  echo  No se encontro ningun organizacion-respaldo-*.json
  echo  en data\ ni en %%USERPROFILE%%\Downloads
  echo.
  echo  Opciones:
  echo   1. En el organizador: boton "Respaldo" ^(guarda en Descargas^)
  echo   2. IMPORTAR-RESPALDO.bat "ruta\completa\archivo.json"
  echo   3. Arrastra el JSON sobre este .bat
  echo.
  pause
  exit /b 1
)

if not exist "%ORIGEN%" (
  echo.
  echo  No existe: %ORIGEN%
  pause
  exit /b 1
)

if not exist "data" mkdir data

REM Extraer fecha YYYY-MM-DD del nombre si existe (tambien con " (1)")
for /f "usebackq delims=" %%i in (`powershell -NoProfile -Command "$n=[IO.Path]::GetFileNameWithoutExtension('%ORIGEN%'); if ($n -match 'organizacion-respaldo-(\d{4}-\d{2}-\d{2})') { $matches[1] }"`) do set "FECHA=%%i"
if defined FECHA (
  set "RESPALDO=data\organizacion-respaldo-%FECHA%.json"
)

copy /Y "%ORIGEN%" "%LIVE%" >nul
copy /Y "%ORIGEN%" "%RESPALDO%" >nul

echo.
echo  === Respaldo guardado ===
echo  Origen:   %ORIGEN%
echo  Live:     %LIVE%
echo  Respaldo: %RESPALDO%
echo.

node scripts\asegurar-impresoreando-live.js 2>nul
if errorlevel 1 (
  echo  Aviso: no se pudo asegurar Impresoreando automaticamente.
) else (
  echo  Impresoreando asegurado en el live ^(si faltaba^).
)

echo.
echo  Siguiente: ABRIR-LARAVEL.bat
echo  Luego abre: http://127.0.0.1:8000/index.html?disco=1
echo  ^(Ctrl+Shift+R si ves datos viejos^)
echo.
pause
