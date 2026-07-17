<?php
/**
 * Servidor PHP del organizador (sin Node).
 * Uso: php -S localhost:3000 scripts/servir-organizacion.php
 *
 * Sirve archivos estáticos + API mínima:
 *   GET/POST /api/organizacion
 *   GET      /api/organizacion-config
 *   GET      /api/acceso
 *
 * La API de clientes sigue en Laravel: http://127.0.0.1:8000/api/clientes
 */
declare(strict_types=1);

$root = dirname(__DIR__);
$uri = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';
$uri = rawurldecode($uri);
$method = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');

$liveFile = $root . DIRECTORY_SEPARATOR . 'data' . DIRECTORY_SEPARATOR . 'organizacion-live.json';
$respaldoFile = $root . DIRECTORY_SEPARATOR . 'data' . DIRECTORY_SEPARATOR . 'organizacion-respaldo-2026-07-17.json';

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-Organizacion-Token');
if ($method === 'OPTIONS') {
    http_response_code(204);
    exit;
}

function json_out(array $data, int $code = 200): void
{
    http_response_code($code);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function read_json_file(string $path): ?array
{
    if (!is_file($path)) {
        return null;
    }
    $raw = file_get_contents($path);
    if ($raw === false || $raw === '') {
        return null;
    }
    $data = json_decode($raw, true);
    return is_array($data) ? $data : null;
}

if ($uri === '/api/acceso' || str_starts_with($uri, '/api/acceso/')) {
    json_out([
        'ok' => true,
        'servidor' => 'php',
        'host' => $_SERVER['SERVER_NAME'] ?? 'localhost',
        'port' => (int) ($_SERVER['SERVER_PORT'] ?? 3000),
        'laravel' => 'http://127.0.0.1:8000',
        'lan' => [],
    ]);
}

if ($uri === '/api/organizacion-config' || str_starts_with($uri, '/api/organizacion-config/')) {
    json_out([
        'ok' => true,
        'servidor' => 'php',
        'live' => is_file($liveFile),
        'respaldo' => is_file($respaldoFile),
        'laravelApi' => 'http://127.0.0.1:8000/api/clientes',
    ]);
}

if ($uri === '/api/organizacion' || $uri === '/api/organizacion/') {
    if ($method === 'GET') {
        $data = read_json_file($liveFile) ?? read_json_file($respaldoFile);
        if (!$data) {
            json_out(['error' => 'Sin datos. Copia el respaldo a data/organizacion-live.json'], 404);
        }
        json_out($data);
    }
    if ($method === 'POST') {
        $raw = file_get_contents('php://input');
        $data = json_decode($raw ?: '', true);
        if (!is_array($data) || !isset($data['clientes'], $data['tareas'])) {
            json_out(['error' => 'JSON inválido: faltan clientes[] o tareas[]'], 400);
        }
        if (!is_dir(dirname($liveFile))) {
            mkdir(dirname($liveFile), 0775, true);
        }
        $data['respaldoActualizado'] = $data['respaldoActualizado'] ?? date('Y-m-d');
        $ok = file_put_contents(
            $liveFile,
            json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)
        );
        if ($ok === false) {
            json_out(['error' => 'No se pudo guardar'], 500);
        }
        json_out(['ok' => true, 'tareas' => count($data['tareas']), 'clientes' => count($data['clientes'])]);
    }
    json_out(['error' => 'Método no permitido'], 405);
}

// Estáticos
$file = $uri === '/' ? '/index.html' : $uri;
$path = realpath($root . str_replace('/', DIRECTORY_SEPARATOR, $file));
$rootReal = realpath($root);

if ($path === false || $rootReal === false || !str_starts_with($path, $rootReal)) {
    http_response_code(404);
    echo '404';
    exit;
}

$deny = ['\\.git', 'backend', 'node_modules', '\\.env', 'organizacion-live\\.json', 'impresoreando-live\\.json'];
$rel = substr($path, strlen($rootReal) + 1);
foreach ($deny as $d) {
    if (preg_match('#' . $d . '#i', $rel)) {
        http_response_code(403);
        echo '403';
        exit;
    }
}

if (is_dir($path)) {
    $index = $path . DIRECTORY_SEPARATOR . 'index.html';
    if (is_file($index)) {
        $path = $index;
    } else {
        http_response_code(404);
        echo '404';
        exit;
    }
}

$ext = strtolower(pathinfo($path, PATHINFO_EXTENSION));
$mime = [
    'html' => 'text/html; charset=utf-8',
    'js' => 'text/javascript; charset=utf-8',
    'css' => 'text/css; charset=utf-8',
    'json' => 'application/json; charset=utf-8',
    'png' => 'image/png',
    'jpg' => 'image/jpeg',
    'jpeg' => 'image/jpeg',
    'gif' => 'image/gif',
    'webp' => 'image/webp',
    'svg' => 'image/svg+xml',
    'ico' => 'image/x-icon',
    'txt' => 'text/plain; charset=utf-8',
    'md' => 'text/markdown; charset=utf-8',
    'mp4' => 'video/mp4',
    'webm' => 'video/webm',
    'docx' => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'pdf' => 'application/pdf',
][$ext] ?? 'application/octet-stream';

header('Content-Type: ' . $mime);
readfile($path);
return true;
