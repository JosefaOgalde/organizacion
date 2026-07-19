@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo.
echo  === Abrir MOVA etapa 2 (MKOF) — servidor + documentos ===
echo  Usa rama: main  (PRs #88 y #90 ya mergeados)
echo  NO confundir con PR #89 (Impresoreando)
echo.

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

REM Hub + catálogo de documentos + deck etapa 2
start "" "http://localhost:3000/index/clientes/MKOF/MOVA.html"
timeout /t 1 /nobreak >nul
start "" "http://localhost:3000/index/clientes/MKOF/MOVA/documentos/"
timeout /t 1 /nobreak >nul
start "" "http://localhost:3000/index/clientes/mkof/mova-etapa2-presentacion.html"
timeout /t 1 /nobreak >nul
start "" "http://localhost:3000/index/clientes/mkof/"

echo.
echo  === MOVA etapa 2 — enlaces ===
echo  Hub:          http://localhost:3000/index/clientes/MKOF/MOVA.html
echo  Documentos:   http://localhost:3000/index/clientes/MKOF/MOVA/documentos/
echo  Presentacion: http://localhost:3000/index/clientes/mkof/mova-etapa2-presentacion.html
echo  MKOF:         http://localhost:3000/index/clientes/mkof/
echo  D3:           http://localhost:3000/index/clientes/MKOF/MOVA/documentos/ver.html?id=d3-nucleo-mova-auth
echo  D4:           http://localhost:3000/index/clientes/MKOF/MOVA/documentos/ver.html?id=d4-login-cookie
echo  D5:           http://localhost:3000/index/clientes/MKOF/MOVA/documentos/ver.html?id=d5-validacion-modulos
echo  Cloudflare:   http://localhost:3000/index/clientes/mkof/cloudflare-mova.html
echo  cPanel:       http://localhost:3000/index/clientes/mkof/cpanel-espejo.html
echo  Organizador:  http://localhost:3000/index.html?disco=1
echo.
echo  Guia: docs\mova\VER-ETAPA2.md
echo  En Cursor: @mova + tu pregunta
echo.
pause
