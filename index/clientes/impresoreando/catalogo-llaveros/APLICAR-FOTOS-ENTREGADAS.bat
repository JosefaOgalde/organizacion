@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo.
echo === Impresoreando · aplicar fotos entregadas al catálogo Llaveros ===
echo.
echo 1) Guardá tus 13 fotos en esta carpeta:
echo    %~dp0refs\entregadas\
echo.
echo    Con ESTOS nombres exactos:
echo      01-coffee.jpg
echo      02-tamagotchi-gato.jpg
echo      03-mac-classic.jpg
echo      04-frutilla-pastillas.jpg
echo      05-tamagotchi-pastillas.jpg
echo      06-joystick.jpg
echo      07-nickelodeon.jpg
echo      08-retro-arcade.jpg
echo      09-onepiece-sombrero.jpg
echo      10-telefono-superpoderosas.jpg
echo      11-huella-porta-foto.jpg
echo      12-crash-boxes.jpg
echo      13-mario-bloques.jpg
echo.
echo    (También acepta .png / .jpeg / .webp con el mismo nombre)
echo.
if not exist "refs\entregadas" mkdir "refs\entregadas"
python "aplicar-fotos-entregadas.py"
if errorlevel 1 (
  echo.
  echo Faltan fotos o falló el script. Revisá la carpeta entregadas.
  pause
  exit /b 1
)
echo.
echo Listo. Abrí:
echo   http://127.0.0.1:8000/index/clientes/impresoreando/catalogo-llaveros/ver.html
echo.
pause
