@echo off
chcp 65001 >nul
cd /d "%~dp0"
title Making Of · Revisión de landings

echo.
echo  === Making Of · panel de revisión de landings ===
echo.

set "PANEL=%~dp0index\clientes\mkof\landings-revision\index.html"
if not exist "%PANEL%" (
  echo  [ERROR] No esta la carpeta del panel.
  echo.
  echo  En CMD, dentro de la carpeta organizacion:
  echo    git fetch origin
  echo    git checkout cursor/arbol-animacion-3ba0
  echo    git pull origin cursor/arbol-animacion-3ba0
  echo.
  pause
  exit /b 1
)

echo  Abriendo el panel con doble clic ^(sin servidor^)...
echo  %PANEL%
echo.
start "" "%PANEL%"
echo  Listo. Si ves pantalla vacia: Ctrl+Shift+R
echo  Opcion con Laravel: EMPEZAR-AQUI.bat y luego
echo  http://127.0.0.1:8000/index/clientes/mkof/landings-revision/
echo.
pause
