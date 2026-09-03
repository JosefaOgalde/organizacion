@echo off
chcp 65001 >nul
cd /d "%~dp0"
title Making Of · Revisión de landings

echo.
echo  === Making Of · panel de revisión de landings ===
echo.

set "PANEL=%~dp0index\clientes\mkof\landings-revision\index.html"
if not exist "%PANEL%" (
  echo  [ERROR] No esta el HTML del panel.
  echo  Ruta esperada:
  echo    index\clientes\mkof\landings-revision\index.html
  echo.
  echo  Si falta, libera espacio en C: y corre TRAER-CAMBIOS.bat
  echo  ^(o pide merge a main del panel landings-revision^).
  echo.
  pause
  exit /b 1
)

echo  Abriendo index.html ^(sin servidor :8000^)...
echo  %PANEL%
echo.
start "" "%PANEL%"
echo  Listo. Si ves pantalla vacia: Ctrl+Shift+R
echo.
pause

