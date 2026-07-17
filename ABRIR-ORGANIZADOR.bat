@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo.
echo  Flujo oficial = Laravel + SQLite ^(sin Laragon^).
echo  Redirigiendo a ABRIR-LARAVEL.bat ...
echo.
call "%~dp0ABRIR-LARAVEL.bat"
