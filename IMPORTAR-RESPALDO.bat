@echo off
chcp 65001 >nul
cd /d "%~dp0"

set "ORIGEN=%~1"
set "LIVE=data\organizacion-live.json"

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
copy /Y "%ORIGEN%" "%LIVE%" >nul

echo.
echo  === Respaldo importado ===
echo  Origen:  %ORIGEN%
echo  Live:    %LIVE%
echo.
echo  Siguiente: ABRIR-ORGANIZADOR.bat
echo.
pause
