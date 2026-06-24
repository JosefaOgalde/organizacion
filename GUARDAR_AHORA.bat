@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo.
echo  Guardando organizador en GitHub...
echo  Carpeta: %CD%
echo.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0run-git.ps1"
echo.
type GIT_RESULT.txt 2>nul
echo.
echo  Listo. Si ves HASH y push OK, tu trabajo esta en GitHub.
echo.
pause
