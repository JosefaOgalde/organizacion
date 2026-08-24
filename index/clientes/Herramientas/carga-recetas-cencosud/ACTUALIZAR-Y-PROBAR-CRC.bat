@echo off
REM Actualiza la rama CRC y deja el Word del salmon en inbox si lo arrastras aqui.
cd /d "%~dp0..\.."
echo === git pull CRC ===
git fetch origin cursor/crc-scraping-bm-78d6
git checkout cursor/crc-scraping-bm-78d6
git pull origin cursor/crc-scraping-bm-78d6
echo.
echo Si el Word de la receta no esta en inbox, copialo a:
echo   index\clientes\Herramientas\carga-recetas-cencosud\inbox\
echo.
echo Luego:
echo   python scripts\publicar-receta-cencosud.py index\clientes\Herramientas\carga-recetas-cencosud\out\salmon-a-la-parrilla-con-salsa-de-palta.json --headed --dry-run
echo.
pause
