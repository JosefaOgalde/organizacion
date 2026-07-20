@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo.
echo  SERVIR-CON-NODE.bat quedo unificado en ABRIR-LARAVEL.bat.
echo  Incluye: seed Impresoreando, sync, panel e API Impresoreando en :8000.
echo  Redirigiendo a Laravel :8000...
echo.
call "%~dp0ABRIR-LARAVEL.bat"
