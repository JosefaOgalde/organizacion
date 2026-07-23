@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo.
echo === Impresoreando · aplicar logo oficial (tal cual) ===
echo.
echo 1) Guardá el logo correcto aquí, con este nombre exacto:
echo    %~dp0entregado\logo-oficial.png
echo    (también sirve logo-oficial.jpg)
echo.
if not exist "entregado" mkdir "entregado"
if exist "entregado\logo-oficial.png" goto APPLY
if exist "entregado\logo-oficial.jpg" goto APPLY
if exist "entregado\logo-oficial.jpeg" goto APPLY
if exist "entregado\logo-oficial.webp" goto APPLY
echo Aún no está el archivo. Guardalo y volvé a ejecutar este .bat
echo.
explorer "entregado"
pause
exit /b 1

:APPLY
python "%~dp0aplicar-logo-oficial.py"
if errorlevel 1 (
  echo Falló.
  pause
  exit /b 1
)
echo.
echo Listo. Hard refresh del panel: Ctrl+F5
echo   http://127.0.0.1:8000/index/clientes/impresoreando/panel/
echo.
pause
