<?php
/**
 * Instala en backend/ las rutas y controladores para un solo origen Laravel (:8000).
 * Uso: php scripts/configurar-laravel-unificado.php
 */
declare(strict_types=1);

$root = dirname(__DIR__);
$backend = $root . DIRECTORY_SEPARATOR . 'backend';

if (!is_file($backend . DIRECTORY_SEPARATOR . 'artisan')) {
    fwrite(STDERR, "ERROR: falta backend/artisan\n");
    exit(1);
}

function ensureDir(string $dir): void
{
    if (!is_dir($dir)) {
        mkdir($dir, 0775, true);
    }
}

function copyEjemplo(string $from, string $to): void
{
    ensureDir(dirname($to));
    if (!copy($from, $to)) {
        throw new RuntimeException("No se pudo copiar $from → $to");
    }
    echo "  · Copiado " . basename($to) . "\n";
}

$ej = $root . DIRECTORY_SEPARATOR . 'docs' . DIRECTORY_SEPARATOR . 'laravel' . DIRECTORY_SEPARATOR . 'ejemplos';

copyEjemplo(
    $ej . DIRECTORY_SEPARATOR . 'OrganizacionController.php',
    $backend . DIRECTORY_SEPARATOR . 'app' . DIRECTORY_SEPARATOR . 'Http' . DIRECTORY_SEPARATOR . 'Controllers' . DIRECTORY_SEPARATOR . 'Api' . DIRECTORY_SEPARATOR . 'OrganizacionController.php'
);
copyEjemplo(
    $ej . DIRECTORY_SEPARATOR . 'FrontendStaticController.php',
    $backend . DIRECTORY_SEPARATOR . 'app' . DIRECTORY_SEPARATOR . 'Http' . DIRECTORY_SEPARATOR . 'Controllers' . DIRECTORY_SEPARATOR . 'FrontendStaticController.php'
);
copyEjemplo(
    $ej . DIRECTORY_SEPARATOR . 'ClienteController.php',
    $backend . DIRECTORY_SEPARATOR . 'app' . DIRECTORY_SEPARATOR . 'Http' . DIRECTORY_SEPARATOR . 'Controllers' . DIRECTORY_SEPARATOR . 'Api' . DIRECTORY_SEPARATOR . 'ClienteController.php'
);

$api = $backend . DIRECTORY_SEPARATOR . 'routes' . DIRECTORY_SEPARATOR . 'api.php';
if (!is_file($api)) {
    fwrite(STDERR, "ERROR: falta routes/api.php — ejecuta: php artisan install:api\n");
    exit(1);
}

$apiSrc = file_get_contents($api);
$apiAdd = [];
if (!str_contains($apiSrc, 'OrganizacionController')) {
    $apiAdd[] = <<<'PHP'

use App\Http\Controllers\Api\OrganizacionController;
Route::get('/organizacion-config', [OrganizacionController::class, 'config']);
Route::get('/organizacion', [OrganizacionController::class, 'show']);
Route::post('/organizacion', [OrganizacionController::class, 'store']);
PHP;
}
if (!str_contains($apiSrc, "/clientes") && !str_contains($apiSrc, "'/clientes'")) {
    $apiAdd[] = <<<'PHP'

use App\Http\Controllers\Api\ClienteController;
Route::get('/clientes', [ClienteController::class, 'index']);
PHP;
}
if ($apiAdd) {
    file_put_contents($api, rtrim($apiSrc) . "\n" . implode("\n", $apiAdd) . "\n");
    echo "  · Actualizado routes/api.php\n";
} else {
    echo "  · routes/api.php ya OK\n";
}

$web = $backend . DIRECTORY_SEPARATOR . 'routes' . DIRECTORY_SEPARATOR . 'web.php';
$webSrc = file_get_contents($web) ?: '';

// Quitar TODOS los bloques previos del frontend (duplicados rompen el use)
$webSrc = preg_replace(
    '/\R\/\/ --- Frontend organizacion[\s\S]*?where\(\'path\',\s*\'\^\(\?!api\)\.\*\$\'\);/',
    '',
    $webSrc
);
$webSrc = preg_replace(
    '/\Ruse App\\\\Http\\\\Controllers\\\\FrontendStaticController;[\s\S]*?where\(\'path\',\s*\'\^\(\?!api\)\.\*\$\'\);/',
    '',
    $webSrc
);

$webBlock = <<<'PHP'

// --- Frontend organizacion (mismo origen que la API) ---
use App\Http\Controllers\FrontendStaticController;
Route::get('/', [FrontendStaticController::class, 'home']);
Route::get('/{path}', [FrontendStaticController::class, 'serve'])->where('path', '^(?!api).*$');
PHP;

file_put_contents($web, rtrim($webSrc) . "\n" . $webBlock . "\n");
echo "  · routes/web.php: un solo bloque frontend\n";

$live = $root . DIRECTORY_SEPARATOR . 'data' . DIRECTORY_SEPARATOR . 'organizacion-live.json';
$respaldo = $root . DIRECTORY_SEPARATOR . 'data' . DIRECTORY_SEPARATOR . 'organizacion-respaldo-2026-07-17.json';
if (!is_file($live) && is_file($respaldo)) {
    copy($respaldo, $live);
    echo "  · data/organizacion-live.json desde respaldo 2026-07-17\n";
}

// Sesión en archivo = el HTML no necesita MySQL
$envPath = $backend . DIRECTORY_SEPARATOR . '.env';
if (is_file($envPath)) {
    $env = file_get_contents($envPath);
    $orig = $env;
    if (preg_match('/^SESSION_DRIVER=.*/m', $env)) {
        $env = preg_replace('/^SESSION_DRIVER=.*/m', 'SESSION_DRIVER=file', $env);
    } else {
        $env .= "\nSESSION_DRIVER=file\n";
    }
    // Evitar que el driver de caché/cola toque MySQL al servir HTML
    if (preg_match('/^CACHE_STORE=.*/m', $env)) {
        $env = preg_replace('/^CACHE_STORE=.*/m', 'CACHE_STORE=file', $env);
    } elseif (preg_match('/^CACHE_DRIVER=.*/m', $env)) {
        $env = preg_replace('/^CACHE_DRIVER=.*/m', 'CACHE_DRIVER=file', $env);
    }
    if ($env !== $orig) {
        file_put_contents($envPath, $env);
        echo "  · backend/.env: SESSION_DRIVER=file\n";
    } else {
        echo "  · backend/.env sesión OK\n";
    }
}

echo "\nListo. Un solo servidor:\n";
echo "  php artisan serve\n";
echo "  http://127.0.0.1:8000/index.html?disco=1\n";
echo "  http://127.0.0.1:8000/api/clientes  ← requiere MySQL VERDE en Laragon\n";
echo "\nSi cambiaste .env, en backend ejecuta: php artisan config:clear\n";
