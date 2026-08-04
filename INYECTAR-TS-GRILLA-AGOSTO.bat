@echo off
chcp 65001 >nul
cd /d "%~dp0"
title Inyectar grilla TS agosto 2026

echo.
echo  ========================================
echo   TRENDSEEKER · Grilla agosto 2026
echo  ========================================
echo.
echo  Trae el script desde la rama del PR
echo  e inyecta las 12 madres + subtareas
echo  en el calendario local ^(sin borrar el resto^).
echo.

where git >nul 2>&1
if errorlevel 1 (
  echo [ERROR] Git no esta en el PATH.
  pause
  exit /b 1
)

where node >nul 2>&1
if errorlevel 1 (
  echo [ERROR] Node no esta en el PATH. Instala Node.js o abre Laragon.
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

echo [3] Traer archivos de la grilla agosto ^(rama PR^)...
git checkout origin/cursor/ts-grilla-agosto-2026-40bb -- ^
  scripts/add-ts-contenidos-agosto-2026.js ^
  data/organizacion-respaldo-2026-07-31.json ^
  ABRIR-LARAVEL.bat ^
  index/assets/portal-cliente.js ^
  index/assets/clientes-data.js ^
  index/clientes/trendseeker/index.html ^
  docs/ESTRATEGIA-REDES-AGOSTO-2026.md
if errorlevel 1 (
  echo [ERROR] No se pudieron traer los archivos de la rama.
  echo  Revisa que exista origin/cursor/ts-grilla-agosto-2026-40bb
  pause
  exit /b 1
)

if not exist "scripts\add-ts-contenidos-agosto-2026.js" (
  echo [ERROR] Falta scripts\add-ts-contenidos-agosto-2026.js
  pause
  exit /b 1
)

if not exist "data\organizacion-live.json" (
  echo [4] No hay live — copiando desde respaldo 31-jul...
  if not exist "data" mkdir data
  copy /Y "data\organizacion-respaldo-2026-07-31.json" "data\organizacion-live.json" >nul
)

echo [5] Inyectando 12 madres + subtareas...
node scripts\add-ts-contenidos-agosto-2026.js
if errorlevel 1 (
  echo [ERROR] El script de inyeccion fallo.
  pause
  exit /b 1
)

echo.
echo  OK. Abriendo calendario agosto...
echo  Si no ves cambios: Ctrl+Shift+R en el navegador.
echo.
start "" "http://127.0.0.1:8000/index.html?disco=1&fecha=2026-08-07&vista=mes"

echo  Si Laravel no esta corriendo, abre tambien ABRIR-LARAVEL.bat
echo  ^(sin "restaurar": eso pisa el calendario con Descargas viejo^).
echo.
pause
exit /b 0
