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
)

echo [2] Comprobar landing con estrategia...
findstr /C:"estrategia-redes" "index\clientes\impresoreando\index.html" >nul
if errorlevel 1 (
  echo [ERROR] La landing aun no tiene el bloque Estrategia redes.
  echo  Carpeta: %CD%
  pause
  exit /b 1
)
echo  OK — bloque #estrategia-redes en la landing

echo [3] Reiniciar :8000...
if exist "CERRAR-SERVIDOR.bat" call "%~dp0CERRAR-SERVIDOR.bat"
timeout /t 2 >nul
call "%~dp0ABRIR-LARAVEL.bat" sin-nav
timeout /t 3 >nul

echo [4] Abrir landing Impresoreando ^(con estrategia abajo^)...
powershell -NoProfile -Command "Start-Process 'http://127.0.0.1:8000/index/clientes/impresoreando/?v=20260801f#estrategia-redes'"

echo.
echo  Baja hasta la franja verde: ESTRATEGIA REDES · IMPRESOREANDO
echo  Si el preview de Cursor queda blanco, mira la ventana de Chrome/Edge.
echo.
pause
