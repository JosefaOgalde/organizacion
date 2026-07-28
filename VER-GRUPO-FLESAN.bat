@echo off
chcp 65001 >nul
setlocal
title Grupo Flesan — via ABRIR-LARAVEL

REM Siempre el mismo ritual: git pull → ABRIR-LARAVEL.bat → solo :8000
cd /d "%~dp0"

echo.
echo  === Grupo Flesan · flujo unificado ===
echo  1^) checkout rama con Flesan
echo  2^) ABRIR-LARAVEL.bat
echo  3^) URL :8000 prospecto Flesan
echo.

where git >nul 2>&1
if errorlevel 1 (
  echo [ERROR] Git no esta en el PATH.
  pause
  exit /b 1
)

echo [1] git fetch + checkout...
git fetch origin
git checkout cursor/laravel-guardar-entrega-02f9
if errorlevel 1 (
  git checkout -B cursor/laravel-guardar-entrega-02f9 origin/cursor/laravel-guardar-entrega-02f9
  if errorlevel 1 (
    echo [ERROR] No se pudo cambiar de rama.
    pause
    exit /b 1
  )
)
git pull origin cursor/laravel-guardar-entrega-02f9

if not exist "index\clientes\mkof\prospecto\clientes\grupo-flesan\index.html" (
  echo [ERROR] Falta clientes\grupo-flesan — pull incompleto.
  pause
  exit /b 1
)

echo.
echo [2] ABRIR-LARAVEL.bat...
call "%~dp0ABRIR-LARAVEL.bat"

echo.
echo [3] Prospecto Flesan:
echo     http://127.0.0.1:8000/index/clientes/mkof/prospecto/clientes/grupo-flesan/?disco=1
echo     Hub: http://127.0.0.1:8000/index/clientes/mkof/prospecto/?disco=1
echo.
powershell -NoProfile -Command "Start-Process 'http://127.0.0.1:8000/index/clientes/mkof/prospecto/clientes/grupo-flesan/?disco=1'"
powershell -NoProfile -Command "Start-Process 'http://127.0.0.1:8000/index/clientes/mkof/prospecto/?disco=1'"
echo.
pause
