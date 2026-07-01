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
echo  %DESTINO%   ^(version en Git con SUBIR.bat^)
echo  %LIVE%      ^(carga inmediata con SERVIR.bat^)
echo.
echo  Siguiente:
echo   1. Ejecuta SERVIR.bat
echo   2. Abre http://localhost:3000/index.html?respaldo=1
echo      ^(fuerza este respaldo aunque el navegador tenga datos viejos^)
echo.
echo  Para guardar en GitHub: SUBIR.bat
echo.
pause
