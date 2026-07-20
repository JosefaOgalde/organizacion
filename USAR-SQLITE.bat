@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo.
echo  USAR-SQLITE.bat quedo unificado dentro de ABRIR-LARAVEL.bat
echo  ^(SQLite + migrate + seed + servidor :8000^).
echo  Redirigiendo...
echo.
call "%~dp0ABRIR-LARAVEL.bat"
