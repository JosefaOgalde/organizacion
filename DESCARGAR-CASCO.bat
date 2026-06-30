@echo off
chcp 65001 >nul
echo.
echo  Sakura - Descargar casco para Cura
echo  ==================================
echo.

set "URL=https://github.com/JosefaOgalde/organizacion/raw/cursor/sakura-cliente-prototipo-casco-aee0/sakura-casco-cura.stl"
set "DEST=%USERPROFILE%\Downloads\sakura-casco-cura.stl"

echo Descargando a:
echo %DEST%
echo.

powershell -NoProfile -Command ^
  "$ProgressPreference = 'SilentlyContinue'; ^
   try { ^
     Invoke-WebRequest -Uri '%URL%' -OutFile '%DEST%' -UseBasicParsing; ^
     Write-Host 'OK - Archivo descargado' -ForegroundColor Green ^
   } catch { ^
     Write-Host 'Error:' $_.Exception.Message -ForegroundColor Red; ^
     exit 1 ^
   }"

if errorlevel 1 (
  echo.
  echo Si fallo, abre en el navegador:
  echo %URL%
  pause
  exit /b 1
)

echo.
echo Abriendo carpeta Descargas...
explorer /select,"%DEST%"
echo.
echo En Cura: Abrir -^> %DEST%
echo.
pause
