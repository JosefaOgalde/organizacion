@echo off
chcp 65001 >nul
cd /d "%~dp0"

set "ORIGEN=%~1"
if "%ORIGEN%"=="" set "ORIGEN=%USERPROFILE%\Downloads\organizacion-respaldo-2026-07-01.json"

set "DESTINO=data\organizacion-respaldo-2026-07-01.json"
set "LIVE=data\organizacion-live.json"

if not exist "%ORIGEN%" (
  echo.
  echo  No se encontro el respaldo:
  echo  %ORIGEN%
  echo.
  echo  Opciones:
  echo   1. Copia el JSON a Downloads con ese nombre
  echo   2. Arrastra el archivo sobre este .bat
  echo   3. IMPORTAR-RESPALDO.bat "ruta\completa\archivo.json"
  echo.
  pause
  exit /b 1
)

if not exist "data" mkdir data
copy /Y "%ORIGEN%" "%DESTINO%" >nul
copy /Y "%ORIGEN%" "%LIVE%" >nul

echo.
echo  === Respaldo importado ===
echo  %LIVE%  ^(se carga solo al abrir con ABRIR-ORGANIZADOR.bat o SERVIR.bat^)
echo.
echo  Siguiente: doble clic en ABRIR-ORGANIZADOR.bat
echo.
pause
