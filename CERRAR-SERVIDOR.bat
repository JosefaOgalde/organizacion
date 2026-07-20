@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo Cerrando procesos en puertos 8000 y 3000...
for %%P in (8000 3000) do (
  for /f "tokens=5" %%a in ('netstat -ano 2^>nul ^| findstr ":%%P" ^| findstr "LISTENING"') do (
    taskkill /F /PID %%a >nul 2>&1
  )
)
timeout /t 1 /nobreak >nul
echo Listo.
