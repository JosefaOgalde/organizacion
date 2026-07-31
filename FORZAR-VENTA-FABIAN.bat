@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo.
echo  === Forzar venta I000016 Fabian MKOF ===
echo  Carpeta: %CD%
echo.

where git >nul 2>&1
if not errorlevel 1 (
  echo  --- Git ---
  git branch --show-current
  git fetch origin cursor/laravel-guardar-entrega-02f9
  git checkout cursor/laravel-guardar-entrega-02f9
  git pull origin cursor/laravel-guardar-entrega-02f9
  git rev-parse --short HEAD
  echo.
)

findstr /C:"I000016" "data\impresoreando-seed.json" >nul 2>&1
if errorlevel 1 (
  echo  ERROR: seed sin I000016. No estas en la rama correcta.
  pause
  exit /b 1
)
echo  Seed OK

echo.
echo  Cerrando :8000...
if exist "%~dp0CERRAR-SERVIDOR.bat" call "%~dp0CERRAR-SERVIDOR.bat"
for /f "tokens=5" %%P in ('netstat -ano 2^>nul ^| findstr ":8000" ^| findstr "LISTENING"') do taskkill /F /PID %%P >nul 2>&1
timeout /t 1 >nul

echo  Escribiendo live...
if exist "scripts\sync-impresoreando-seed-a-live.js" node scripts\sync-impresoreando-seed-a-live.js
node scripts\force-imp-venta-fabian-016.js
if exist "scripts\force-imp-fiados-012-013.js" node scripts\force-imp-fiados-012-013.js

findstr /C:"I000016" "data\impresoreando-live.json" >nul 2>&1
if errorlevel 1 (
  echo  ERROR: live SIN I000016 despues del force
  pause
  exit /b 1
)
echo  Live OK — tiene I000016
findstr /C:"Fabian MKOF" "data\impresoreando-live.json"

echo.
echo  Arrancando servidor...
where php >nul 2>&1
set "PHP_EXE=php"
if exist "C:\laragon\bin\php\php-8.3.16-Win32-vs16-x64\php.exe" set "PHP_EXE=C:\laragon\bin\php\php-8.3.16-Win32-vs16-x64\php.exe"
for /d %%D in ("C:\laragon\bin\php\php-*") do if exist "%%D\php.exe" set "PHP_EXE=%%D\php.exe"

start "Organizacion · 8000" cmd /k "cd /d "%~dp0" && "%PHP_EXE%" -S 127.0.0.1:8000 scripts\servidor-unificado-8000.php"
timeout /t 2 >nul

echo.
echo  Probando API...
powershell -NoProfile -Command ^
  "try { $r = Invoke-RestMethod -Uri 'http://127.0.0.1:8000/api/impresoreando/debug-fabian' -Headers @{'Cache-Control'='no-store'}; Write-Host $r.mensaje; Write-Host ('Total ventas API: ' + $r.totalVentas); Write-Host ('Codigos: ' + ($r.codigos -join ', ')) } catch { Write-Host ('API error: ' + $_.Exception.Message) }"

echo.
echo  Abrí Ventas — arriba debe decir «Última venta: I000016 Fabian».
echo  Filtro Origen = Todos. Ctrl+F5.
echo  http://127.0.0.1:8000/index/clientes/impresoreando/panel/?tab=ventas^&v=fabian3
echo.
powershell -NoProfile -Command "Start-Process 'http://127.0.0.1:8000/index/clientes/impresoreando/panel/?tab=ventas&v=fabian3'"
powershell -NoProfile -Command "Start-Process 'http://127.0.0.1:8000/api/impresoreando/debug-fabian'"
pause
