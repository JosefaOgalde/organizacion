@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo.
echo  SERVIR.bat ^(antes Node :3000^) quedo unificado en ABRIR-LARAVEL.bat.
echo  Incluye: sync respaldo, .env, portal, ventas tip ^(ABRIR-VENTA-PUBLICA^).
echo  Redirigiendo a Laravel :8000...
echo.
call "%~dp0ABRIR-LARAVEL.bat"
