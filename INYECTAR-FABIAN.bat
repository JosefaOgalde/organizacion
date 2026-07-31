@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo.
echo  ========================================
echo   INYECTAR FABIAN I000016  (a prueba de fallos)
echo  ========================================
echo  Carpeta: %CD%
echo.

where node >nul 2>&1
if errorlevel 1 (
  echo ERROR: no hay node
  pause
  exit /b 1
)

where git >nul 2>&1
if not errorlevel 1 (
  echo Git rama:
  git branch --show-current
  git fetch origin cursor/laravel-guardar-entrega-02f9 2>nul
  git checkout cursor/laravel-guardar-entrega-02f9 2>nul
  git pull origin cursor/laravel-guardar-entrega-02f9
  echo Commit: 
  git rev-parse --short HEAD
  echo.
)

echo Cerrando puerto 8000...
if exist "CERRAR-SERVIDOR.bat" call CERRAR-SERVIDOR.bat
for /f "tokens=5" %%P in ('netstat -ano 2^>nul ^| findstr ":8000" ^| findstr "LISTENING"') do taskkill /F /PID %%P >nul 2>&1
timeout /t 1 >nul

echo.
echo Inyectando en live...
node scripts\inyectar-fabian-ahora.js
if errorlevel 1 (
  echo FALLÓ node
  pause
  exit /b 1
)

echo.
echo Arrancando servidor PHP...
set "PHP_EXE="
where php >nul 2>&1 && set "PHP_EXE=php"
if not defined PHP_EXE if exist "C:\laragon\bin\php\php-8.3.16-Win32-vs16-x64\php.exe" set "PHP_EXE=C:\laragon\bin\php\php-8.3.16-Win32-vs16-x64\php.exe"
if not defined PHP_EXE (
  for /d %%D in ("C:\laragon\bin\php\php-*") do if exist "%%D\php.exe" set "PHP_EXE=%%D\php.exe"
)
if not defined PHP_EXE (
  echo ERROR: no encuentro php.exe
  echo Igual el archivo live ya tiene Fabian. Abrí ABRIR-LARAVEL.bat vos.
  pause
  exit /b 1
)

start "Organizacion · 8000" cmd /k "cd /d "%~dp0" && "%PHP_EXE%" -S 127.0.0.1:8000 scripts\servidor-unificado-8000.php"
timeout /t 3 >nul

echo.
echo Consultando API...
powershell -NoProfile -Command "try { $r = Invoke-RestMethod 'http://127.0.0.1:8000/api/impresoreando/debug-fabian'; Write-Host $r.mensaje; Write-Host ('Codigos: ' + ($r.codigos -join ', ')) } catch { Write-Host $_.Exception.Message }"

echo.
echo Abriendo pagina diagnostico (ahi DEBE verse Fabian en amarillo)...
start "" "http://127.0.0.1:8000/index/clientes/impresoreando/panel/ver-fabian.html"
timeout /t 1 >nul
start "" "http://127.0.0.1:8000/index/clientes/impresoreando/panel/?tab=ventas&v=inyect4"

echo.
echo Si ver-fabian.html muestra OK en verde, Fabian esta en la API.
echo En el panel: Origen = Todos, Ctrl+F5.
pause
