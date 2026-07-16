@echo off
REM Busca node.exe (Laragon / Program Files / PATH) y deja NODE_EXE
set "NODE_EXE="

where node >nul 2>&1
if not errorlevel 1 (
  for /f "delims=" %%i in ('where node') do (
    set "NODE_EXE=%%i"
    goto :done
  )
)

if exist "C:\laragon\bin\nodejs\node.exe" set "NODE_EXE=C:\laragon\bin\nodejs\node.exe" & goto :done
if exist "C:\laragon\bin\nodejs\node-v22\node.exe" set "NODE_EXE=C:\laragon\bin\nodejs\node-v22\node.exe" & goto :done
if exist "C:\laragon\bin\nodejs\node-v20\node.exe" set "NODE_EXE=C:\laragon\bin\nodejs\node-v20\node.exe" & goto :done
if exist "C:\laragon\bin\nodejs\node-v18\node.exe" set "NODE_EXE=C:\laragon\bin\nodejs\node-v18\node.exe" & goto :done

for /d %%D in ("C:\laragon\bin\nodejs\node*") do (
  if exist "%%D\node.exe" (
    set "NODE_EXE=%%D\node.exe"
    goto :done
  )
)

if exist "%ProgramFiles%\nodejs\node.exe" set "NODE_EXE=%ProgramFiles%\nodejs\node.exe" & goto :done
if exist "%LocalAppData%\Programs\nodejs\node.exe" set "NODE_EXE=%LocalAppData%\Programs\nodejs\node.exe" & goto :done

:done
if "%NODE_EXE%"=="" (
  echo.
  echo  [ERROR] No se encontro node.exe
  echo  Instala Node:
  echo    - Laragon → Menu → Tools → Quick add → node
  echo    - o: winget install OpenJS.NodeJS.LTS
  echo  Luego cierra y abre CMD de nuevo.
  echo.
  exit /b 1
)
exit /b 0
