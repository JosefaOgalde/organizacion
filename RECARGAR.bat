@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo.
echo  === Recargar organizador ^(disco=1^) ===
echo  No reinicia el servidor ni abre todas las pestanas.
echo.

REM Si :8000 no esta activo, avisar
netstat -ano 2>nul | findstr ":8000" | findstr "LISTENING" >nul
if errorlevel 1 (
  echo  [!] Laravel no esta corriendo en :8000
  echo  Primero: ABRIR-LARAVEL.bat
  echo.
  pause
  exit /b 1
)

echo  Recargando http://127.0.0.1:8000/index.html?disco=1
powershell -NoProfile -Command "Start-Process 'http://127.0.0.1:8000/index.html?disco=1'"
echo  Listo. Si la pestana ya estaba abierta, usa F5 o esta pestana nueva.
echo.
