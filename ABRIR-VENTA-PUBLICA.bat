@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo.
echo  Impresoreando — link PUBLICO para registrar ventas
echo  (otra WiFi / 4G / cualquier lugar — no uses localhost)
echo.
echo  Requisitos:
echo    1) SERVIR.bat debe estar corriendo (guarda las ventas en el PC)
echo    2) Esta ventana crea el tunel y registra el link en el panel
echo.
echo  Luego: panel Resumen → Copiar link publico → WhatsApp
echo  Deja AMBAS ventanas abiertas mientras vendan.
echo.
node scripts/tunnel-venta-publica.js
pause
