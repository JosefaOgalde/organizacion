@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo.
echo  Inyectar grilla Trendseeker septiembre 2026 (10 contenidos)
echo.
where node >nul 2>&1
if errorlevel 1 (
  echo  [ERROR] Node.js no encontrado. Instala Node o abre "Node.js command prompt".
  pause
  exit /b 1
)
node scripts\add-ts-contenidos-septiembre-2026.js
if errorlevel 1 (
  echo  [ERROR] Fallo el script.
  pause
  exit /b 1
)
echo.
echo  OK. Abrir Laravel si quieres ver el calendario.
pause
