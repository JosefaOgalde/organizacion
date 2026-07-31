@echo off
chcp 65001 >nul
cd /d "%~dp0"
title Desbloquear git ^(seed / respaldos locales^)

echo.
echo  ========================================
echo   DESBLOQUEAR GIT
echo  ========================================
echo.
echo  Descarta cambios locales que bloquean
echo  el pull ^(seed Impresoreando + JSON de
echo  respaldo que ABRIR modifica al abrir^).
echo.
echo  NO toca: organizacion-live.json
echo           impresoreando-live.json
echo.

git checkout -- data/impresoreando-seed.json 2>nul
git checkout -- data/organizacion-respaldo-2026-07-21.json 2>nul
git checkout -- data/organizacion-respaldo-2026-07-24.json 2>nul
git checkout -- data/organizacion-respaldo-2026-07-28.json 2>nul
git checkout -- data/organizacion-respaldo-2026-07-29.json 2>nul
git checkout -- data/organizacion-respaldo-2026-07-31.json 2>nul

echo  [1] Cambios locales en data\ descartados ^(si habia^)
echo  [2] git fetch + checkout main + pull...
git fetch origin
git checkout main
if errorlevel 1 (
  echo  [ERROR] No se pudo cambiar a main.
  pause
  exit /b 1
)
git pull origin main
if errorlevel 1 (
  echo  [AVISO] Pull con problemas. Si sigue el seed:
  echo    git checkout -- data\impresoreando-seed.json
  echo    git pull origin main
  pause
  exit /b 1
)

echo.
echo  Listo. Siguiente:
echo    ABRIR-LARAVEL.bat restaurar
echo  ^(o EMPEZAR-AQUI.bat si ya esta en esta entrega^)
echo.
pause
