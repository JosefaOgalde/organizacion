@echo off
chcp 65001 >nul
setlocal
title Grupo Flesan — prospecto MKOF

cd /d "%~dp0"
if not exist "index\clientes\mkof\prospecto\meta.json" (
  echo No encuentro el repo. Ejecuta este BAT desde la raiz de organizacion.
  pause
  exit /b 1
)

echo.
echo === 1) Traer rama con Grupo Flesan ===
git fetch origin
git checkout cursor/laravel-guardar-entrega-02f9
if errorlevel 1 (
  echo.
  echo FALLÓ el checkout. Si hay cambios locales: git stash -u
  echo Luego vuelve a ejecutar este BAT.
  pause
  exit /b 1
)
git pull origin cursor/laravel-guardar-entrega-02f9

echo.
echo === 2) Verificar que exista la carpeta ===
if not exist "index\clientes\mkof\prospecto\clientes\grupo-flesan\index.html" (
  echo ERROR: no está clientes\grupo-flesan — la rama no bajó bien.
  pause
  exit /b 1
)
findstr /C:"Grupo Flesan" "index\clientes\mkof\prospecto\meta.json" >nul
if errorlevel 1 (
  echo ERROR: meta.json no lista Grupo Flesan.
  pause
  exit /b 1
)
echo OK: carpeta + meta.json con Grupo Flesan

echo.
echo === 3) Abrir Laravel ===
if exist "ABRIR-LARAVEL.bat" (
  start "Laravel" cmd /c "ABRIR-LARAVEL.bat"
) else (
  echo No hay ABRIR-LARAVEL.bat — ábrelo a mano.
)

timeout /t 4 /nobreak >nul
start "" "http://127.0.0.1:8000/index/clientes/mkof/prospecto/?disco=1&v=%RANDOM%"
start "" "http://127.0.0.1:8000/index/clientes/mkof/prospecto/clientes/grupo-flesan/?disco=1&v=%RANDOM%"

echo.
echo Listo. Hub = Indisa + Grupo Flesan.
echo Si ves lo viejo: Ctrl+Shift+R en el navegador.
echo.
pause
