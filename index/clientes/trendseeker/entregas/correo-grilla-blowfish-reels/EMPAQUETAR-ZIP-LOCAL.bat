@echo off
chcp 65001 >nul
setlocal EnableExtensions
cd /d "%~dp0"
set "DL=%USERPROFILE%\Downloads"
set "OUT=%DL%\TrendSeeker-Grilla-Blowfish-Reels-8-CORREO.zip"
set "STAGE=%TEMP%\ts-blowfish-correo-pack-8"

echo.
echo  Empaquetar grilla Blowfish (8 contenidos) + videos
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
xcopy /E /I /Y ".\*" "%STAGE%\TrendSeeker-Grilla-Blowfish-Reels-8\" >nul

copy /Y "%DL%\Playa Play Reel.mp4" "%STAGE%\TrendSeeker-Grilla-Blowfish-Reels-8\C01-playa-play-reel\videos\Playa-Play-Reel.mp4" >nul
copy /Y "%DL%\Ciudad Play Reel.mp4" "%STAGE%\TrendSeeker-Grilla-Blowfish-Reels-8\C02-ciudad-play-reel\videos\Ciudad-Play-Reel.mp4" >nul
copy /Y "%DL%\MARLEY.mp4" "%STAGE%\TrendSeeker-Grilla-Blowfish-Reels-8\C03-marley\videos\MARLEY.mp4" >nul
copy /Y "%DL%\Reel-Blowfish.mp4" "%STAGE%\TrendSeeker-Grilla-Blowfish-Reels-8\C04-reel-blowfish\videos\Reel-Blowfish.mp4" >nul
copy /Y "%DL%\Parlane white Adaptado.mp4" "%STAGE%\TrendSeeker-Grilla-Blowfish-Reels-8\C05-parlane-white\videos\Parlane-white-Adaptado.mp4" >nul
copy /Y "%DL%\Vero Correa.mp4" "%STAGE%\TrendSeeker-Grilla-Blowfish-Reels-8\C06-vero-correa\videos\Vero-Correa.mp4" >nul
copy /Y "%DL%\Reel.mp4" "%STAGE%\TrendSeeker-Grilla-Blowfish-Reels-8\C07-reel-general\videos\Reel.mp4" >nul

for %%D in (C01-playa-play-reel C02-ciudad-play-reel C03-marley C04-reel-blowfish C05-parlane-white C06-vero-correa C07-reel-general) do (
  del /Q "%STAGE%\TrendSeeker-Grilla-Blowfish-Reels-8\%%D\videos\PONER-VIDEO-AQUI.txt" 2>nul
)

powershell -NoProfile -Command "Compress-Archive -Path '%STAGE%\TrendSeeker-Grilla-Blowfish-Reels-8\*' -DestinationPath '%OUT%' -Force"
if errorlevel 1 goto :err
echo.
echo  OK → %OUT%
echo  Adjunta ese ZIP al correo (02-EMAIL-BORRADOR.txt)
explorer "%DL%"
pause
exit /b 0

:missing
echo  [ERROR] Falta MP4 en Descargas (7 videos requeridos).
pause
exit /b 1
:err
echo  [ERROR] ZIP
pause
exit /b 1
