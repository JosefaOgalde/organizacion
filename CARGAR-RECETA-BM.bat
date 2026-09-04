@echo off
chcp 65001 >nul
setlocal EnableExtensions
cd /d "%~dp0"
title CRC - Cargar receta en Business Manager

set "CRC=index\clientes\Herramientas\carga-recetas-cencosud"
set "INBOX=%CRC%\inbox"
set "OUT=%CRC%\out"
set "SECRETS=%CRC%\secrets"
set "ENV_EXAMPLE=%SECRETS%\env.example"

echo.
echo  ========================================
echo   CRC - CARGAR RECETA EN BUSINESS MANAGER
echo  ========================================
echo.

if not "%~1"=="" goto :tiene_archivo
echo  Arrastra el Word o PDF de la receta encima de este .bat
echo  o ejecutalo asi:
echo     CARGAR-RECETA-BM.bat "C:\Users\josef\Downloads\Maremoto.pdf"
echo.
pause
exit /b 1

:tiene_archivo
where python >nul 2>&1
if not errorlevel 1 goto :tiene_python
echo  No se encontro python. Instala Python 3 y marca "Add to PATH".
pause
exit /b 1

:tiene_python
if not exist "%INBOX%" mkdir "%INBOX%"
copy /y "%~1" "%INBOX%\" >nul 2>&1
set "FUENTE=%INBOX%\%~nx1"
if exist "%FUENTE%" goto :fuente_ok
echo  No se pudo copiar "%~1" a %INBOX%
pause
exit /b 1

:fuente_ok
echo  PASO 1 - Word/PDF -^> JSON
echo.
python scripts\parse-receta-word.py "%FUENTE%"
if errorlevel 3 goto :ya_existe
if errorlevel 1 goto :error_parse
goto :json_listo

:ya_existe
echo.
set "RESP=N"
set /p "RESP=Ya hay un JSON de esta receta. Reemplazarlo? (S/N): "
if /i not "%RESP%"=="S" goto :json_listo
echo.
python scripts\parse-receta-word.py "%FUENTE%" --force
if errorlevel 1 goto :error_parse

:json_listo
set "JSON="
for /f "delims=" %%A in ('dir /b /a-d /o-d "%OUT%\*.json" 2^>nul') do if not defined JSON set "JSON=%OUT%\%%A"
if defined JSON goto :json_ok
goto :error_parse

:json_ok
echo.
echo  JSON de la receta: %JSON%
echo  Revisalo si quieres antes de seguir (los SKU no vienen en el documento).
echo.
set "SEGUIR=N"
set /p "SEGUIR=Continuar al Business Manager? Se abre Chromium (S/N): "
if /i not "%SEGUIR%"=="S" goto :fin

echo.
echo  Preparando Playwright (solo tarda la primera vez)...
python -m pip install --quiet playwright
python -m playwright install chromium

REM scripts CRC leen secrets\.env; evitamos "if exist ...\.env (" que rompe CMD
if not exist "%SECRETS%" mkdir "%SECRETS%"
if exist "%SECRETS%\.env" goto :env_listo
if not exist "%ENV_EXAMPLE%" goto :env_aviso
copy /y "%ENV_EXAMPLE%" "%SECRETS%\.env" >nul 2>&1
:env_aviso
echo  Crea/edita %SECRETS%\.env con CENCOSUD_BM_USER (nunca lo pegues en el chat).
:env_listo

echo.
echo  PASO 2 - UNA sola ventana Chromium (mapear + rellenar)
echo  1) Inicia sesion (ADFS / MFA a mano).
echo  2) Abre la receta (5 bloques al centro). NO pulses Proyectos ni la paleta.
echo  3) Vuelve aqui y pulsa ENTER. Los lapices se abren solos.
echo  4) El navegador NO se cierra hasta que pulses ENTER al final.
echo.

REM Si ya hay selectores, solo rellenar (no re-explorar ni cerrar a mitad).
if exist "%SECRETS%\bm-selectores.json" goto :solo_rellenar
python scripts\explorar-bm-cencosud.py --reuse-session --fill-json "%JSON%"
if errorlevel 1 goto :error_bm
goto :bm_ok

:solo_rellenar
echo  Selectores ya existen: relleno directo (sin cerrar y reabrir).
python scripts\publicar-receta-cencosud.py "%JSON%" --headed --dry-run
if errorlevel 1 goto :error_bm

:bm_ok
echo.
echo  Listo. Revisa la receta en el BM y publicala tu misma si quedo bien.
goto :fin

:error_parse
echo.
echo  [ERROR] No se pudo generar el JSON desde el Word/PDF.
pause
exit /b 1

:error_bm
echo.
echo  [ERROR] Fallo el paso contra el Business Manager.
echo  Si faltaron campos, revisa %SECRETS%\bm-selectores.json
echo  y vuelve a correr este .bat.
pause
exit /b 1

:fin
echo.
pause
