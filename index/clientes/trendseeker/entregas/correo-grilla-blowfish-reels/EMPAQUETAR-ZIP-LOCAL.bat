@echo off
chcp 65001 >nul
setlocal EnableExtensions
cd /d "%~dp0"
set "DL=%USERPROFILE%\Downloads"
set "OUT=%DL%\TrendSeeker-Grilla-Nov2026-8-CORREO.zip"
set "STAGE=%TEMP%\ts-nov2026-correo-pack-8"

echo.
echo  Empaquetar grilla nov 2026 (8 · ajuste Vale) + videos disponibles
echo.

REM Obligatorio: video C2 enviado por Vale
if not exist "%DL%\Reel_Blowfish_Primavera_Final-2.mp4" (
  echo  [ERROR] Falta en Descargas:
  echo          Reel_Blowfish_Primavera_Final-2.mp4
  pause
  exit /b 1
)

if exist "%STAGE%" rmdir /S /Q "%STAGE%"
mkdir "%STAGE%" >nul
xcopy /E /I /Y ".\*" "%STAGE%\TrendSeeker-Grilla-Nov2026-8\" >nul

copy /Y "%DL%\Reel_Blowfish_Primavera_Final-2.mp4" "%STAGE%\TrendSeeker-Grilla-Nov2026-8\C02-reel-blowfish-primavera\videos\Reel_Blowfish_Primavera_Final-2.mp4" >nul
del /Q "%STAGE%\TrendSeeker-Grilla-Nov2026-8\C02-reel-blowfish-primavera\videos\PONER-VIDEO-AQUI.txt" 2>nul

REM Opcionales si están en Descargas
if exist "%DL%\Parlane white Adaptado.mp4" (
  copy /Y "%DL%\Parlane white Adaptado.mp4" "%STAGE%\TrendSeeker-Grilla-Nov2026-8\C04-parlane-white\videos\Parlane-white-Adaptado.mp4" >nul
  del /Q "%STAGE%\TrendSeeker-Grilla-Nov2026-8\C04-parlane-white\videos\PONER-VIDEO-AQUI.txt" 2>nul
  echo  + C4 Parlane
) else (
  echo  · C4 Parlane: sin MP4 en Descargas ^(queda placeholder^)
)

if exist "%DL%\Vero Correa.mp4" (
  copy /Y "%DL%\Vero Correa.mp4" "%STAGE%\TrendSeeker-Grilla-Nov2026-8\C05-vero-correa\videos\Vero-Correa.mp4" >nul
  del /Q "%STAGE%\TrendSeeker-Grilla-Nov2026-8\C05-vero-correa\videos\PONER-VIDEO-AQUI.txt" 2>nul
  echo  + C5 Vero Correa
) else (
  echo  · C5 Vero Correa: sin MP4 en Descargas ^(queda placeholder^)
)

REM Si Tito ya dejó el video Hunter con nombre fijo, incluirlo
if exist "%DL%\Hunter-zapatillas-C1.mp4" (
  copy /Y "%DL%\Hunter-zapatillas-C1.mp4" "%STAGE%\TrendSeeker-Grilla-Nov2026-8\C01-hunter-zapatillas\videos\Hunter-zapatillas-C1.mp4" >nul
  del /Q "%STAGE%\TrendSeeker-Grilla-Nov2026-8\C01-hunter-zapatillas\videos\PENDIENTE-TITO.txt" 2>nul
  echo  + C1 Hunter ^(Tito^)
)

powershell -NoProfile -Command "Compress-Archive -Path '%STAGE%\TrendSeeker-Grilla-Nov2026-8\*' -DestinationPath '%OUT%' -Force"
if errorlevel 1 goto :err
echo.
echo  OK → %OUT%
echo  Adjunta ese ZIP al correo (02-EMAIL-BORRADOR.txt)
explorer "%DL%"
pause
exit /b 0

:err
echo  [ERROR] ZIP
pause
exit /b 1
