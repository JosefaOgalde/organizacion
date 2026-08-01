@echo off
chcp 65001 >nul
cd /d "%~dp0"
title Forzar traer estrategia Redes

echo.
echo  === FORZAR archivos de Redes desde GitHub main ===
echo  Carpeta: %CD%
echo.
echo  Esto actualiza SOLO archivos de Impresoreando / servidor
echo  (no borra tu calendario ni impresoreando-live).
echo.

where git >nul 2>&1
if errorlevel 1 (
  echo [ERROR] Falta Git
  pause
  exit /b 1
)

echo [1] git fetch origin main...
git fetch origin main
if errorlevel 1 (
  echo [ERROR] fetch fallo
  pause
  exit /b 1
)

echo [2] checkout main...
git checkout main
if errorlevel 1 (
  echo [AVISO] checkout main fallo — sigo trayendo archivos igual
)

echo [3] Traer archivos clave desde origin/main...
git checkout origin/main -- ^
  "index/clientes/impresoreando/index.html" ^
  "index/clientes/impresoreando/panel/index.html" ^
  "index/clientes/impresoreando/panel/panel.js" ^
  "index/clientes/impresoreando/panel/panel.css" ^
  "index/clientes/impresoreando/panel/estrategia.html" ^
  "index/clientes/impresoreando/estrategia-redes.html" ^
  "index/clientes/impresoreando/redes/index.html" ^
  "index/assets/portal-cliente.js" ^
  "index/assets/portal.css" ^
  "scripts/servidor-unificado-8000.php" ^
  "scripts/lib/imp-estrategia-redes-page.php" ^
  "VER-REDES-IMP.bat" ^
  "00-LEEME-INICIO.txt"

if errorlevel 1 (
  echo [ERROR] No pude traer los archivos. Proba:
  echo   git checkout -- data\impresoreando-seed.json
  echo   DESBLOQUEAR-GIT.bat
  echo   y vuelve a correr este bat
  pause
  exit /b 1
)

echo [4] Verificar pestaña Redes en panel...
findstr /C:"Redes sociales" "index\clientes\impresoreando\panel\index.html" >nul
if errorlevel 1 (
  echo [ERROR] panel\index.html aun no tiene Redes sociales
  pause
  exit /b 1
)
echo  OK — panel tiene "Redes sociales"

echo [5] Verificar bloque en landing...
findstr /C:"estrategia-redes" "index\clientes\impresoreando\index.html" >nul
if errorlevel 1 (
  echo [AVISO] landing sin #estrategia-redes — igual abro estrategia del panel
) else (
  echo  OK — landing tiene #estrategia-redes
)

echo [6] Reiniciar servidor...
if exist "CERRAR-SERVIDOR.bat" call "%~dp0CERRAR-SERVIDOR.bat"
timeout /t 2 >nul
call "%~dp0ABRIR-LARAVEL.bat" sin-nav
timeout /t 3 >nul

echo [7] Abrir panel + estrategia...
powershell -NoProfile -Command "Start-Process 'http://127.0.0.1:8000/index/clientes/impresoreando/panel/?v=forzar-redes-1'"
powershell -NoProfile -Command "Start-Process 'http://127.0.0.1:8000/index/clientes/impresoreando/panel/estrategia.html?v=forzar-redes-1'"
powershell -NoProfile -Command "Start-Process 'http://127.0.0.1:8000/index/clientes/impresoreando/?v=forzar-redes-1#estrategia-redes'"

echo.
echo  En el PANEL debes ver la pestana verde "Redes sociales" al lado de Bitacora.
echo  Tambien se abre la pagina con franja verde ESTRATEGIA REDES.
echo  Usa Chrome/Edge si el preview de Cursor queda blanco.
echo.
pause
