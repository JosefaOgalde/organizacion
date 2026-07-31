@echo off
chcp 65001 >nul
cd /d "%~dp0"
title Archivar Joyas Mercury ^(copia local^)

echo.
echo  ========================================
echo   ARCHIVAR JOYAS MERCURY
echo  ========================================
echo.
echo  Copia la version mas actual a tu usuario
echo  Windows ^(NO sube nada a GitHub^):
echo.
echo  %%USERPROFILE%%\joyasmercury-archivo-organizacion\
echo.
echo  Si la carpeta del repo ya esta vacia,
echo  restaura desde el tag git y luego archiva.
echo.

where node >nul 2>&1
if errorlevel 1 (
  echo [ERROR] Se necesita Node en el PATH.
  pause
  exit /b 1
)

node scripts\archivar-joyas-mercury.js
if errorlevel 1 (
  pause
  exit /b 1
)

echo.
echo  Abriendo la carpeta del archivo...
explorer "%USERPROFILE%\joyasmercury-archivo-organizacion"
echo.
pause
