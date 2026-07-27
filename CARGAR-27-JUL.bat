@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo.
echo  === 27 jul: cargar respaldo Downloads + tareas + pieza bulldog ===
echo.

if not exist "%USERPROFILE%\Downloads\organizacion-respaldo-2026-07-27.json" (
  echo  [ERROR] No esta:
  echo    %USERPROFILE%\Downloads\organizacion-respaldo-2026-07-27.json
  echo  Exporta / guarda ese respaldo en Descargas y reintenta.
  pause
  exit /b 1
)

copy /Y "%USERPROFILE%\Downloads\organizacion-respaldo-2026-07-27.json" "data\organizacion-respaldo-2026-07-27.json" >nul
echo  [ok] Respaldo 27 copiado a data\

REM Foto del producto (si la dejaste en Descargas con este nombre)
if exist "%USERPROFILE%\Downloads\foto-producto-bulldog.jpg" (
  copy /Y "%USERPROFILE%\Downloads\foto-producto-bulldog.jpg" "index\clientes\impresoreando\piezas\foto-producto-bulldog.jpg" >nul
  echo  [ok] Foto producto copiada a piezas\
)
if exist "%USERPROFILE%\Downloads\foto-producto-bulldog.jpeg" (
  copy /Y "%USERPROFILE%\Downloads\foto-producto-bulldog.jpeg" "index\clientes\impresoreando\piezas\foto-producto-bulldog.jpg" >nul
  echo  [ok] Foto producto copiada a piezas\
)
if exist "%USERPROFILE%\Downloads\foto-producto-bulldog.png" (
  copy /Y "%USERPROFILE%\Downloads\foto-producto-bulldog.png" "index\clientes\impresoreando\piezas\foto-producto-bulldog.jpg" >nul
  echo  [ok] Foto producto copiada a piezas\
)

where node >nul 2>&1
if errorlevel 1 (
  echo  [ERROR] Falta node en PATH
  pause
  exit /b 1
)

node scripts\cargar-respaldo-y-tareas-27-jul.js
if errorlevel 1 (
  echo  [ERROR] Fallo carga de tareas
  pause
  exit /b 1
)

where python >nul 2>&1
if not errorlevel 1 (
  python scripts\montar-pieza-porta-completos-bulldog.py
) else (
  where py >nul 2>&1
  if not errorlevel 1 (
    py -3 scripts\montar-pieza-porta-completos-bulldog.py
  ) else (
    echo  [aviso] Sin Python: salta montaje de pieza. Instala Python o corre el script luego.
  )
)

echo.
echo  Abriendo Laravel...
call "%~dp0ABRIR-LARAVEL.bat"
