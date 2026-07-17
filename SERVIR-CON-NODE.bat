@echo off
chcp 65001 >nul
cd /d "%~dp0"

call "%~dp0scripts\find-node.bat"
if errorlevel 1 (
  pause
  exit /b 1
)

echo.
echo  Usando Node: %NODE_EXE%
echo.

if not exist "data\impresoreando-live.json" (
  if exist "data\impresoreando-seed.json" (
    copy /Y "data\impresoreando-seed.json" "data\impresoreando-live.json" >nul
    echo  Creado data\impresoreando-live.json desde seed
  )
)

"%NODE_EXE%" scripts\sync-respaldo-auto.js
echo.
echo  Organizador:     http://127.0.0.1:3000/index.html
echo  Portal clientes: http://127.0.0.1:3000/index/clientes/
echo  Impresoreando:   http://127.0.0.1:3000/index/clientes/impresoreando/panel/
echo  API Impresoreando: http://127.0.0.1:3000/api/impresoreando
echo.
"%NODE_EXE%" scripts\organizacion-server.js
pause
