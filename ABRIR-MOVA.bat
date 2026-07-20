@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo.
echo  ABRIR-MOVA.bat quedo unificado en ABRIR-LARAVEL.bat.
echo  Incluye: cerrar servidor viejo, sync, MKOF + MOVA + ECR en :8000.
echo  Redirigiendo...
echo.
call "%~dp0ABRIR-LARAVEL.bat"
