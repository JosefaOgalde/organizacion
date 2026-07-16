@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo.
echo  === Restaurar cliente Impresoreando (sin borrar tareas) ===
echo.

set PATH=C:\laragon\bin\nodejs\node-v22;%PATH%

if not exist "data\organizacion-live.json" (
  echo  No hay data\organizacion-live.json
  echo  Importa primero un respaldo con IMPORTAR-RESPALDO.bat
  echo.
  pause
  exit /b 1
)

node scripts\asegurar-impresoreando-live.js
if errorlevel 1 (
  echo.
  echo  Error al restaurar Impresoreando.
  pause
  exit /b 1
)

echo.
echo  Listo. Abre el organizador con disco:
echo    ABRIR-ORGANIZADOR.bat
echo  Panel socios:
echo    http://localhost:3000/index/clientes/impresoreando/panel/
echo.
pause
