@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo.
echo  Organizacion — servidor con guardado automatico en data/organizacion-live.json
echo  Abre: http://localhost:3000/index/
echo.
node scripts/organizacion-server.js
pause
