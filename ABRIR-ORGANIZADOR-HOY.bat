@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo.
echo  === Organizador — inicio del dia ===
echo.

git fetch origin 2>nul
git checkout main 2>nul
git pull origin main --no-rebase 2>nul

echo  Sincronizando respaldo mas reciente ^(Descargas / data^)...
node scripts/sync-respaldo-auto.js --force
if errorlevel 1 (
  echo.
  echo  Sin respaldo en disco. Si tienes JSON en Descargas:
  echo    IMPORTAR-RESPALDO.bat
  echo.
)

call "%~dp0ABRIR-ORGANIZADOR.bat"
