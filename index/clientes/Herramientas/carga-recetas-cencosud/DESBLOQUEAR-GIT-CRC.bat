@echo off
chcp 65001 >nul
cd /d "%~dp0..\..\..\..\"
title Desbloquear git CRC

echo.
echo  === Desbloquear .git (locks) ===
echo  Carpeta: %CD%
echo.
echo  Cierra Cursor y GitHub Desktop antes de continuar.
echo  Pulsa una tecla cuando esten cerrados...
pause >nul

set GIT_TERMINAL_PROMPT=0

REM Cerrar procesos git colgados (Windows)
taskkill /IM git.exe /F >nul 2>&1
taskkill /IM git-remote-https.exe /F >nul 2>&1
timeout /t 2 >nul

REM Borrar locks conocidos
if exist ".git\HEAD.lock" del /f /q ".git\HEAD.lock"
if exist ".git\index.lock" del /f /q ".git\index.lock"
if exist ".git\config.lock" del /f /q ".git\config.lock"
if exist ".git\refs\remotes\origin\cursor\crc-scraping-bm-78d6.lock" del /f /q ".git\refs\remotes\origin\cursor\crc-scraping-bm-78d6.lock"

REM Cualquier otro .lock bajo .git
for /r ".git" %%F in (*.lock) do (
  echo  Borrando %%F
  del /f /q "%%F" 2>nul
)

echo.
echo  [OK] Locks eliminados.
echo.
pause
