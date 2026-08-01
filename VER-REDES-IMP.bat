@echo off
chcp 65001 >nul
cd /d "%~dp0"
title Ver Redes Impresoreando

echo.
echo  === Traer main + abrir campaña Redes ===
echo.

where git >nul 2>&1
if errorlevel 1 (
  echo [ERROR] Falta Git en el PATH
  pause
  exit /b 1
)

echo [1] git checkout main + pull...
git checkout main
if errorlevel 1 (
  echo [ERROR] No pude cambiar a main
  pause
  exit /b 1
)
git pull origin main
if errorlevel 1 (
  echo.
  echo  Si fallo por impresoreando-seed.json:
  echo    git checkout -- data\impresoreando-seed.json
  echo    git pull origin main
  echo.
  pause
  exit /b 1
)

echo [2] Comprobar que existe la pestana Redes...
findstr /C:"Redes sociales" "index\clientes\impresoreando\panel\index.html" >nul
if errorlevel 1 (
  echo [ERROR] Tu carpeta aun NO tiene la pestana Redes.
  echo  Estás en otra carpeta del proyecto o el pull no trajo main.
  echo  Carpeta actual:
  echo  %CD%
  pause
  exit /b 1
)
echo  OK — index.html tiene Redes sociales

echo [3] Abrir Laravel + panel Redes...
if exist "ABRIR-LARAVEL.bat" (
  call "%~dp0ABRIR-LARAVEL.bat" sin-nav
) else (
  echo [AVISO] No hay ABRIR-LARAVEL.bat — abro URL igual
)

timeout /t 2 >nul
powershell -NoProfile -Command "Start-Process 'http://127.0.0.1:8000/index/clientes/impresoreando/panel/?tab=redes&v=20260801b'"
echo.
echo  Si ves pantalla vieja: Ctrl+Shift+R
echo  Debes ver la pestana "Redes sociales" al lado de Bitacora.
echo.
pause
