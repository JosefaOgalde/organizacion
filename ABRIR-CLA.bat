@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "index\clientes\DesafioLatam\CLA.html" (
  echo.
  echo  [ERROR] No existe CLA.html. Haz git pull y checkout de la rama del portal.
  echo.
  pause
  exit /b 1
)
start "" "%~dp0index\clientes\DesafioLatam\CLA.html"
echo Abriendo proyecto CLA...
timeout /t 2 >nul
