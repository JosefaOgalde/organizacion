@echo off
chcp 65001 >nul
cd /d "%~dp0"
REM Alias: mismo flujo que EMPEZAR-AQUI (evitar bats duplicados)
call "%~dp0EMPEZAR-AQUI.bat"
exit /b %ERRORLEVEL%
