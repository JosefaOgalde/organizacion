@echo off
setlocal
cd /d "%~dp0"

echo === Organizacion: rutina sin Agent ===
echo.

where git >nul 2>&1
if %ERRORLEVEL%==0 (
  echo [1/3] git pull...
  git pull --ff-only
) else (
  echo [1/3] git no disponible, salto pull
)

echo.
echo [2/3] Abriendo Laravel / organizador...
if exist "ABRIR-LARAVEL.bat" (
  call "ABRIR-LARAVEL.bat"
) else (
  echo Falta ABRIR-LARAVEL.bat
)

echo.
echo [3/3] Consultas locales (sin tokens):
echo   node scripts\consulta-organizacion.js resumen
echo   node scripts\consulta-organizacion.js cliente ecr
echo   node scripts\consulta-organizacion.js buscar "texto"
echo.
echo Tip Cursor: modelo Auto Cost o Composer 2.5 (sin Fast). Chat nuevo y pedido corto.
echo.
pause
