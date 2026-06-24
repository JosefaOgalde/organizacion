@echo off
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0run-git.ps1"
echo.
echo Presiona una tecla para cerrar...
pause >nul
