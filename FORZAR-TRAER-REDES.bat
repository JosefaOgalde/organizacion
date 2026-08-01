@echo off
chcp 65001 >nul
cd /d "%~dp0"

REM Evitar "No se ha encontrado el archivo por lotes" si git reescribe este .bat
if /I not "%~1"=="__FROMTEMP__" (
  copy /Y "%~f0" "%TEMP%\FORZAR-TRAER-REDES-RUN.bat" >nul
  call "%TEMP%\FORZAR-TRAER-REDES-RUN.bat" __FROMTEMP__ "%~dp0"
  exit /b %ERRORLEVEL%
)

set "ROOT=%~2"
if "%ROOT%"=="" set "ROOT=%~dp0"
cd /d "%ROOT%"
title Forzar traer estrategia Redes

echo.
echo  === FORZAR Redes ^(corre desde TEMP, seguro^) ===
echo  Carpeta: %CD%
echo.

where git >nul 2>&1
if errorlevel 1 (
  echo [ERROR] Falta Git
  pause
  exit /b 1
)

echo [0] Desbloquear seed/respaldo...
git checkout -- data/impresoreando-seed.json 2>nul
git checkout -- data/organizacion-respaldo-2026-07-31.json 2>nul

echo [1] fetch origin main...
git fetch origin main
if errorlevel 1 (
  echo [ERROR] fetch fallo
  pause
  exit /b 1
)

echo [2] checkout main + reset a origin/main...
git checkout main
git reset --hard origin/main
if errorlevel 1 (
  echo [ERROR] No pude igualar origin/main
  echo  Proba: SINCRONIZAR-MAIN.bat
  pause
  exit /b 1
)
git status -sb
git log -1 --oneline

echo [3] Verificar panel tiene Redes...
findstr /C:"Redes sociales" "index\clientes\impresoreando\panel\index.html" >nul
if errorlevel 1 (
  echo [ERROR] Aun no aparece Redes sociales en panel\index.html
  pause
  exit /b 1
)
echo  OK

echo [4] Reiniciar :8000...
if exist "CERRAR-SERVIDOR.bat" call "%ROOT%CERRAR-SERVIDOR.bat"
timeout /t 2 >nul
call "%ROOT%ABRIR-LARAVEL.bat" sin-nav
timeout /t 3 >nul

echo [5] Abrir...
powershell -NoProfile -Command "Start-Process 'http://127.0.0.1:8000/index/clientes/impresoreando/panel/?v=forzar-redes-2'"
powershell -NoProfile -Command "Start-Process 'http://127.0.0.1:8000/index/clientes/impresoreando/panel/estrategia.html?v=forzar-redes-2'"
powershell -NoProfile -Command "Start-Process 'http://127.0.0.1:8000/index/clientes/impresoreando/?v=forzar-redes-2#estrategia-redes'"

echo.
echo  Pestana "Redes sociales" al lado de Bitacora + franja verde.
echo  Si Cursor preview blanco → usa Chrome/Edge.
echo.
pause
