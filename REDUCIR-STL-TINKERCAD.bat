@echo off
chcp 65001 >nul
setlocal
cd /d "%~dp0"

if "%~1"=="" (
  echo.
  echo Arrastra el archivo .STL encima de este .bat
  echo o ejecutalo asi:
  echo   REDUCIR-STL-TINKERCAD.bat "C:\ruta\CASCO MEGAMAN.stl"
  echo.
  pause
  exit /b 1
)

where python >nul 2>&1
if errorlevel 1 (
  echo No se encontro python. Instala Python 3 y marca "Add to PATH".
  pause
  exit /b 1
)

python -m pip install --quiet trimesh numpy fast-simplification
python scripts\reducir-stl-tinkercad.py "%~1" --max-mb 20
echo.
echo El archivo nuevo termina en -tinkercad.stl ^(misma carpeta del original^).
echo Subilo a Tinkercad ^(limite 25 MB^).
pause
