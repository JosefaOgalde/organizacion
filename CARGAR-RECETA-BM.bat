@echo off
chcp 65001 >nul
setlocal
cd /d "%~dp0"
title CRC · Cargar receta en Business Manager

set "CRC=index\clientes\Herramientas\carga-recetas-cencosud"
set "INBOX=%CRC%\inbox"
set "OUT=%CRC%\out"

echo.
echo  ========================================
echo   CRC · CARGAR RECETA EN BUSINESS MANAGER
echo  ========================================
echo.

if "%~1"=="" (
  echo  Arrastra el Word de la receta encima de este .bat
  echo  o ejecutalo asi:
  echo     CARGAR-RECETA-BM.bat "C:\ruta\Anticuchos de verduras con chimichurri.docx"
  echo.
  pause
  exit /b 1
)

where python >nul 2>&1
if errorlevel 1 (
  echo  No se encontro python. Instala Python 3 y marca "Add to PATH".
  pause
  exit /b 1
)

if not exist "%INBOX%" mkdir "%INBOX%"
copy /y "%~1" "%INBOX%\" >nul 2>&1
set "FUENTE=%INBOX%\%~nx1"
if not exist "%FUENTE%" (
  echo  No se pudo copiar "%~1" a %INBOX%
  pause
  exit /b 1
)

echo  PASO 1 · Word -^> JSON
echo.
python scripts\parse-receta-word.py "%FUENTE%"
if errorlevel 3 goto :ya_existe
if errorlevel 1 goto :error_parse
goto :json_listo

:ya_existe
echo.
set "RESP=N"
set /p "RESP=Ya hay un JSON de esta receta. Reemplazarlo con lo del Word? (S/N): "
if /i not "%RESP%"=="S" goto :json_listo
echo.
python scripts\parse-receta-word.py "%FUENTE%" --force
if errorlevel 1 goto :error_parse

:json_listo
set "JSON="
for /f "delims=" %%A in ('dir /b /a-d /o-d "%OUT%\*.json" 2^>nul') do if not defined JSON set "JSON=%OUT%\%%A"
if not defined JSON goto :error_parse

echo.
echo  JSON de la receta: %JSON%
echo  Revisalo si quieres antes de seguir (los SKU no vienen en el Word).
echo.
set "SEGUIR=N"
set /p "SEGUIR=Continuar al Business Manager? Se abre Chromium (S/N): "
if /i not "%SEGUIR%"=="S" goto :fin

echo.
echo  Preparando Playwright (solo tarda la primera vez)...
python -m pip install --quiet playwright
python -m playwright install chromium

echo.
echo  PASO 2 · mapear el CMS con tu login
echo  1) Inicia sesion en la ventana que se abre (ADFS / MFA a mano).
echo  2) Abre la receta en el Gestor de contenido.
echo  3) Vuelve aqui y pulsa ENTER. NO toques los lapices: se abren solos.
echo.
python scripts\explorar-bm-cencosud.py --reuse-session
if errorlevel 1 goto :error_bm

echo.
echo  PASO 3 · rellenar la receta (dry-run: no publica)
echo.
python scripts\publicar-receta-cencosud.py "%JSON%" --headed --dry-run
if errorlevel 1 goto :error_bm

echo.
echo  Listo. Revisa la receta en el BM y publicala tu misma si quedo bien.
goto :fin

:error_parse
echo.
echo  [ERROR] No se pudo generar el JSON desde el Word.
pause
exit /b 1

:error_bm
echo.
echo  [ERROR] Fallo el paso contra el Business Manager.
echo  Si faltaron campos, revisa %CRC%\secrets\bm-selectores.json
echo  y vuelve a correr este .bat.
pause
exit /b 1

:fin
echo.
pause
