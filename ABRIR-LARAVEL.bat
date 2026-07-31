@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo.
echo  === Organizacion · Laravel + SQLite ^(flujo unificado^) ===
echo  Un solo servidor en :8000 — API + organizador + portal + ECR + MOVA + Impresoreando
echo.
echo  Uso:
echo    ABRIR-LARAVEL.bat           → sync + reinicia :8000 + abre Organizador + Portal
echo    ABRIR-LARAVEL.bat todo      → tambien abre ECR, MKOF, MOVA y prospecto
echo    ABRIR-LARAVEL.bat sin-nav   → solo servidor / sync, sin abrir navegador
echo    ABRIR-LARAVEL.bat restaurar → restaura live desde respaldo 31-jul y abre
echo    RECARGAR.bat                → solo recarga organizador ?disco=1
echo    RECUPERAR-CALENDARIO.bat    → igual ^(Descargas 31-jul (1) primero^)
echo    EMPEZAR-AQUI.bat / TRAER-CAMBIOS.bat → pull main + restaurar + abrir
echo    CREAR-ACCESOS-ESCRITORIO.bat → iconos en el Escritorio ^(una vez^)
echo    REPARAR-SQLITE-ACTIVO.bat   → si sale "no such column: activo"
echo.

set "MODO=%~1"
if "%MODO%"=="" set "MODO=auto"

REM Restaurar calendario: Descargas 31-jul (1) → data 31-jul → 29 → 28
if /I "%MODO%"=="restaurar" (
  set "DL=%USERPROFILE%\Downloads"
  set "REST_SRC="
  if exist "%DL%\organizacion-respaldo-2026-07-31 (1).json" set "REST_SRC=%DL%\organizacion-respaldo-2026-07-31 (1).json"
  if not defined REST_SRC if exist "%DL%\organizacion-respaldo-2026-07-31.json" set "REST_SRC=%DL%\organizacion-respaldo-2026-07-31.json"
  if not defined REST_SRC if exist "data\organizacion-respaldo-2026-07-31.json" set "REST_SRC=data\organizacion-respaldo-2026-07-31.json"
  if not defined REST_SRC if exist "data\organizacion-respaldo-2026-07-29.json" set "REST_SRC=data\organizacion-respaldo-2026-07-29.json"
  if not defined REST_SRC if exist "data\organizacion-respaldo-2026-07-28.json" set "REST_SRC=data\organizacion-respaldo-2026-07-28.json"
  if not defined REST_SRC (
    echo  [ERROR] No hay organizacion-respaldo-*.json
    echo  Importa: IMPORTAR-RESPALDO.bat "%%USERPROFILE%%\Downloads\organizacion-respaldo-2026-07-31 (1).json"
    pause
    exit /b 1
  )
  if exist "data\organizacion-live.json" (
    copy /Y "data\organizacion-live.json" "data\organizacion-live-antes-restaurar.json" >nul 2>&1
  )
  if not exist "data" mkdir data
  copy /Y "%REST_SRC%" "data\organizacion-live.json" >nul
  copy /Y "%REST_SRC%" "data\organizacion-respaldo-2026-07-31.json" >nul 2>&1
  echo  Live restaurado desde %REST_SRC%
  set "MODO=auto"
)

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
  echo.
  echo  La carpeta backend/ NO va en Git ^(se crea en tu PC^).
  echo  En esta misma carpeta del proyecto:
  echo    composer create-project laravel/laravel backend
  echo  Guia: docs\laravel\BACKEND-README.md
  echo  Luego vuelve a correr ABRIR-LARAVEL.bat
  echo.
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

REM 0) Solo crear live si FALTA (nunca pisar el calendario local con un respaldo viejo)
if not exist "data\organizacion-live.json" (
  echo  0^) Creando organizacion-live.json desde respaldo...
  if exist "%USERPROFILE%\Downloads\organizacion-respaldo-2026-07-31 (1).json" (
    copy /Y "%USERPROFILE%\Downloads\organizacion-respaldo-2026-07-31 (1).json" "data\organizacion-live.json" >nul
    copy /Y "%USERPROFILE%\Downloads\organizacion-respaldo-2026-07-31 (1).json" "data\organizacion-respaldo-2026-07-31.json" >nul
    echo  Live creado desde Descargas 31-jul (1)
  ) else if exist "data\organizacion-respaldo-2026-07-31.json" (
    copy /Y "data\organizacion-respaldo-2026-07-31.json" "data\organizacion-live.json" >nul
    echo  Live creado desde data\organizacion-respaldo-2026-07-31.json
  ) else if exist "data\organizacion-respaldo-2026-07-29.json" (
    copy /Y "data\organizacion-respaldo-2026-07-29.json" "data\organizacion-live.json" >nul
    echo  Live creado desde data\organizacion-respaldo-2026-07-29.json
  ) else if exist "data\organizacion-respaldo-2026-07-28.json" (
    copy /Y "data\organizacion-respaldo-2026-07-28.json" "data\organizacion-live.json" >nul
    echo  Live creado desde data\organizacion-respaldo-2026-07-28.json
  ) else if exist "scripts\sync-respaldo-auto.js" (
    where node >nul 2>&1 && node scripts\sync-respaldo-auto.js --force
  )
) else (
  echo  0^) Live ya existe — no se pisa con respaldo
  echo     Si ves calendario viejo: ABRIR-LARAVEL.bat restaurar
)

echo  Sync Impresoreando ^(silencioso^)...
where node >nul 2>&1
if not errorlevel 1 (
  if exist "scripts\asegurar-impresoreando-live.js" node scripts\asegurar-impresoreando-live.js >nul 2>&1
  if exist "scripts\sync-impresoreando-seed-a-live.js" node scripts\sync-impresoreando-seed-a-live.js >nul 2>&1
  if exist "scripts\force-imp-producto-limpiador-brochas.js" node scripts\force-imp-producto-limpiador-brochas.js >nul 2>&1
  if exist "scripts\force-imp-fiados-012-013.js" node scripts\force-imp-fiados-012-013.js >nul 2>&1
  if exist "scripts\force-imp-ventas-014-015-fiado-008.js" node scripts\force-imp-ventas-014-015-fiado-008.js >nul 2>&1
  if exist "scripts\force-imp-ped-007-anulado.js" node scripts\force-imp-ped-007-anulado.js >nul 2>&1
  if exist "scripts\force-imp-mel-013-venta.js" node scripts\force-imp-mel-013-venta.js >nul 2>&1
)

echo  1^) SQLite + API Laravel...
"%PHP_EXE%" scripts\usar-sqlite-laravel.php >nul 2>&1
if errorlevel 1 (
  "%PHP_EXE%" scripts\usar-sqlite-laravel.php
  pause
  exit /b 1
)
"%PHP_EXE%" scripts\asegurar-columna-activo-clientes.php >nul 2>&1
"%PHP_EXE%" scripts\configurar-laravel-unificado.php >nul 2>&1
if errorlevel 1 (
  "%PHP_EXE%" scripts\configurar-laravel-unificado.php
  pause
  exit /b 1
)

pushd backend
"%PHP_EXE%" artisan config:clear >nul 2>&1
"%PHP_EXE%" artisan route:clear >nul 2>&1
"%PHP_EXE%" artisan migrate --force >nul 2>&1
"%PHP_EXE%" artisan db:seed --class=ClienteSeeder --force >nul 2>&1
if errorlevel 1 (
  echo  [AVISO] Seed fallo — reintento...
  popd
  "%PHP_EXE%" scripts\asegurar-columna-activo-clientes.php
  "%PHP_EXE%" scripts\usar-sqlite-laravel.php
  pushd backend
  "%PHP_EXE%" artisan db:seed --class=ClienteSeeder --force
  if errorlevel 1 (
    echo  [ERROR] Seed clientes fallo. Corre REPARAR-SQLITE-ACTIVO.bat
    popd
    pause
    exit /b 1
  )
)
popd

if exist "scripts\limpiar-clientes-duplicados.php" (
  "%PHP_EXE%" scripts\limpiar-clientes-duplicados.php >nul 2>&1
)

REM Solo live + respaldo mas reciente (ya no reescribe 21/24/28/29)
echo  2^) Calendario ^(ECR / pedidos IMP^)...
where node >nul 2>&1
if not errorlevel 1 (
  if exist "scripts\add-ecr-trade-marketing-mis-servicios.js" node scripts\add-ecr-trade-marketing-mis-servicios.js --also-respaldo >nul 2>&1
  if exist "scripts\sync-impresoreando-pedidos-organizacion.js" node scripts\sync-impresoreando-pedidos-organizacion.js --also-respaldo >nul 2>&1
  if exist "scripts\asegurar-tareas-cerradas.js" node scripts\asegurar-tareas-cerradas.js --also-respaldo >nul 2>&1
)

if not exist "data\organizacion-live.json" (
  if exist "%USERPROFILE%\Downloads\organizacion-respaldo-2026-07-31 (1).json" (
    copy /Y "%USERPROFILE%\Downloads\organizacion-respaldo-2026-07-31 (1).json" "data\organizacion-live.json" >nul
    echo  Live creado desde Descargas 31-jul (1)
  ) else if exist "data\organizacion-respaldo-2026-07-31.json" (
    copy /Y "data\organizacion-respaldo-2026-07-31.json" "data\organizacion-live.json" >nul
    echo  Live creado desde data\organizacion-respaldo-2026-07-31.json
  ) else if exist "data\organizacion-respaldo-2026-07-29.json" (
    copy /Y "data\organizacion-respaldo-2026-07-29.json" "data\organizacion-live.json" >nul
    echo  Live creado desde data\organizacion-respaldo-2026-07-29.json
  ) else if exist "data\organizacion-respaldo-2026-07-28.json" (
    copy /Y "data\organizacion-respaldo-2026-07-28.json" "data\organizacion-live.json" >nul
    echo  Live creado desde data\organizacion-respaldo-2026-07-28.json
  ) else if exist "data\organizacion-respaldo-2026-07-24.json" (
    copy /Y "data\organizacion-respaldo-2026-07-24.json" "data\organizacion-live.json" >nul
    echo  Live creado desde data\organizacion-respaldo-2026-07-24.json
  )
)

REM Tras actualizar FrontendStaticController / web.php, reiniciar :8000
REM (si ya corria, el proceso viejo puede servir 404 en carpetas como /index/clientes/)
set "YA_CORRE=0"
netstat -ano 2>nul | findstr ":8000" | findstr "LISTENING" >nul
if not errorlevel 1 (
  echo  Reiniciando Laravel en :8000 ^(rutas/frontend actualizados^)...
  if exist "%~dp0CERRAR-SERVIDOR.bat" (
    call "%~dp0CERRAR-SERVIDOR.bat"
  ) else (
    for /f "tokens=5" %%P in ('netstat -ano ^| findstr ":8000" ^| findstr "LISTENING"') do taskkill /F /PID %%P >nul 2>&1
  )
  timeout /t 1 >nul
)

echo.
echo  Arrancando servidor unificado http://127.0.0.1:8000 ...
echo  ^(estaticos del repo + API Laravel /api/*^)
start "Organizacion · 8000" cmd /k "cd /d "%~dp0" && "%PHP_EXE%" -S 127.0.0.1:8000 scripts\servidor-unificado-8000.php"
timeout /t 2 >nul
set "YA_CORRE=0"

if /I "%MODO%"=="sin-nav" goto :fin_urls
if /I "%MODO%"=="sin-navegador" goto :fin_urls

REM powershell conserva el "=" de ?disco=1 (start de cmd lo convierte en %3D)
REM Por defecto: solo Organizador + Portal clientes
powershell -NoProfile -Command "Start-Process 'http://127.0.0.1:8000/index.html?disco=1&v=20260728e'"
powershell -NoProfile -Command "Start-Process 'http://127.0.0.1:8000/index/clientes/?disco=1'"

if /I not "%MODO%"=="todo" goto :fin_urls

REM Modo "todo": tambien ECR, MKOF, MOVA y prospecto
powershell -NoProfile -Command "Start-Process 'http://127.0.0.1:8000/index/clientes/ecr/?disco=1'"
powershell -NoProfile -Command "Start-Process 'http://127.0.0.1:8000/index/clientes/mkof/?disco=1'"
powershell -NoProfile -Command "Start-Process 'http://127.0.0.1:8000/index/clientes/MKOF/MOVA?disco=1'"
powershell -NoProfile -Command "Start-Process 'http://127.0.0.1:8000/index/clientes/mkof/prospecto/?disco=1'"
powershell -NoProfile -Command "Start-Process 'http://127.0.0.1:8000/index/clientes/Herramientas/Tendencias.html?disco=1&vista=buscador&v=20260721b'"

:fin_urls
echo.
echo  Listo → http://127.0.0.1:8000/index.html?disco=1
echo  ^(Ctrl+Shift+R si ves datos viejos^)
echo  Git bloqueado: DESBLOQUEAR-GIT.bat
echo.
if /I not "%MODO%"=="sin-nav" if /I not "%MODO%"=="sin-navegador" pause
