@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo.
echo  SERVIR-CON-NODE.bat ya no es el flujo oficial.
echo  Redirigiendo a ABRIR-LARAVEL.bat ^(Laravel :8000^)...
echo.
call "%~dp0ABRIR-LARAVEL.bat"
