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
if errorlevel 1 (
  echo [AVISO] pull con cambios locales — intentando stash de respaldos...
  git stash push -m "auto-flesan" -- data/organizacion-respaldo-2026-07-21.json data/organizacion-respaldo-2026-07-24.json data/organizacion-respaldo-2026-07-28.json 2>nul
  git pull origin cursor/laravel-guardar-entrega-02f9
)

if not exist "index\clientes\mkof\prospecto\clientes\grupo-flesan\index.html" (
  echo [ERROR] Falta clientes\grupo-flesan — pull incompleto.
  pause
  exit /b 1
)
if not exist "index\clientes\mkof\prospecto\clientes\grupo-flesan\RRSS\laminas\01-ecosistema-rrss.html" (
  echo [ERROR] Falta lamina 01 ECOSISTEMA — corre git pull otra vez.
  pause
  exit /b 1
)

REM Sanity: la tabla nueva debe estar en el hub (si ves "Instagram pendiente" es HTML viejo)
findstr /C:"tabla-eco-static" "index\clientes\mkof\prospecto\clientes\grupo-flesan\index.html" >nul
if errorlevel 1 (
  echo [ERROR] Hub sin tabla ECOSISTEMA — estas en commit viejo.
  echo   Corre: git fetch origin ^&^& git reset --hard origin/cursor/laravel-guardar-entrega-02f9
  echo   ^(solo si no tienes cambios locales que quieras guardar^)
  pause
  exit /b 1
)
echo [OK] Hub con tabla ECOSISTEMA ^(commit actualizado^).

echo.
echo [2] ABRIR-LARAVEL.bat...
call "%~dp0ABRIR-LARAVEL.bat"

echo.
echo [3] Prospecto Flesan + tabla ECOSISTEMA:
echo     Hub:   http://127.0.0.1:8000/index/clientes/mkof/prospecto/clientes/grupo-flesan/?disco=1
echo     Tabla: http://127.0.0.1:8000/index/clientes/mkof/prospecto/clientes/grupo-flesan/RRSS/laminas/01-ecosistema-rrss.html?v=20260728t
echo.
powershell -NoProfile -Command "Start-Process 'http://127.0.0.1:8000/index/clientes/mkof/prospecto/clientes/grupo-flesan/?disco=1'"
powershell -NoProfile -Command "Start-Process 'http://127.0.0.1:8000/index/clientes/mkof/prospecto/clientes/grupo-flesan/RRSS/laminas/01-ecosistema-rrss.html?v=20260728t'"
echo.
pause
