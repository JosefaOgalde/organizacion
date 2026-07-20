@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo.
echo  === Organizacion · Laravel + SQLite ^(flujo unificado^) ===
echo  Un solo servidor en :8000 — API + organizador + portal + ECR + MOVA + Impresoreando
echo.
echo  Uso:
echo    ABRIR-LARAVEL.bat           → arranque ^(si ya corre: solo recarga organizador^)
echo    ABRIR-LARAVEL.bat todo      → abre todas las URLs aunque el server ya este up
echo    ABRIR-LARAVEL.bat sin-nav   → solo servidor / sync, sin abrir navegador
echo    RECARGAR.bat                → solo recarga organizador ?disco=1
echo.

set "MODO=%~1"
if "%MODO%"=="" set "MODO=auto"

REM No cerrar Laravel si ya esta en :8000; solo cerrar Node viejo si no hay Laravel
netstat -ano 2>nul | findstr ":8000" | findstr "LISTENING" >nul
if errorlevel 1 (
  if exist "%~dp0CERRAR-SERVIDOR.bat" call "%~dp0CERRAR-SERVIDOR.bat"
)

set "PHP_EXE="
if exist "C:\laragon\bin\php\php-8.3.30-Win32-vs16-x64\php.exe" set "PHP_EXE=C:\laragon\bin\php\php-8.3.30-Win32-vs16-x64\php.exe"
if not defined PHP_EXE if exist "C:\laragon\bin\php\php-8.3.16-Win32-vs16-x64\php.exe" set "PHP_EXE=C:\laragon\bin\php\php-8.3.16-Win32-vs16-x64\php.exe"
if not defined PHP_EXE (
  for /d %%D in ("C:\laragon\bin\php\php-8*") do if exist "%%~D\php.exe" set "PHP_EXE=%%~D\php.exe"
)
if not defined PHP_EXE where php >nul 2>&1 && set "PHP_EXE=php"
if not defined PHP_EXE (
  echo  [ERROR] No se encontro php.exe
  echo  Opciones: instalar PHP en PATH, o usar el php.exe de Laragon
  echo  C:\laragon\bin\php\php-8.3.30-Win32-vs16-x64\php.exe
  pause
  exit /b 1
)

if not exist "backend\artisan" (
  echo  [ERROR] Falta backend\artisan
  pause
  exit /b 1
)

if not exist ".env" if exist ".env.example" (
  echo  Creando .env desde .env.example...
  copy /y .env.example .env >nul
)

if not exist "data\impresoreando-live.json" (
  if exist "data\impresoreando-seed.json" (
    copy /Y "data\impresoreando-seed.json" "data\impresoreando-live.json" >nul
    echo  Creado data\impresoreando-live.json desde seed
  )
)

where node >nul 2>&1
if not errorlevel 1 (
  if exist "scripts\sync-respaldo-auto.js" (
    echo  0^) Sync respaldo local...
    node scripts\sync-respaldo-auto.js --force 2>nul
  )
  if exist "scripts\asegurar-impresoreando-live.js" (
    node scripts\asegurar-impresoreando-live.js 2>nul
  )
)

echo  1^) SQLite + seed clientes...
"%PHP_EXE%" scripts\usar-sqlite-laravel.php
if errorlevel 1 (
  pause
  exit /b 1
)

echo  2^) Rutas API + frontend unificado...
"%PHP_EXE%" scripts\configurar-laravel-unificado.php
if errorlevel 1 (
  pause
  exit /b 1
)

echo  3^) migrate + seed...
pushd backend
"%PHP_EXE%" artisan config:clear >nul 2>&1
"%PHP_EXE%" artisan migrate --force
"%PHP_EXE%" artisan db:seed --class=ClienteSeeder --force
popd

if not exist "data\organizacion-live.json" (
  if exist "data\organizacion-respaldo-2026-07-18.json" (
    copy /Y "data\organizacion-respaldo-2026-07-18.json" "data\organizacion-live.json" >nul
  ) else if exist "data\organizacion-respaldo-2026-07-17.json" (
    copy /Y "data\organizacion-respaldo-2026-07-17.json" "data\organizacion-live.json" >nul
  )
)

set "YA_CORRE=0"
netstat -ano 2>nul | findstr ":8000" | findstr "LISTENING" >nul
if not errorlevel 1 set "YA_CORRE=1"

if "%YA_CORRE%"=="1" (
  echo.
  echo  Laravel ya esta en :8000 — no se reinicia el servidor.
) else (
  echo.
  echo  Arrancando http://127.0.0.1:8000 ...
  start "Laravel · 8000" cmd /k "cd /d "%~dp0backend" && "%PHP_EXE%" artisan serve --host=127.0.0.1 --port=8000"
  timeout /t 2 >nul
)

if /I "%MODO%"=="sin-nav" goto :fin_urls
if /I "%MODO%"=="sin-navegador" goto :fin_urls

if /I "%MODO%"=="todo" goto :abrir_todo

REM auto: si ya corria → solo recargar organizador; si arranco ahora → abrir todo
if "%YA_CORRE%"=="1" (
  echo  Recargando solo el organizador...
  start "" "http://127.0.0.1:8000/index.html?disco=1"
  goto :fin_urls
)

:abrir_todo
start "" "http://127.0.0.1:8000/index.html?disco=1"
start "" "http://127.0.0.1:8000/index/clientes/?disco=1"
start "" "http://127.0.0.1:8000/index/clientes/ecr/?disco=1"
start "" "http://127.0.0.1:8000/index/clientes/mkof/?disco=1"
start "" "http://127.0.0.1:8000/index/clientes/MKOF/MOVA?disco=1"

:fin_urls
echo.
echo  === URLs ^(todas con ?disco=1^) ===
echo    Organizador:  http://127.0.0.1:8000/index.html?disco=1
echo    Portal:       http://127.0.0.1:8000/index/clientes/?disco=1
echo    ECR:          http://127.0.0.1:8000/index/clientes/ecr/?disco=1
echo    MKOF / MOVA:  http://127.0.0.1:8000/index/clientes/mkof/?disco=1
echo    Impresoreando: http://127.0.0.1:8000/index/clientes/impresoreando/panel/?disco=1
echo.
echo  Recarga rapida: RECARGAR.bat
echo  Abrir todo:     ABRIR-LARAVEL.bat todo
echo  Sin navegador:  ABRIR-LARAVEL.bat sin-nav
echo.
if /I not "%MODO%"=="sin-nav" if /I not "%MODO%"=="sin-navegador" pause
