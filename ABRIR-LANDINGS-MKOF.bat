@echo off
chcp 65001 >nul
cd /d "%~dp0"
title Making Of · Revisión de landings

echo.
echo  === Making Of · panel de revisión de landings ===
echo.
echo  No uses el puerto 8765 ^(ese era del agente en la nube^).
echo  En tu PC se abre con el servidor habitual :8000
echo.

set "PANEL=index\clientes\mkof\landings-revision\index.html"
if not exist "%PANEL%" (
  echo  [ERROR] No esta la carpeta del panel.
  echo  Trae la branch: git fetch origin
  echo                 git checkout cursor/arbol-animacion-3ba0
  echo                 git pull origin cursor/arbol-animacion-3ba0
  echo.
  pause
  exit /b 1
)

set "PHP_EXE="
if exist "C:\laragon\bin\php\php-8.3.30-Win32-vs16-x64\php.exe" set "PHP_EXE=C:\laragon\bin\php\php-8.3.30-Win32-vs16-x64\php.exe"
if not defined PHP_EXE if exist "C:\laragon\bin\php\php-8.3.16-Win32-vs16-x64\php.exe" set "PHP_EXE=C:\laragon\bin\php\php-8.3.16-Win32-vs16-x64\php.exe"
if not defined PHP_EXE (
  for /d %%D in ("C:\laragon\bin\php\php-8*") do if exist "%%~D\php.exe" set "PHP_EXE=%%~D\php.exe"
)
if not defined PHP_EXE where php >nul 2>&1 && set "PHP_EXE=php"

netstat -ano 2>nul | findstr ":8000" | findstr "LISTENING" >nul
if errorlevel 1 (
  echo  No hay servidor en :8000 — arrancando...
  if defined PHP_EXE (
    if exist "scripts\servidor-unificado-8000.php" (
      start "Organizacion · 8000" cmd /k "cd /d "%~dp0" && "%PHP_EXE%" -S 127.0.0.1:8000 scripts\servidor-unificado-8000.php"
      timeout /t 2 >nul
    ) else (
      echo  [AVISO] Falta scripts\servidor-unificado-8000.php
      echo  Corre primero EMPEZAR-AQUI.bat o ABRIR-LARAVEL.bat
      pause
      exit /b 1
    )
  ) else (
    echo  [ERROR] No hay PHP. Corre EMPEZAR-AQUI.bat primero.
    pause
    exit /b 1
  )
) else (
  echo  Servidor :8000 ya esta activo.
)

set "URL=http://127.0.0.1:8000/index/clientes/mkof/landings-revision/"
echo  Abriendo %URL%
powershell -NoProfile -Command "Start-Process '%URL%'"
echo.
echo  Listo. Si no carga: Ctrl+Shift+R o vuelve a correr EMPEZAR-AQUI.bat
echo.
pause
