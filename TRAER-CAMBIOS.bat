@echo off
chcp 65001 >nul
cd /d "%~dp0"
title Traer entrega (Laravel + Impresoreando + calendario)

echo.
echo  ========================================
echo   TRAER ENTREGA ACTUAL
echo  ========================================
echo.
echo  En main faltan: fixes de ABRIR-LARAVEL,
echo  ventas Impresoreando, Trade Marketing y
echo  calendario 28-jul. Este bat cambia a la
echo  rama con todo eso y abre Laravel.
echo.

where git >nul 2>&1
if errorlevel 1 (
  echo [ERROR] Git no esta en el PATH.
  pause
  exit /b 1
)

echo [1] git fetch...
git fetch origin
if errorlevel 1 (
  echo [ERROR] git fetch fallo.
  pause
  exit /b 1
)

set "RAMA=cursor/laravel-guardar-entrega-02f9"
echo [2] checkout rama %RAMA%...
git checkout "%RAMA%"
if errorlevel 1 (
  echo Intentando crear rama local desde origin...
  git checkout -B "%RAMA%" "origin/%RAMA%"
  if errorlevel 1 (
    echo Probando rama anterior cursor/impresoreando-maria-paz-venta-4e97...
    git checkout -B cursor/impresoreando-maria-paz-venta-4e97 origin/cursor/impresoreando-maria-paz-venta-4e97
    if errorlevel 1 (
      echo [ERROR] No se pudo cambiar de rama.
      pause
      exit /b 1
    )
    set "RAMA=cursor/impresoreando-maria-paz-venta-4e97"
  )
)

echo [3] git pull...
git pull origin "%RAMA%"
if errorlevel 1 (
  echo [AVISO] pull con problemas; continuo con lo local.
)

echo.
echo [4] Abrir Laravel...
call "%~dp0ABRIR-LARAVEL.bat"
exit /b %ERRORLEVEL%
