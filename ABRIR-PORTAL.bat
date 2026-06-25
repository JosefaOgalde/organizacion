@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "index\clientes.html" (
  echo.
  echo  [ERROR] No existe index\clientes.html en esta carpeta.
  echo  Ejecuta primero en PowerShell:
  echo    git pull
  echo    git checkout cursor/clientes-portal-paso1-d6a1
  echo.
  pause
  exit /b 1
)
start "" "%~dp0index\clientes.html"
echo Abriendo portal de clientes...
timeout /t 2 >nul
