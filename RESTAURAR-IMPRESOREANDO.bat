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
echo  Listo. Arranca con:
echo    git pull
echo    ABRIR-LARAVEL.bat
echo  Panel socios:
echo    http://127.0.0.1:8000/index/clientes/impresoreando/panel/
echo  Resumen:
echo    http://127.0.0.1:8000/index/clientes/impresoreando/panel/?tab=resumen
echo.
pause
