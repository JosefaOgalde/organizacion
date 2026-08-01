@echo off
chcp 65001 >nul
cd /d "%~dp0"
title Sincronizar main con GitHub

echo.
echo  ========================================
echo   SINCRONIZAR MAIN = GitHub
echo  ========================================
echo.
echo  Tu main local se desvio. Esto pone el
echo  codigo IGUAL que GitHub ^(origin/main^).
echo.
echo  NO borra:
echo    data\organizacion-live.json
echo    data\impresoreando-live.json
echo.
echo  SI descarta commits locales del codigo.
echo.
pause

where git >nul 2>&1
if errorlevel 1 (
  echo [ERROR] Falta Git
  pause
  exit /b 1
)

echo [1] Desbloquear seed/respaldo...
git checkout -- data/impresoreando-seed.json 2>nul
git checkout -- data/organizacion-respaldo-2026-07-31.json 2>nul

echo [2] git fetch origin main...
git fetch origin main
if errorlevel 1 (
  echo [ERROR] fetch fallo
  pause
  exit /b 1
)

echo [3] git checkout main...
git checkout main
if errorlevel 1 (
  echo [ERROR] no pude ir a main
  pause
  exit /b 1
)

echo [4] git reset --hard origin/main...
git reset --hard origin/main
if errorlevel 1 (
  echo [ERROR] reset fallo
  pause
  exit /b 1
)

echo [5] Estado:
git status -sb
git log -1 --oneline

echo.
echo  Listo. Codigo = GitHub main.
echo  Siguiente: abrir estrategia...
timeout /t 2 >nul

if exist "CERRAR-SERVIDOR.bat" call "%~dp0CERRAR-SERVIDOR.bat"
timeout /t 2 >nul
call "%~dp0ABRIR-LARAVEL.bat" sin-nav
timeout /t 3 >nul

powershell -NoProfile -Command "Start-Process 'http://127.0.0.1:8000/index/clientes/impresoreando/panel/?v=sync-main-1'"
powershell -NoProfile -Command "Start-Process 'http://127.0.0.1:8000/index/clientes/impresoreando/panel/estrategia.html?v=sync-main-1'"
powershell -NoProfile -Command "Start-Process 'http://127.0.0.1:8000/index/clientes/impresoreando/?v=sync-main-1#estrategia-redes'"

echo.
echo  Debes ver pestana "Redes sociales" al lado de Bitacora
echo  y/o franja verde ESTRATEGIA REDES.
echo  Ctrl+Shift+R si hace falta.
echo.
pause
