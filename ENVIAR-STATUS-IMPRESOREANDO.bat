@echo off
setlocal
cd /d "%~dp0"

echo.
echo === Impresoreando · status diario ===
echo.

if not exist ".env" (
  echo Falta el archivo .env en la raiz del repo.
  echo Copia .env.example a .env y completa MAIL_USER / MAIL_PASS.
  echo.
  pause
  exit /b 1
)

where node >nul 2>&1
if errorlevel 1 (
  echo No se encontro node.exe en el PATH.
  pause
  exit /b 1
)

node scripts\impresoreando-status-diario.js %*
set ERR=%ERRORLEVEL%
echo.
if %ERR% neq 0 (
  echo Fallo el envio ^(codigo %ERR%^). Revisa .env o usa:
  echo   node scripts\impresoreando-status-diario.js --dry-run
  pause
  exit /b %ERR%
)

echo Listo. Correo enviado a Josefa y Nicolas.
echo Vista previa: data\impresoreando-status-ultimo.html
echo.
exit /b 0
