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
  git checkout main >nul 2>&1
  git pull origin main
  if errorlevel 1 (
    echo.
    echo  Si fallo por seed:
    echo    git checkout -- data\impresoreando-seed.json
    echo    git pull origin main
    echo.
    pause
    exit /b 1
  )
) else (
  echo [1] Git no esta en PATH — sigo igual
)

echo [2] Comprobar pagina redes...
if not exist "index\clientes\impresoreando\redes\index.html" (
  echo [ERROR] Falta index\clientes\impresoreando\redes\index.html
  echo  Esta carpeta no tiene la version nueva. Corre git pull en:
  echo  C:\Users\Josefa Ogalde\organizacion
  pause
  exit /b 1
)
echo  OK — existe la pagina de estrategia

echo [3] Arrancar servidor :8000...
if exist "ABRIR-LARAVEL.bat" (
  call "%~dp0ABRIR-LARAVEL.bat" sin-nav
) else (
  echo [AVISO] No hay ABRIR-LARAVEL.bat
)

timeout /t 2 >nul

echo [4] Abrir estrategia en el navegador...
REM Pagina dedicada (siempre visible) + pestaña del panel
powershell -NoProfile -Command "Start-Process 'http://127.0.0.1:8000/index/clientes/impresoreando/redes/?v=20260801c'"
powershell -NoProfile -Command "Start-Process 'http://127.0.0.1:8000/index/clientes/impresoreando/panel/?tab=redes&v=20260801c'"

echo.
echo  Debes ver la campana de Instagram @impresoreando.
echo  Si sale viejo: Ctrl+Shift+R
echo.
pause
