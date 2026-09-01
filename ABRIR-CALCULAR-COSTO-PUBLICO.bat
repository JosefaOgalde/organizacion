@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo.
echo  Impresoreando — link publico para CALCULAR COSTO
echo  (celular / tablet / cualquier red — no uses localhost)
echo.
echo  1) Deja ABRIR-LARAVEL.bat corriendo en otra ventana (:8000)
echo  2) Esta ventana abrira un tunel y mostrara el link
echo  3) Comparte el link por WhatsApp
echo.
set TUNNEL_FOCUS=costo
node scripts\tunnel-impresoreando-publico.js
pause
