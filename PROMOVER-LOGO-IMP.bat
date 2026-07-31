@echo off
chcp 65001 >nul
cd /d "%~dp0"
title Promover logo Impresoreando a canónico

echo.
echo  === Promover logo Impresoreando ===
echo  Toma el logo que guardaste ^(Editar logo / live / 31-jul^)
echo  y lo deja como logo-ima2.png oficial del repo.
echo.

where node >nul 2>&1
if errorlevel 1 (
  echo [ERROR] Node no esta en el PATH.
  pause
  exit /b 1
)

node scripts\promover-logo-impresoreando.js
if errorlevel 1 (
  echo [ERROR] No se pudo promover el logo.
  pause
  exit /b 1
)

echo.
echo  Para que quede en Git ^(y el agente lo use siempre^):
echo    git add index\clientes\impresoreando\identidad\logo-ima2.png
echo    git add index\clientes\impresoreando\identidad\logo-oficial-ui.png
echo    git add index\clientes\impresoreando\identidad\logo-oficial-ui.meta.json
echo    git commit -m "Impresoreando: logo oficial UI actualizado"
echo    git push
echo.
echo  O deja que este bat lo intente ahora.
echo.
set /p DOGIT="Commit y push ahora? (S/N): "
if /I not "%DOGIT%"=="S" (
  echo  Listo sin git.
  pause
  exit /b 0
)

git add "index/clientes/impresoreando/identidad/logo-ima2.png" "index/clientes/impresoreando/identidad/logo-impresoreando-claro.png" "index/clientes/impresoreando/identidad/logo-oficial-ui.png" "index/clientes/impresoreando/identidad/logo-oficial-ui.meta.json" "index/clientes/impresoreando/identidad/logo-ui-custom.png" 2>nul
git status --short "index/clientes/impresoreando/identidad/"
git commit -m "Impresoreando: logo oficial UI (promovido desde live/respaldo)"
if errorlevel 1 (
  echo  [AVISO] Nada nuevo que commitear o commit fallo.
) else (
  for /f "delims=" %%b in ('git branch --show-current') do set "BR=%%b"
  git push -u origin "%BR%"
)
echo.
pause
exit /b 0
