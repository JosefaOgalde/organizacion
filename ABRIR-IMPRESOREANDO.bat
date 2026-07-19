@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo.
echo  === Abrir Impresoreando — solo landing del cliente ===
echo  Rama: cursor/impresoreando-bob-productos-459d
echo.

echo  Actualizando rama...
git fetch origin cursor/impresoreando-bob-productos-459d 2>nul
git checkout cursor/impresoreando-bob-productos-459d 2>nul
if errorlevel 1 (
  git checkout -b cursor/impresoreando-bob-productos-459d origin/cursor/impresoreando-bob-productos-459d
)
git pull origin cursor/impresoreando-bob-productos-459d
if errorlevel 1 (
  echo.
  echo  AVISO: no se pudo actualizar la rama. Sigue con lo que haya en disco.
  echo.
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

REM Solo la landing del cliente (panel/catalogo se abren desde ahi).
start "" "http://localhost:3000/index/clientes/impresoreando/?v=imp-logo-oficial"

echo.
echo  LANDING: http://localhost:3000/index/clientes/impresoreando/
echo.
echo  Desde la landing:
echo    Resumen 50/50  -^> panel/
echo    Calculadora    -^> panel/?tab=costos
echo    Catalogo IG    -^> catalogo/
echo.
echo  Si no ves el logo nuevo: Ctrl+F5 (hard refresh).
echo.
pause
