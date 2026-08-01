@echo off
chcp 65001 >nul
cd /d "%~dp0"
title Crear accesos en el Escritorio

echo.
echo  ========================================
echo   ACCESOS EN EL ESCRITORIO
echo  ========================================
echo.
echo  Se crean 5 accesos directos visibles
echo  en tu Escritorio ^(usuario actual^).
echo.

set "ROOT=%~dp0"
set "ROOT=%ROOT:~0,-1%"

powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$desk = [Environment]::GetFolderPath('Desktop');" ^
  "$root = '%ROOT%';" ^
  "$ws = New-Object -ComObject WScript.Shell;" ^
  "$items = @(" ^
  "  @{ Name = '1. Organizacion - Empezar aqui'; Target = 'EMPEZAR-AQUI.bat'; Desc = 'Pull main + restaurar calendario + abrir Laravel' }," ^
  "  @{ Name = '2. Organizacion - Abrir Laravel'; Target = 'ABRIR-LARAVEL.bat'; Desc = 'Solo abrir / reiniciar servidor :8000' }," ^
  "  @{ Name = '3. Organizacion - Recargar'; Target = 'RECARGAR.bat'; Desc = 'Abrir organizador con ?disco=1' }," ^
  "  @{ Name = '4. Organizacion - Cerrar servidor'; Target = 'CERRAR-SERVIDOR.bat'; Desc = 'Cerrar Laravel / puerto 8000' }," ^
  "  @{ Name = '5. Organizacion - Estrategia redes IMP'; Target = 'VER-REDES-IMP.bat'; Desc = 'Abrir campaña Instagram Impresoreando' }" ^
  ");" ^
  "foreach ($i in $items) {" ^
  "  $path = Join-Path $desk ($i.Name + '.lnk');" ^
  "  $s = $ws.CreateShortcut($path);" ^
  "  $s.TargetPath = Join-Path $root $i.Target;" ^
  "  $s.WorkingDirectory = $root;" ^
  "  $s.WindowStyle = 1;" ^
  "  $s.Description = $i.Desc;" ^
  "  $s.Save();" ^
  "  Write-Host ('  OK  ' + $i.Name);" ^
  "}"

if errorlevel 1 (
  echo.
  echo  [ERROR] No se pudieron crear los accesos.
  echo  Probá abrir esta carpeta y fijar EMPEZAR-AQUI.bat a Inicio / barra.
  pause
  exit /b 1
)

echo.
echo  Listo. Mira el Escritorio:
echo    1. Organizacion - Empezar aqui
echo    2. Organizacion - Abrir Laravel
echo    3. Organizacion - Recargar
echo    4. Organizacion - Cerrar servidor
echo    5. Organizacion - Estrategia redes IMP
echo.
echo  Del dia a dia: solo el 1.
echo  Para ver la campana IG: el 5.
echo.
explorer shell:Desktop
pause
