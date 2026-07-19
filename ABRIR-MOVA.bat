@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo.
echo  === Abrir MOVA etapa 2 (MKOF) ===
echo  Documentos D1-D5 + deck + Cloudflare + cPanel
echo  (Esto NO es Impresoreando / PR #89)
echo.

REM Si quedaste trabada en merge de main (error vim), cancelarlo.
git merge --abort 2>nul

echo  Pasando a main (ahi esta MOVA etapa 2)...
git fetch origin main
git checkout main 2>nul
if errorlevel 1 (
  echo  No se pudo checkout main. Intenta: git merge --abort
  pause
  exit /b 1
)
git pull origin main
if errorlevel 1 (
  echo.
  echo  AVISO: pull con problemas. Si pide editor, usa:
  echo    set GIT_EDITOR=true
  echo    git pull origin main --no-edit
  echo.
)

if not exist "index\clientes\mkof\mova-etapa2-presentacion.html" (
  echo.
  echo  ERROR: no esta el deck MOVA. Falta actualizar main.
  echo.
  pause
  exit /b 1
)

call "%~dp0CERRAR-SERVIDOR.bat"

node scripts/sync-respaldo-auto.js --force
if errorlevel 1 (
  echo Error en sync-respaldo-auto.js
  pause
  exit /b 1
)

echo.
echo  Iniciando servidor...
start "Organizacion servidor" cmd /k "cd /d "%~dp0" && node scripts/organizacion-server.js"

echo  Esperando servidor...
node scripts/wait-organizacion-server.js
if errorlevel 1 (
  echo.
  echo  El servidor tardo demasiado. Revisa la ventana "Organizacion servidor".
  pause
  exit /b 1
)

REM Abrir lo esencial de etapa 2
start "" "http://localhost:3000/index/clientes/MKOF/MOVA.html"
timeout /t 1 /nobreak >nul
start "" "http://localhost:3000/index/clientes/MKOF/MOVA/documentos/"
timeout /t 1 /nobreak >nul
start "" "http://localhost:3000/index/clientes/mkof/mova-etapa2-presentacion.html"
timeout /t 1 /nobreak >nul
start "" "http://localhost:3000/index/clientes/mkof/audio/"
timeout /t 1 /nobreak >nul
start "" "http://localhost:3000/index/clientes/mkof/"

echo.
echo  === MOVA etapa 2 — pega si el navegador no abrio ===
echo  Hub:          http://localhost:3000/index/clientes/MKOF/MOVA.html
echo  Documentos:   http://localhost:3000/index/clientes/MKOF/MOVA/documentos/
echo  Presentacion: http://localhost:3000/index/clientes/mkof/mova-etapa2-presentacion.html
echo  AUDIO charla: http://localhost:3000/index/clientes/mkof/audio/
echo  MP3:          http://localhost:3000/index/clientes/mkof/audio/mova-etapa2-charla.mp3
echo  D3:           http://localhost:3000/index/clientes/MKOF/MOVA/documentos/ver.html?id=d3-nucleo-mova-auth
echo  D4:           http://localhost:3000/index/clientes/MKOF/MOVA/documentos/ver.html?id=d4-login-cookie
echo  D5:           http://localhost:3000/index/clientes/MKOF/MOVA/documentos/ver.html?id=d5-validacion-modulos
echo  Cloudflare:   http://localhost:3000/index/clientes/mkof/cloudflare-mova.html
echo  cPanel:       http://localhost:3000/index/clientes/mkof/cpanel-espejo.html
echo  Landing MKOF: http://localhost:3000/index/clientes/mkof/
echo.
echo  PR #89 = Impresoreando. MOVA = main (PRs #88 y #90).
echo.
pause
