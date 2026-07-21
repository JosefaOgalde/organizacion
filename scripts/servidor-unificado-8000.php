<?php
/**
 * Servidor único :8000 — estáticos del repo + API Laravel.
 *
 * Uso (desde la raíz organizacion/):
 *   php -S 127.0.0.1:8000 scripts/servidor-unificado-8000.php
 *
 * - /api/*     → backend/public/index.php (Laravel + SQLite)
 * - resto      → archivos del repo (index/, index.html, …) con index.html en carpetas
 */
declare(strict_types=1);

$root = dirname(__DIR__);
$uri = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';
$uri = rawurldecode($uri);

// --- API Laravel ---
if ($uri === '/api' || str_starts_with($uri, '/api/')) {
    $laravelPublic = $root . DIRECTORY_SEPARATOR . 'backend' . DIRECTORY_SEPARATOR . 'public';
    $laravelIndex = $laravelPublic . DIRECTORY_SEPARATOR . 'index.php';
    if (!is_file($laravelIndex)) {
        http_response_code(500);
        header('Content-Type: text/plain; charset=utf-8');
        echo "ERROR: falta backend/public/index.php\n";
        return true;
    }
    chdir($laravelPublic);
    require $laravelIndex;
    return true;
}

// --- Estáticos del repo ---
$rel = $uri === '/' ? 'index.html' : ltrim(str_replace('\\', '/', $uri), '/');
if ($rel === '' || str_ends_with($rel, '/')) {
    $rel = trim($rel, '/') === '' ? 'index.html' : trim($rel, '/') . '/index.html';
}

$candidate = $root . DIRECTORY_SEPARATOR . str_replace('/', DIRECTORY_SEPARATOR, $rel);

// Carpeta sin barra final → index.html
if (is_dir($candidate)) {
    $candidate = rtrim($candidate, '\\/') . DIRECTORY_SEPARATOR . 'index.html';
}

// Sin extensión y no existe como archivo → probar carpeta/index.html o archivo.html
if (!is_file($candidate) && !str_contains(basename($rel), '.')) {
    $asIndex = $root . DIRECTORY_SEPARATOR . str_replace('/', DIRECTORY_SEPARATOR, $rel) . DIRECTORY_SEPARATOR . 'index.html';
    if (is_file($asIndex)) {
        $candidate = $asIndex;
    } else {
        // /index/clientes/Herramientas/Tendencias → Tendencias.html
        $asHtml = $root . DIRECTORY_SEPARATOR . str_replace('/', DIRECTORY_SEPARATOR, $rel) . '.html';
        if (is_file($asHtml)) {
            $candidate = $asHtml;
        }
    }
}

$rootReal = realpath($root);
$full = realpath($candidate);

if ($rootReal === false || $full === false || !is_file($full)) {
    http_response_code(404);
    header('Content-Type: text/plain; charset=utf-8');
    echo "404 Not Found\n";
    echo "path: " . $uri . "\n";
    return true;
}

// Path traversal (case-insensitive en Windows)
$rootNorm = strtolower(str_replace('\\', '/', $rootReal));
$fullNorm = strtolower(str_replace('\\', '/', $full));
if (!str_starts_with($fullNorm, $rootNorm)) {
    http_response_code(403);
    echo "403\n";
    return true;
}

$relFromRoot = ltrim(substr($fullNorm, strlen($rootNorm)), '/');
if (preg_match('#(^|/)\.git(/|$)#', $relFromRoot)
    || preg_match('#(^|/)backend(/|$)#', $relFromRoot)
    || preg_match('#(^|/)node_modules(/|$)#', $relFromRoot)
    || preg_match('#(^|/)\.env$#', $relFromRoot)
    || str_contains($relFromRoot, 'organizacion-live.json')
    || str_contains($relFromRoot, 'impresoreando-live.json')
) {
    http_response_code(403);
    echo "403\n";
    return true;
}

$ext = strtolower(pathinfo($full, PATHINFO_EXTENSION));
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
    'pdf' => 'application/pdf',
    'woff2' => 'font/woff2',
    'docx' => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
][$ext] ?? 'application/octet-stream';

header('Content-Type: ' . $mime);
header('Cache-Control: no-cache');
readfile($full);
return true;
