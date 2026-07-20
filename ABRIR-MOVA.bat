@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo.
echo  === Abrir MOVA / MKOF / ECR via Laravel :8000 ===
echo.
call "%~dp0ABRIR-LARAVEL.bat"
REM ABRIR-LARAVEL ya abre portal + ECR; abrimos MOVA al volver
start "" "http://127.0.0.1:8000/index/clientes/mkof/"
start "" "http://127.0.0.1:8000/index/clientes/MKOF/MOVA"
start "" "http://127.0.0.1:8000/index/clientes/mkof/repos-externos.html"
