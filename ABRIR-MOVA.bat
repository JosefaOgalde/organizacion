@echo off
chcp 65001 >nul
cd /d "%~dp0"
set "GIT_EDITOR=true"
echo.
echo  === Abrir MOVA etapa 2 (MKOF) ===
echo  Documentos D1-D5 + deck + Cloudflare + cPanel + AUDIO
echo  (Esto NO es Impresoreando / PR #89)
echo.

REM Si quedaste trabada en merge de main (error vim), cancelarlo.
git merge --abort 2>nul

REM ¿Ya tenemos los archivos MOVA en esta carpeta?
set "MOVA_OK=0"
if exist "index\clientes\mkof\mova-etapa2-presentacion.html" set "MOVA_OK=1"
if exist "index\clientes\MKOF\MOVA.html" set "MOVA_OK=1"

if "%MOVA_OK%"=="1" (
  echo  Archivos MOVA encontrados. No toco git ^(evita el main divergido^).
  git branch --show-current 2>nul
  goto :servidor
)

echo  Faltan archivos MOVA. Intentando traer origin/main limpio...
git fetch origin main
if errorlevel 1 (
  echo  ERROR: no pude hacer fetch de origin/main
  pause
  exit /b 1
)

REM Evitar pull que abre vim / merge a medias: reset duro a remoto.
git checkout -B main origin/main
if errorlevel 1 (
  echo.
  echo  No se pudo alinear main. Prueba a mano:
  echo    git merge --abort
  echo    set GIT_EDITOR=true
  echo    git fetch origin cursor/mova-ver-ahora-459d
  echo    git checkout cursor/mova-ver-ahora-459d
  echo.
  pause
  exit /b 1
)

if not exist "index\clientes\mkof\mova-etapa2-presentacion.html" (
  echo.
  echo  ERROR: aun no esta el deck MOVA en el disco.
  echo  Prueba: git checkout cursor/mova-ver-ahora-459d
  echo.
  pause
  exit /b 1
)

:servidor
if exist "%~dp0CERRAR-SERVIDOR.bat" (
  call "%~dp0CERRAR-SERVIDOR.bat"
) else (
  echo  ^(CERRAR-SERVIDOR.bat no esta; sigo^)
)

if exist "scripts\sync-respaldo-auto.js" (
  node scripts\sync-respaldo-auto.js --force
  if errorlevel 1 (
    echo  AVISO: sync-respaldo fallo. Sigo igual.
  )
)

echo.
echo  Iniciando servidor en :3000...
REM /D evita el error "no puede encontrar la ruta" cuando la carpeta tiene espacios
start "Organizacion servidor" /D "%~dp0" cmd /k "node scripts\organizacion-server.js"

echo  Esperando servidor...
node scripts\wait-organizacion-server.js
if errorlevel 1 (
  echo.
  echo  El servidor Node no respondio. Abro el AUDIO local ^(sin servidor^)...
  if exist "index\clientes\mkof\audio\mova-etapa2-charla.mp3" (
    start "" "%~dp0index\clientes\mkof\audio\mova-etapa2-charla.mp3"
  )
  if exist "index\clientes\mkof\audio\index.html" (
    start "" "%~dp0index\clientes\mkof\audio\index.html"
  )
  echo.
  echo  Tambien podes usar Laravel:
  echo    ABRIR-LARAVEL.bat
  echo    luego: http://127.0.0.1:8000/index/clientes/mkof/audio/
  echo.
  echo  Links por si el servidor arranca despues:
  goto :links
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

:links
echo.
echo  === MOVA etapa 2 — pega si el navegador no abrio ===
echo  Hub:          http://localhost:3000/index/clientes/MKOF/MOVA.html
echo  Documentos:   http://localhost:3000/index/clientes/MKOF/MOVA/documentos/
echo  Presentacion: http://localhost:3000/index/clientes/mkof/mova-etapa2-presentacion.html
echo  AUDIO charla: http://localhost:3000/index/clientes/mkof/audio/
echo  MP3:          http://localhost:3000/index/clientes/mkof/audio/mova-etapa2-charla.mp3
echo  MP3 local:    %~dp0index\clientes\mkof\audio\mova-etapa2-charla.mp3
echo  D3:           http://localhost:3000/index/clientes/MKOF/MOVA/documentos/ver.html?id=d3-nucleo-mova-auth
echo  D4:           http://localhost:3000/index/clientes/MKOF/MOVA/documentos/ver.html?id=d4-login-cookie
echo  D5:           http://localhost:3000/index/clientes/MKOF/MOVA/documentos/ver.html?id=d5-validacion-modulos
echo  Cloudflare:   http://localhost:3000/index/clientes/mkof/cloudflare-mova.html
echo  cPanel:       http://localhost:3000/index/clientes/mkof/cpanel-espejo.html
echo  Landing MKOF: http://localhost:3000/index/clientes/mkof/
echo.
echo  Laravel ^(alternativa^): http://127.0.0.1:8000/index/clientes/mkof/audio/
echo  PR #89 = Impresoreando. MOVA audio = esta rama / main actualizado.
echo.
pause
