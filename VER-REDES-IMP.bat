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

set "PAGE=index\clientes\impresoreando\estrategia-redes.html"
echo [2] Comprobar archivo...
if not exist "%PAGE%" (
  echo [ERROR] No existe %PAGE%
  echo  Esta carpeta NO tiene la version nueva.
  echo  Debe ser: C:\Users\Josefa Ogalde\organizacion
  pause
  exit /b 1
)
for %%A in ("%PAGE%") do echo  OK — %%~zA bytes · %PAGE%
findstr /C:"@impresoreando" "%PAGE%" >nul
if errorlevel 1 (
  echo [ERROR] El HTML existe pero esta vacio o viejo.
  pause
  exit /b 1
)

echo [3] Reiniciar servidor :8000...
if exist "CERRAR-SERVIDOR.bat" call "%~dp0CERRAR-SERVIDOR.bat"
timeout /t 1 >nul
if exist "ABRIR-LARAVEL.bat" (
  call "%~dp0ABRIR-LARAVEL.bat" sin-nav
) else (
  echo [AVISO] No hay ABRIR-LARAVEL.bat
)

timeout /t 2 >nul

echo [4] Abrir pagina...
powershell -NoProfile -Command "Start-Process 'http://127.0.0.1:8000/index/clientes/impresoreando/estrategia-redes.html?v=20260801d'"

echo.
echo  Debes ver franja verde: ESTRATEGIA REDES · IMPRESOREANDO
echo  Si sigue blanco: Ctrl+Shift+R o abre en Chrome/Edge (no solo el preview de Cursor)
echo.
pause
