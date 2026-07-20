@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo.
echo  === Guia n8n: MySQL antes de Google Sheets ===
echo.

if not exist "index\clientes\mkof\n8n-mysql-antes-sheets.html" (
  echo  ERROR: falta el HTML. Haz pull de la rama de esta guia.
  pause
  exit /b 1
)

REM Abrir directo en el navegador (sin depender del servidor Node)
start "" "%~dp0index\clientes\mkof\n8n-mysql-antes-sheets.html"

echo  Abierto en el navegador.
echo  Para PDF: Ctrl+P → Guardar como PDF (una slide por pagina).
echo.
echo  Tambien: http://localhost:3000/index/clientes/mkof/n8n-mysql-antes-sheets.html
echo           http://127.0.0.1:8000/index/clientes/mkof/n8n-mysql-antes-sheets.html
echo.
pause
