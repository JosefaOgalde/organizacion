@echo off
chcp 65001 >nul
cd /d "%~dp0"
title Mel pagada → I000020

echo.
echo  1^) git pull...
git pull
if errorlevel 1 (
  echo  Si fallo por seed:
  echo    git checkout -- data\impresoreando-seed.json
  echo    git pull
  pause
  exit /b 1
)

echo  2^) Forzar Mel en live...
where node >nul 2>&1
if errorlevel 1 (
  echo [ERROR] Falta Node
  pause
  exit /b 1
)
node scripts\force-imp-mel-013-venta.js
if errorlevel 1 (
  pause
  exit /b 1
)

echo  3^) Verificar live tiene I000020...
node -e "const d=require('./data/impresoreando-live.json'); const v=(d.ventas||[]).find(x=>x&&x.codigo==='I000020'); if(!v){console.error('FALLO: no hay I000020 en live'); process.exit(1);} console.log('OK live:', v.codigo, v.cliente, '$'+v.montoNeto);"
if errorlevel 1 (
  pause
  exit /b 1
)

echo  4^) Reiniciar servidor...
if exist "CERRAR-SERVIDOR.bat" call CERRAR-SERVIDOR.bat
timeout /t 1 >nul

echo  5^) Abrir Laravel...
start "Organizacion Mel" cmd /c "call ABRIR-LARAVEL.bat sin-nav & timeout /t 2 >nul"

timeout /t 3 >nul
echo  6^) Abrir Ventas ^(anti-cache^)...
powershell -NoProfile -Command "Start-Process 'http://127.0.0.1:8000/index/clientes/impresoreando/panel/?tab=ventas&v=mel020c'"

echo.
echo  En Ventas: Origen = Todos · Ctrl+Shift+R
echo  Debe aparecer I000020 Mel MKOF $4.000
echo.
echo  Pulsa Enter...
pause >nul
