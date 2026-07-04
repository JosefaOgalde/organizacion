@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo.
echo  === Configurar clave de acceso (Organizacion) ===
echo.
echo  Genera ORGANIZACION_ACCESS_KEY en .env (no se sube a Git).
echo  Anota la clave en un gestor de contraseñas o bloc de notas seguro.
echo.

node scripts/generar-clave-organizacion.js --mostrar
if errorlevel 1 (
  echo Error al generar clave.
  pause
  exit /b 1
)

echo.
echo  Siguiente paso: reinicia el servidor y abre http://localhost:3000
echo  Te pedira la clave en login.html
echo.
pause
