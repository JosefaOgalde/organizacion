@echo off
chcp 65001 >nul
cd /d "%~dp0"
title Desbloquear git + traer Redes

echo.
echo  === 1^) Quitar bloqueo del pull ===
echo  ^(solo seed + respaldo 31-jul; NO toca live^)
echo.

git checkout -- data/impresoreando-seed.json 2>nul
git checkout -- data/organizacion-respaldo-2026-07-31.json 2>nul

echo  === 2^) git pull origin main ===
git fetch origin
git checkout main
git pull origin main
if errorlevel 1 (
  echo.
  echo  [ERROR] Pull fallo. Pegá esto en la consola:
  echo    git checkout -- data\impresoreando-seed.json
  echo    git checkout -- data\organizacion-respaldo-2026-07-31.json
  echo    git pull origin main
  echo.
  pause
  exit /b 1
)

echo.
echo  === 3^) Abrir estrategia Redes ===
if exist "FORZAR-TRAER-REDES.bat" (
  call "%~dp0FORZAR-TRAER-REDES.bat"
  exit /b %ERRORLEVEL%
)

if exist "VER-REDES-IMP.bat" (
  call "%~dp0VER-REDES-IMP.bat"
  exit /b %ERRORLEVEL%
)

if exist "CERRAR-SERVIDOR.bat" call "%~dp0CERRAR-SERVIDOR.bat"
timeout /t 1 >nul
call "%~dp0ABRIR-LARAVEL.bat" sin-nav
timeout /t 2 >nul
powershell -NoProfile -Command "Start-Process 'http://127.0.0.1:8000/index/clientes/impresoreando/panel/?v=desbloq-1'"
powershell -NoProfile -Command "Start-Process 'http://127.0.0.1:8000/index/clientes/impresoreando/?v=desbloq-1#estrategia-redes'"
echo.
echo  Listo. Ctrl+Shift+R en el navegador.
pause
