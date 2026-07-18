@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo.
echo  === Tronwell · Ajustar textos (19 jul) ===
echo.

set "PHP_EXE="
if exist "C:\laragon\bin\php\php-8.3.30-Win32-vs16-x64\php.exe" set "PHP_EXE=C:\laragon\bin\php\php-8.3.30-Win32-vs16-x64\php.exe"
if not defined PHP_EXE if exist "C:\laragon\bin\php\php-8.3.16-Win32-vs16-x64\php.exe" set "PHP_EXE=C:\laragon\bin\php\php-8.3.16-Win32-vs16-x64\php.exe"
if not defined PHP_EXE (
  for /d %%D in ("C:\laragon\bin\php\php-8*") do if exist "%%~D\php.exe" set "PHP_EXE=%%~D\php.exe"
)
if not defined PHP_EXE where php >nul 2>&1 && set "PHP_EXE=php"
if not defined PHP_EXE (
  echo  [ERROR] No se encontro php.exe
  pause
  exit /b 1
)

"%PHP_EXE%" scripts\add-tronwell-ajustar-textos.php
if errorlevel 1 (
  pause
  exit /b 1
)

echo.
echo  Luego: ABRIR-LARAVEL.bat  →  http://127.0.0.1:8000/index.html?disco=1
echo.
pause
