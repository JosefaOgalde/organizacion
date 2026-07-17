@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo.
echo  ABRIR-ORGANIZADOR ahora usa el flujo unificado Laravel/PHP.
echo  Redirigiendo a ABRIR-LARAVEL.bat ...
echo.
call "%~dp0ABRIR-LARAVEL.bat"
