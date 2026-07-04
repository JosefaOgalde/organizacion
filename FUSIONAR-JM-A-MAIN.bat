@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo.
echo  === Fusionar trabajo JM a main (para que no se pierda) ===
echo.
echo  ANTES: en el organizador pulsa "Respaldo" y guarda el JSON en Downloads.
echo.

git status
echo.
set /p OK="¿Ya guardaste respaldo y quieres subir la rama JM? (S/N): "
if /i not "%OK%"=="S" (
  echo Cancelado.
  pause
  exit /b 0
)

git checkout cursor/jm-trabajo-d6a1
git add -A
set /p MSG="Mensaje del commit (Enter = trabajo JM): "
if "%MSG%"=="" set MSG=trabajo JM: avance Fase 2 joyasmercury

git commit -m "%MSG%"
if errorlevel 1 echo Sin cambios nuevos o commit fallo — revisa arriba.

git push -u origin cursor/jm-trabajo-d6a1
if errorlevel 1 (
  echo Error en push
  pause
  exit /b 1
)

echo.
echo  === Siguiente paso en GitHub ===
echo  1. Abre el repo en GitHub
echo  2. Crea Pull Request: cursor/jm-trabajo-d6a1 -^> main
echo  3. Revisa y haz Merge
echo  4. En este PC: git checkout main ^&^& git pull origin main
echo.
pause
