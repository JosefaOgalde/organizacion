@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo.
echo  ============================================================
echo   Impresoreando — link PUBLICO para el estimador de costo
echo   (socio / otro PC / celular / 4G — NO uses localhost ni 192.168)
echo  ============================================================
echo.
echo   1) Deja ABRIR-LARAVEL.bat corriendo en otra ventana (:8000)
echo   2) Esta ventana abre el tunel y muestra el link
echo   3) Copia el link https://....loca.lt/.../calcular-costo/
echo   4) Enviarlo por WhatsApp a tu socio
echo   5) Deja ESTA ventana abierta mientras lo usen
echo.
echo   Si localtunnel pide password: usa la IP publica que muestra
echo   la pagina de localtunnel (o vuelve a abrir este .bat).
echo.
set TUNNEL_FOCUS=costo
node scripts\tunnel-impresoreando-publico.js
echo.
echo  Tunel cerrado. Vuelve a abrir este .bat para un link nuevo.
pause
