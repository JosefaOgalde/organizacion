@echo off
chcp 65001 >nul
cd /d "%~dp0"
set PATH=C:\laragon\bin\nodejs\node-v22;%PATH%
echo.
echo  === ECR: renombrar madres TI + Equipos en terreno ===
echo.
node scripts\renombrar-ecr-madres-articulos.js
if errorlevel 1 (
  echo Error.
  pause
  exit /b 1
)
echo.
echo  Abre Semana o Dia: http://localhost:3000/index.html?disco=1
echo.
pause
