@echo off
chcp 65001 >nul
cd /d "%~dp0"
title Traer cambios (main + calendario + Laravel)

echo.
echo  ========================================
echo   TRAER CAMBIOS HOY
echo  ========================================
echo.
echo  1^) git pull en main
echo  2^) Restaura calendario desde Descargas
echo     ^(organizacion-respaldo-2026-07-31 (1).json^)
echo  3^) Abre Laravel en :8000
echo.
echo  Tu usuario Windows ya define Descargas:
echo  %%USERPROFILE%%\Downloads
echo  ^(ej. C:\Users\Josefa Ogalde\Downloads^)
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

echo [2] checkout main...
git checkout main
if errorlevel 1 (
  echo [ERROR] No se pudo cambiar a main.
  pause
  exit /b 1
)

REM Si aun tenes Joyas Mercury en el repo, archivar ANTES del pull
if exist "index\clientes\joyasmercury\identidad" (
  echo [2b] Archivando Joyas Mercury a tu usuario Windows...
  where node >nul 2>&1 && node scripts\archivar-joyas-mercury.js
)

echo [3] git pull origin main...
git pull origin main
if errorlevel 1 (
  echo.
  echo  [AVISO] El pull fallo ^(a veces por cambios locales^).
  echo  Si menciona impresoreando-seed.json, corre:
  echo    git checkout -- data\impresoreando-seed.json
  echo  y vuelve a hacer doble clic en este .bat
  echo.
  pause
  exit /b 1
)

echo.
echo [4] Abrir Laravel restaurando calendario...
call "%~dp0ABRIR-LARAVEL.bat" restaurar
exit /b %ERRORLEVEL%
