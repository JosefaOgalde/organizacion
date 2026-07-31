@echo off
chcp 65001 >nul
cd /d "%~dp0"
title Traer entrega (logo Impresoreando + respaldo reciente)

echo.
echo  ========================================
echo   TRAER ENTREGA ACTUAL
echo  ========================================
echo.
echo  Incluye: Editar logo Impresoreando,
echo  respaldo mas reciente (31-jul) y
echo  flujo Laravel unificado.
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

REM Guardar cambios locales de data/ para poder cambiar de rama
echo [1b] stash de cambios locales ^(si hay^)...
git stash push -u -m "auto-traer-cambios" -- data/ 2>nul

set "RAMA=cursor/imp-logo-editar-aac4"
echo [2] checkout rama %RAMA%...
git checkout "%RAMA%"
if errorlevel 1 (
  echo Intentando crear rama local desde origin...
  git checkout -B "%RAMA%" "origin/%RAMA%"
  if errorlevel 1 (
    echo [ERROR] No se pudo cambiar de rama.
    echo  Si git se queja de archivos locales:
    echo    git stash push -u -m "tmp"
    echo    git checkout %RAMA%
    pause
    exit /b 1
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
