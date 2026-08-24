@echo off
chcp 65001 >nul
cd /d "%~dp0..\..\..\..\"
title CRC — actualizar rama y probar

echo.
echo  === Actualizar cursor/crc-scraping-bm-78d6 ===
echo  Carpeta: %CD%
echo.

set GIT_TERMINAL_PROMPT=0
taskkill /IM git.exe /F >nul 2>&1
taskkill /IM git-remote-https.exe /F >nul 2>&1
timeout /t 1 >nul
if exist ".git\HEAD.lock" del /f /q ".git\HEAD.lock"
if exist ".git\index.lock" del /f /q ".git\index.lock"
for /r ".git" %%F in (*.lock) do del /f /q "%%F" 2>nul

git fetch origin cursor/crc-scraping-bm-78d6
if errorlevel 1 (
  git update-ref -d refs/remotes/origin/cursor/crc-scraping-bm-78d6 2>nul
  if exist ".git\HEAD.lock" del /f /q ".git\HEAD.lock"
  git fetch origin cursor/crc-scraping-bm-78d6
  if errorlevel 1 (
    echo  [ERROR] git fetch fallo. Cierra Cursor/GitHub Desktop y ejecuta DESBLOQUEAR-GIT-CRC.bat
    pause
    exit /b 1
  )
)

git checkout -f cursor/crc-scraping-bm-78d6
git reset --hard origin/cursor/crc-scraping-bm-78d6

echo.
git log -1 --oneline
echo.

set JSON=index\clientes\Herramientas\carga-recetas-cencosud\out\salmon-a-la-parrilla-con-salsa-de-palta.json
if not exist "%JSON%" (
  echo  [AVISO] Falta el JSON del salmon en out\
  pause
  exit /b 1
)

echo  === Publicar receta (dry-run) ===
python scripts\publicar-receta-cencosud.py "%JSON%" --headed --dry-run
echo.
pause
