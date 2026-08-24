@echo off
chcp 65001 >nul
REM Un clic: desbloquea git, trae rama CRC y lanza la prueba del salmon.
cd /d "%~dp0..\..\..\..\"
title CRC — actualizar rama y probar

echo.
echo  === Actualizar cursor/crc-scraping-bm-78d6 ===
echo  Carpeta: %CD%
echo.

set GIT_TERMINAL_PROMPT=0

if exist ".git\refs\remotes\origin\cursor\crc-scraping-bm-78d6.lock" (
  echo  Borrando lock git...
  del /f /q ".git\refs\remotes\origin\cursor\crc-scraping-bm-78d6.lock"
)

git fetch origin cursor/crc-scraping-bm-78d6 2>nul
if errorlevel 1 (
  echo  Fetch fallo; limpio ref remota y reintento...
  git update-ref -d refs/remotes/origin/cursor/crc-scraping-bm-78d6 2>nul
  git fetch origin cursor/crc-scraping-bm-78d6
  if errorlevel 1 (
    echo.
    echo  [ERROR] git fetch sigue fallando. Cierra Cursor/GitHub Desktop
    echo  y vuelve a ejecutar este .bat
    echo.
    pause
    exit /b 1
  )
)

git checkout cursor/crc-scraping-bm-78d6 2>nul
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
  echo  [AVISO] Falta el JSON. Genera la receta desde el Word primero.
  pause
  exit /b 1
)

echo  === Publicar receta (dry-run, navegador visible) ===
python scripts\publicar-receta-cencosud.py "%JSON%" --headed --dry-run
echo.
pause
