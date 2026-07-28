@echo off
chcp 65001 >nul
cd /d "%~dp0"
title Traer cambios (rama Impresoreando)

echo.
echo  ========================================
echo   TRAER CAMBIOS ACTUALES
echo  ========================================
echo.
echo  La rama con logo nuevo, PED-006 transferido,
echo  Trade Marketing y demas NO esta en main.
echo  Este bat cambia a esa rama y abre Laravel.
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

echo [2] checkout rama cursor/impresoreando-maria-paz-venta-4e97...
git checkout cursor/impresoreando-maria-paz-venta-4e97
if errorlevel 1 (
  echo Intentando crear rama local desde origin...
  git checkout -B cursor/impresoreando-maria-paz-venta-4e97 origin/cursor/impresoreando-maria-paz-venta-4e97
  if errorlevel 1 (
    echo [ERROR] No se pudo cambiar a la rama.
    echo Revisa que el remoto sea JosefaOgalde/organizacion.
    pause
    exit /b 1
  )
)

echo [3] git pull...
git pull origin cursor/impresoreando-maria-paz-venta-4e97
if errorlevel 1 (
  echo [AVISO] pull con problemas; continuo con lo local.
)

echo.
echo [4] Abrir Laravel (sync solo desde data\ del repo)...
call "%~dp0ABRIR-LARAVEL.bat"
exit /b %ERRORLEVEL%
