@echo off
chcp 65001 >nul
cd /d "%~dp0..\..\..\..\"
title CRC — actualizar rama y probar

echo.
echo  === Actualizar cursor/crc-scraping-bm-78d6 ===
echo  Carpeta: %CD%
echo.

call "%~dp0DESBLOQUEAR-GIT-CRC.bat"
if errorlevel 1 exit /b 1

set GIT_TERMINAL_PROMPT=0

git fetch origin cursor/crc-scraping-bm-78d6
if errorlevel 1 (
  echo  Fetch fallo; limpio ref remota...
  git update-ref -d refs/remotes/origin/cursor/crc-scraping-bm-78d6 2>nul
  call "%~dp0DESBLOQUEAR-GIT-CRC.bat"
  git fetch origin cursor/crc-scraping-bm-78d6
  if errorlevel 1 (
    echo  [ERROR] git fetch sigue fallando.
    pause
    exit /b 1
  )
)

git checkout -f cursor/crc-scraping-bm-78d6
if errorlevel 1 (
  call "%~dp0DESBLOQUEAR-GIT-CRC.bat"
  git checkout -f cursor/crc-scraping-bm-78d6
)

git reset --hard origin/cursor/crc-scraping-bm-78d6
if errorlevel 1 (
  echo  [ERROR] reset fallo
  pause
  exit /b 1
)

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
