@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo.
echo  Este bat ahora solo sincroniza Impresoreando → organizador
echo  (ya no reescribe TS/ECR/JM).
echo.
call "%~dp0SYNC-IMPRESOREANDO-ORGANIZADOR.bat"
