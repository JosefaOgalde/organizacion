<?php
/**
 * Quita duplicados de FrontendStaticController en backend/routes/web.php
 * Uso: php scripts/reparar-web-php.php
 */
declare(strict_types=1);

$web = dirname(__DIR__) . DIRECTORY_SEPARATOR . 'backend' . DIRECTORY_SEPARATOR . 'routes' . DIRECTORY_SEPARATOR . 'web.php';
if (!is_file($web)) {
    fwrite(STDERR, "ERROR: no existe $web\n");
    exit(1);
}

$src = file_get_contents($web);

// Quitar todos los bloques del frontend unificado
$src = preg_replace(
    '/\R\/\/ --- Frontend organizacion[\s\S]*?where\(\'path\',\s*\'\^\(\?!api\)\.\*\$\'\);/u',
    '',
    $src
);
$src = preg_replace(
    '/\Ruse App\\\\Http\\\\Controllers\\\\FrontendStaticController;[\s\S]*?where\(\'path\',\s*\'\^\(\?!api\)\.\*\$\'\);/u',
    '',
    $src
);

// Por si quedó un use suelto
$src = preg_replace(
    '/\Ruse App\\\\Http\\\\Controllers\\\\FrontendStaticController;\R?/u',
    "\n",
    $src
);

$block = <<<'PHP'

// --- Frontend organizacion (mismo origen que la API) ---
use App\Http\Controllers\FrontendStaticController;
Route::get('/', [FrontendStaticController::class, 'home']);
Route::get('/{path}', [FrontendStaticController::class, 'serve'])->where('path', '^(?!api).*$');
PHP;

$out = rtrim($src) . "\n" . $block . "\n";
file_put_contents($web, $out);

$uses = substr_count($out, 'use App\\Http\\Controllers\\FrontendStaticController;');
echo "Reparando: $web\n";
echo "  use FrontendStaticController aparece $uses vez/veces (debe ser 1)\n";
if ($uses !== 1) {
    fwrite(STDERR, "AVISO: sigue habiendo duplicados — edita web.php a mano\n");
    exit(1);
}
echo "OK\n";
