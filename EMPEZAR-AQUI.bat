@echo off
chcp 65001 >nul
cd /d "%~dp0"
title Organizacion · Empezar aqui

echo.
echo  ========================================
echo   ORGANIZACION · EMPEZAR AQUI
echo  ========================================
echo.
echo  Este es el unico boton del dia a dia:
echo  trae main + restaura calendario + abre Laravel.
echo.
echo  Tip: corre una vez CREAR-ACCESOS-ESCRITORIO.bat
echo  para tener iconos en el Escritorio.
echo.

call "%~dp0TRAER-CAMBIOS.bat"
exit /b %ERRORLEVEL%
