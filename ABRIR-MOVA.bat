@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo.
echo  === Abrir MOVA / MKOF / ECR via Laravel :8000 ===
echo  ^(ABRIR-MOVA.bat ahora usa el mismo stack que ABRIR-LARAVEL.bat^)
echo.
call "%~dp0ABRIR-LARAVEL.bat"
