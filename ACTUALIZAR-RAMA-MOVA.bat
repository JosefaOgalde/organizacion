@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo.
echo  === Traer ultimos cambios de main a la rama MOVA ===
echo.

git fetch origin
if errorlevel 1 (
  echo Error en git fetch
  pause
  exit /b 1
)

git rev-parse --verify cursor/mova-trabajo-d6a1 >nul 2>&1
if errorlevel 1 (
  git checkout -b cursor/mova-trabajo-d6a1 origin/cursor/mova-trabajo-d6a1 2>nul
  if errorlevel 1 git checkout -b cursor/mova-trabajo-d6a1
) else (
  git checkout cursor/mova-trabajo-d6a1
)

git merge origin/main --no-edit
if errorlevel 1 (
  echo.
  echo  HAY CONFLICTOS. Resuelvelos, luego:
  echo    git add .
  echo    git commit -m "merge main en rama MOVA"
  echo    git push origin cursor/mova-trabajo-d6a1
  pause
  exit /b 1
)

git push origin cursor/mova-trabajo-d6a1
echo.
echo  Rama MOVA actualizada con main. Ejecuta ABRIR-MOVA.bat
echo.
pause
