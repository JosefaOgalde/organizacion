@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo.
echo  Impresoreando — link publico para registrar ventas
echo  (celular / cualquier red, no uses localhost en el telefono)
echo.
echo  1) Deja ABRIR-LARAVEL.bat corriendo en otra ventana (:8000)
echo  2) Esta ventana abrira un tunel y mostrara el link
echo.
set TUNNEL_FOCUS=venta
node scripts\tunnel-impresoreando-publico.js
if errorlevel 1 (
  echo.
  echo  Fallback: script anterior...
  node scripts\tunnel-venta-publica.js
)
pause
