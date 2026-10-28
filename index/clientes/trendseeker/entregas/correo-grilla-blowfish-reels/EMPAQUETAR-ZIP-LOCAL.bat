@echo off
chcp 65001 >nul
setlocal EnableExtensions
cd /d "%~dp0"

set "DL=%USERPROFILE%\Downloads"
set "OUT=%DL%\TrendSeeker-Grilla-Blowfish-Reels-CORREO.zip"
set "STAGE=%TEMP%\ts-blowfish-correo-pack"

echo.
echo  Empaquetar grilla Blowfish + videos desde Descargas
echo  Origen videos: %DL%
echo.

if not exist "%DL%\Playa Play Reel.mp4" goto :missing
if not exist "%DL%\Ciudad Play Reel.mp4" goto :missing
if not exist "%DL%\MARLEY.mp4" goto :missing
if not exist "%DL%\Reel-Blowfish.mp4" goto :missing
if not exist "%DL%\Parlane white Adaptado.mp4" goto :missing
if not exist "%DL%\Vero Correa.mp4" goto :missing
if not exist "%DL%\Reel.mp4" goto :missing

if exist "%STAGE%" rmdir /S /Q "%STAGE%"
mkdir "%STAGE%" >nul

echo  Copiando pack base...
xcopy /E /I /Y ".\*" "%STAGE%\TrendSeeker-Grilla-Blowfish-Reels\" >nul

echo  Copiando videos (Play/Marley primero en grilla)...
copy /Y "%DL%\Playa Play Reel.mp4" "%STAGE%\TrendSeeker-Grilla-Blowfish-Reels\C01-playa-play-reel\videos\Playa-Play-Reel.mp4" >nul
copy /Y "%DL%\Ciudad Play Reel.mp4" "%STAGE%\TrendSeeker-Grilla-Blowfish-Reels\C02-ciudad-play-reel\videos\Ciudad-Play-Reel.mp4" >nul
copy /Y "%DL%\MARLEY.mp4" "%STAGE%\TrendSeeker-Grilla-Blowfish-Reels\C03-marley\videos\MARLEY.mp4" >nul
copy /Y "%DL%\Reel-Blowfish.mp4" "%STAGE%\TrendSeeker-Grilla-Blowfish-Reels\C04-reel-blowfish\videos\Reel-Blowfish.mp4" >nul
copy /Y "%DL%\Parlane white Adaptado.mp4" "%STAGE%\TrendSeeker-Grilla-Blowfish-Reels\C05-parlane-white\videos\Parlane-white-Adaptado.mp4" >nul
copy /Y "%DL%\Vero Correa.mp4" "%STAGE%\TrendSeeker-Grilla-Blowfish-Reels\C06-vero-correa\videos\Vero-Correa.mp4" >nul
copy /Y "%DL%\Reel.mp4" "%STAGE%\TrendSeeker-Grilla-Blowfish-Reels\C07-reel-general\videos\Reel.mp4" >nul

del /Q "%STAGE%\TrendSeeker-Grilla-Blowfish-Reels\C01-playa-play-reel\videos\PONER-VIDEO-AQUI.txt" 2>nul
del /Q "%STAGE%\TrendSeeker-Grilla-Blowfish-Reels\C02-ciudad-play-reel\videos\PONER-VIDEO-AQUI.txt" 2>nul
del /Q "%STAGE%\TrendSeeker-Grilla-Blowfish-Reels\C03-marley\videos\PONER-VIDEO-AQUI.txt" 2>nul
del /Q "%STAGE%\TrendSeeker-Grilla-Blowfish-Reels\C04-reel-blowfish\videos\PONER-VIDEO-AQUI.txt" 2>nul
del /Q "%STAGE%\TrendSeeker-Grilla-Blowfish-Reels\C05-parlane-white\videos\PONER-VIDEO-AQUI.txt" 2>nul
del /Q "%STAGE%\TrendSeeker-Grilla-Blowfish-Reels\C06-vero-correa\videos\PONER-VIDEO-AQUI.txt" 2>nul
del /Q "%STAGE%\TrendSeeker-Grilla-Blowfish-Reels\C07-reel-general\videos\PONER-VIDEO-AQUI.txt" 2>nul

echo  Creando ZIP...
powershell -NoProfile -Command "Compress-Archive -Path '%STAGE%\TrendSeeker-Grilla-Blowfish-Reels\*' -DestinationPath '%OUT%' -Force"
if errorlevel 1 goto :err

echo.
echo  OK → %OUT%
echo  Adjunta ese ZIP al correo (ver 02-EMAIL-BORRADOR.txt)
echo.
explorer "%DL%"
pause
exit /b 0

:missing
echo  [ERROR] Falta alguno de estos MP4 en Descargas:
echo    Playa Play Reel.mp4
echo    Ciudad Play Reel.mp4
echo    MARLEY.mp4
echo    Reel-Blowfish.mp4
echo    Parlane white Adaptado.mp4
echo    Vero Correa.mp4
echo    Reel.mp4
echo.
pause
exit /b 1

:err
echo  [ERROR] No se pudo crear el ZIP
pause
exit /b 1
