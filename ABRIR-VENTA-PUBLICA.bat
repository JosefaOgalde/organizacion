@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo.
echo  Impresoreando — link publico para registrar ventas
echo  (celular / cualquier red, no uses localhost en el telefono)
echo.
echo  1) Deja SERVIR.bat corriendo en otra ventana
echo  2) Esta ventana abrira un tunel y mostrara el link
echo.
node scripts/tunnel-venta-publica.js
pause
