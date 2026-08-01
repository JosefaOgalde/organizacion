@echo off
chcp 65001 >nul
cd /d "%~dp0"
title Ver estrategia Redes Impresoreando

echo.
echo  === Estrategia Redes Impresoreando ===
echo  Carpeta: %CD%
echo.

where git >nul 2>&1
if not errorlevel 1 (
  echo [1] git pull origin main...
  git checkout main
  git pull origin main
  if errorlevel 1 (
    echo.
    echo  Si fallo por seed:
    echo    git checkout -- data\impresoreando-seed.json
    echo    DESBLOQUEAR-GIT.bat
    echo    git pull origin main
    echo.
    pause
    exit /b 1
  )
) else (
  echo [1] Git no esta en PATH — sigo
)

echo [2] Comprobar servidor unificado...
if not exist "scripts\servidor-unificado-8000.php" (
  echo [ERROR] Falta scripts\servidor-unificado-8000.php
  pause
  exit /b 1
)
findstr /C:"imp-estrategia-redes-page" "scripts\servidor-unificado-8000.php" >nul
if errorlevel 1 (
  echo [ERROR] Tu pull no trajo el fallback de redes.
  echo  Carpeta actual: %CD%
  pause
  exit /b 1
)
echo  OK — servidor tiene la campana embebida

echo [3] Cerrar :8000 y volver a abrir...
if exist "CERRAR-SERVIDOR.bat" call "%~dp0CERRAR-SERVIDOR.bat"
timeout /t 2 >nul
call "%~dp0ABRIR-LARAVEL.bat" sin-nav
timeout /t 3 >nul

echo [4] Abrir en el navegador del sistema (no solo preview Cursor)...
powershell -NoProfile -Command "Start-Process 'http://127.0.0.1:8000/index/clientes/impresoreando/panel/estrategia.html?v=20260801e'"
powershell -NoProfile -Command "Start-Process 'http://127.0.0.1:8000/index/clientes/impresoreando/estrategia-redes.html?v=20260801e'"

echo.
echo  Debes ver franja verde: ESTRATEGIA REDES · IMPRESOREANDO
echo  Si el preview de Cursor sigue blanco, usa la ventana de Chrome/Edge que se abrio.
echo.
pause
