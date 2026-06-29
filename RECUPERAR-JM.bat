@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo.
echo  === Recuperar Joyas Mercury (forzar codigo de GitHub) ===
echo.

where git >nul 2>&1
if errorlevel 1 (
  echo Git no esta en el PATH.
  pause
  exit /b 1
)

echo Guardando copia en stash por si acaso...
git stash push -u -m "backup RECUPERAR-JM" 2>nul

echo Descargando ultima version...
git fetch origin
if errorlevel 1 (
  echo Error en git fetch. Revisa internet.
  pause
  exit /b 1
)

echo Cambiando a main y descartando cambios locales...
git checkout -f main
git reset --hard origin/main

echo.
echo  === LISTO ===
echo  1. Ejecuta SERVIR.bat
echo  2. Abre: http://localhost:3000/index/clientes/joyasmercury/index.html?v=secciones3
echo  3. Recarga con Ctrl+Shift+R
echo.
pause
