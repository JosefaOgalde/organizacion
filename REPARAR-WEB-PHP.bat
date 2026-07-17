@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo.
echo  === Reparar routes\web.php ^(quitar duplicados^) ===
echo.

powershell -NoProfile -Command ^
  "$p='backend\routes\web.php'; " ^
  "if (!(Test-Path $p)) { Write-Host '[ERROR] No existe' $p; exit 1 }; " ^
  "$c=Get-Content $p -Raw; " ^
  "$c=[regex]::Replace($c, '(?ms)\r?\n// --- Frontend organizacion.*?where\(''path'',\s*''\^\(\?!api\)\.\*\$''\);', ''); " ^
  "$c=[regex]::Replace($c, '(?ms)\r?\nuse App\\Http\\Controllers\\FrontendStaticController;.*?where\(''path'',\s*''\^\(\?!api\)\.\*\$''\);', ''); " ^
  "$block=@\"`r`n`r`n// --- Frontend organizacion (mismo origen que la API) ---`r`nuse App\Http\Controllers\FrontendStaticController;`r`nRoute::get('/', [FrontendStaticController::class, 'home']);`r`nRoute::get('/{path}', [FrontendStaticController::class, 'serve'])->where('path', '^(?!api).*$');`r`n\"@; " ^
  "$c=$c.TrimEnd() + $block; " ^
  "Set-Content -Path $p -Value $c -Encoding utf8; " ^
  "Write-Host '  · web.php reparado (un solo bloque frontend)'"

echo.
echo  Listo. Ahora:
echo    cd backend
echo    php artisan config:clear
echo    php artisan db:seed --class=ClienteSeeder --force
echo    php artisan serve --host=127.0.0.1 --port=8000
echo.
pause
