@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo.
echo  Recuperar landing Joyas Mercury (descarta cambios locales en index.html)
echo.

git stash push -u -m "backup antes de recuperar JM" 2>nul
git checkout main
if errorlevel 1 (
  echo Error al cambiar a main. Revisa git status.
  pause
  exit /b 1
)

git checkout -- index/clientes/joyasmercury/index.html 2>nul
git checkout -- index/clientes/JoyasMercury/index.html 2>nul
git pull origin main
if errorlevel 1 (
  echo.
  echo  Si sigue fallando, ejecuta: git reset --hard origin/main
  pause
  exit /b 1
)

echo.
echo  Listo. Ejecuta SERVIR.bat y abre:
echo  http://localhost:3000/index/clientes/joyasmercury/index.html?v=secciones3
echo  Recarga con Ctrl+Shift+R
echo.
pause
