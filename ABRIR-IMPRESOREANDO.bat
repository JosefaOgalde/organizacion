@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo.
echo  === Abrir Impresoreando (PR #89) ===
echo  Landing + Catalogo + PDF
echo.

REM Si quedaste trabada en un merge de main (error de vim), lo cancelamos.
git merge --abort 2>nul

echo  Actualizando rama PR #89...
git fetch origin cursor/impresoreando-bob-productos-459d
git checkout cursor/impresoreando-bob-productos-459d 2>nul
if errorlevel 1 (
  git checkout -b cursor/impresoreando-bob-productos-459d origin/cursor/impresoreando-bob-productos-459d
)
git pull origin cursor/impresoreando-bob-productos-459d
if errorlevel 1 (
  echo.
  echo  AVISO: no se pudo actualizar. Sigue con lo que haya en disco.
  echo.
)

if not exist "index\clientes\impresoreando\catalogo\export\catalogo-impresoreando.pdf" (
  echo.
  echo  ERROR: no esta el PDF del catalogo en esta carpeta.
  echo  Rama incorrecta o falta git pull.
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

REM Abrir lo esencial para que se vea
start "" "http://localhost:3000/index/clientes/impresoreando/?v=imp-logo-oficial"
timeout /t 1 /nobreak >nul
start "" "http://localhost:3000/index/clientes/impresoreando/catalogo/"
timeout /t 1 /nobreak >nul
start "" "http://localhost:3000/index/clientes/impresoreando/catalogo/export/catalogo-impresoreando.pdf"

echo.
echo  === Si el navegador no abrio, pega estos links ===
echo  Landing:  http://localhost:3000/index/clientes/impresoreando/
echo  Catalogo: http://localhost:3000/index/clientes/impresoreando/catalogo/
echo  PDF:      http://localhost:3000/index/clientes/impresoreando/catalogo/export/catalogo-impresoreando.pdf
echo  PR #89:   https://github.com/JosefaOgalde/organizacion/pull/89
echo.
echo  Logo: Ctrl+F5 en la landing si se ve viejo.
echo.
pause
