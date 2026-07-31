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
$method = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');

/**
 * POST /api/cliente-logo — guarda PNG/JPG/WebP del logo de un cliente en identidad/.
 * Body JSON: { slug: "impresoreando", dataUrl: "data:image/png;base64,…" }
 */
if ($uri === '/api/cliente-logo') {
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    if ($method !== 'POST') {
        http_response_code(405);
        echo json_encode(['error' => 'método no permitido'], JSON_UNESCAPED_UNICODE);
        return true;
    }
    $raw = file_get_contents('php://input') ?: '';
    if (strlen($raw) > 12 * 1024 * 1024) {
        http_response_code(413);
        echo json_encode(['error' => 'cuerpo demasiado grande'], JSON_UNESCAPED_UNICODE);
        return true;
    }
    $obj = json_decode($raw, true);
    if (!is_array($obj)) {
        http_response_code(400);
        echo json_encode(['error' => 'JSON inválido'], JSON_UNESCAPED_UNICODE);
        return true;
    }
    $slug = preg_replace('/[^a-z0-9\-]/', '', strtolower((string) ($obj['slug'] ?? ''))) ?: '';
    $dataUrl = (string) ($obj['dataUrl'] ?? '');
    $allowed = ['impresoreando'];
    if (!in_array($slug, $allowed, true)) {
        http_response_code(400);
        echo json_encode(['error' => 'slug no permitido'], JSON_UNESCAPED_UNICODE);
        return true;
    }
    if (!preg_match('#^data:(image/(png|jpeg|jpg|webp));base64,(.+)$#i', $dataUrl, $m)) {
        http_response_code(400);
        echo json_encode(['error' => 'dataUrl de imagen no válida'], JSON_UNESCAPED_UNICODE);
        return true;
    }
    $mime = strtolower($m[1]);
    $ext = str_contains($mime, 'png') ? 'png' : (str_contains($mime, 'webp') ? 'webp' : 'jpg');
    $bin = base64_decode($m[3], true);
    if ($bin === false || strlen($bin) < 32 || strlen($bin) > 8 * 1024 * 1024) {
        http_response_code(400);
        echo json_encode(['error' => 'imagen inválida o demasiado grande'], JSON_UNESCAPED_UNICODE);
        return true;
    }
    $dir = $root . DIRECTORY_SEPARATOR . 'index' . DIRECTORY_SEPARATOR . 'clientes'
        . DIRECTORY_SEPARATOR . $slug . DIRECTORY_SEPARATOR . 'identidad';
    if (!is_dir($dir)) {
        mkdir($dir, 0775, true);
    }
    $stamp = date('YmdHis');
    $fileName = 'logo-ui-custom-' . $stamp . '.' . $ext;
    $abs = $dir . DIRECTORY_SEPARATOR . $fileName;
    file_put_contents($abs, $bin);
    // Copia estable para referencias fijas
    $stable = $dir . DIRECTORY_SEPARATOR . 'logo-ui-custom.' . $ext;
    file_put_contents($stable, $bin);
    $url = '/index/clientes/' . $slug . '/identidad/' . $fileName;
    echo json_encode([
        'ok' => true,
        'url' => $url,
        'stableUrl' => '/index/clientes/' . $slug . '/identidad/logo-ui-custom.' . $ext . '?v=' . $stamp,
        'bytes' => strlen($bin),
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    return true;
}

/**
 * API Impresoreando (live JSON) — antes de Laravel, para que el panel no dependa de rutas artisan.
 */
if ($uri === '/api/impresoreando' || $uri === '/api/impresoreando/venta') {
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');

    $live = $root . DIRECTORY_SEPARATOR . 'data' . DIRECTORY_SEPARATOR . 'impresoreando-live.json';
    $seed = $root . DIRECTORY_SEPARATOR . 'data' . DIRECTORY_SEPARATOR . 'impresoreando-seed.json';

    $ensureLive = static function () use ($live, $seed): void {
        if (is_file($live)) {
            return;
        }
        if (!is_file($seed)) {
            http_response_code(500);
            echo json_encode(['error' => 'Falta data/impresoreando-seed.json'], JSON_UNESCAPED_UNICODE);
            exit;
        }
        $dir = dirname($live);
        if (!is_dir($dir)) {
            mkdir($dir, 0775, true);
        }
        copy($seed, $live);
    };

    $readLive = static function () use ($ensureLive, $live): array {
        $ensureLive();
        $raw = file_get_contents($live);
        $data = json_decode($raw ?: '', true);
        if (!is_array($data)) {
            http_response_code(500);
            echo json_encode(['error' => 'impresoreando-live.json inválido'], JSON_UNESCAPED_UNICODE);
            exit;
        }
        return $data;
    };

    $writeLive = static function (array $data) use ($live): void {
        if (!isset($data['meta']) || !is_array($data['meta'])) {
            $data['meta'] = [];
        }
        $data['meta']['actualizado'] = date('c');
        $dir = dirname($live);
        if (!is_dir($dir)) {
            mkdir($dir, 0775, true);
        }
        file_put_contents(
            $live,
            json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) . "\n"
        );
    };

    /** Fusiona productos/gastos del seed que falten en live (no pisa existentes). */
    $mergeSeedMissing = static function (array $data) use ($seed): array {
        if (!is_file($seed)) {
            return $data;
        }
        $seedData = json_decode((string) file_get_contents($seed), true);
        if (!is_array($seedData)) {
            return $data;
        }
        $data['productos'] = is_array($data['productos'] ?? null) ? $data['productos'] : [];
        $data['gastos'] = is_array($data['gastos'] ?? null) ? $data['gastos'] : [];
        $prodKeys = [];
        foreach ($data['productos'] as $p) {
            if (!is_array($p)) {
                continue;
            }
            if (!empty($p['id'])) {
                $prodKeys['id:' . $p['id']] = true;
            }
            if (!empty($p['sku'])) {
                $prodKeys['sku:' . strtoupper((string) $p['sku'])] = true;
            }
        }
        foreach ($seedData['productos'] ?? [] as $sp) {
            if (!is_array($sp) || empty($sp['id'])) {
                continue;
            }
            $has =
                (!empty($sp['id']) && isset($prodKeys['id:' . $sp['id']]))
                || (!empty($sp['sku']) && isset($prodKeys['sku:' . strtoupper((string) $sp['sku'])]));
            if (!$has) {
                $data['productos'][] = $sp;
                $prodKeys['id:' . $sp['id']] = true;
                if (!empty($sp['sku'])) {
                    $prodKeys['sku:' . strtoupper((string) $sp['sku'])] = true;
                }
            }
        }
        $gasIds = [];
        foreach ($data['gastos'] as $g) {
            if (is_array($g) && !empty($g['id'])) {
                $gasIds[$g['id']] = true;
            }
        }
        foreach ($seedData['gastos'] ?? [] as $sg) {
            if (!is_array($sg) || empty($sg['id']) || isset($gasIds[$sg['id']])) {
                continue;
            }
            $data['gastos'][] = $sg;
            $gasIds[$sg['id']] = true;
        }
        // Pedidos del seed que falten (por id o número). No pisa existentes.
        $data['pedidos'] = is_array($data['pedidos'] ?? null) ? $data['pedidos'] : [];
        // Solo borra el id viejo de Ele; PED-012 vigente = Marcia limpia brochas.
        $data['pedidos'] = array_values(array_filter(
            $data['pedidos'],
            static fn ($p) => is_array($p) && (($p['id'] ?? '') !== 'ped-ele-pesa-012')
        ));
        $pedKeys = [];
        foreach ($data['pedidos'] as $p) {
            if (!is_array($p)) {
                continue;
            }
            if (!empty($p['id'])) {
                $pedKeys['id:' . $p['id']] = true;
            }
            if (!empty($p['numero'])) {
                $pedKeys['num:' . $p['numero']] = true;
            }
        }
        foreach ($seedData['pedidos'] ?? [] as $sp) {
            if (!is_array($sp) || empty($sp['id'])) {
                continue;
            }
            if (($sp['id'] ?? '') === 'ped-ele-pesa-012') {
                continue;
            }
            $has =
                (!empty($sp['id']) && isset($pedKeys['id:' . $sp['id']]))
                || (!empty($sp['numero']) && isset($pedKeys['num:' . $sp['numero']]));
            if (!$has) {
                $data['pedidos'][] = $sp;
                $pedKeys['id:' . $sp['id']] = true;
                if (!empty($sp['numero'])) {
                    $pedKeys['num:' . $sp['numero']] = true;
                }
            }
        }
        $data['ventas'] = is_array($data['ventas'] ?? null) ? $data['ventas'] : [];
        $venIds = [];
        foreach ($data['ventas'] as $v) {
            if (is_array($v) && !empty($v['id'])) {
                $venIds[$v['id']] = true;
            }
        }
        foreach ($seedData['ventas'] ?? [] as $sv) {
            if (!is_array($sv) || empty($sv['id']) || isset($venIds[$sv['id']])) {
                continue;
            }
            $data['ventas'][] = $sv;
            $venIds[$sv['id']] = true;
        }
        return $data;
    };

    $readBody = static function (): array {
        $raw = file_get_contents('php://input') ?: '';
        $data = json_decode($raw, true);
        return is_array($data) ? $data : [];
    };

    if ($uri === '/api/impresoreando/venta' && $method === 'POST') {
        $item = $readBody();
        if ($item === [] || empty($item['descripcion']) || !isset($item['montoNeto'])) {
            http_response_code(400);
            echo json_encode(['error' => 'faltan descripcion / montoNeto'], JSON_UNESCAPED_UNICODE);
            return true;
        }
        $obj = $mergeSeedMissing($readLive());
        $obj['ventas'] = is_array($obj['ventas'] ?? null) ? $obj['ventas'] : [];
        $venta = [
            'id' => (string) ($item['id'] ?? ('ven-' . base_convert((string) time(), 10, 36))),
            'fecha' => (string) ($item['fecha'] ?? date('Y-m-d')),
            'descripcion' => (string) $item['descripcion'],
            'cantidad' => (float) ($item['cantidad'] ?? 1),
            'montoNeto' => (float) $item['montoNeto'],
            'canal' => (string) ($item['canal'] ?? ''),
            'notas' => (string) ($item['notas'] ?? ''),
            'socioRegistro' => (string) ($item['socioRegistro'] ?? 'Ambos'),
            'cliente' => (string) ($item['cliente'] ?? ''),
        ];
        $obj['ventas'][] = $venta;
        $writeLive($obj);
        $totalVentas = 0.0;
        foreach ($obj['ventas'] as $v) {
            $totalVentas += (float) ($v['montoNeto'] ?? 0);
        }
        $totalGastos = 0.0;
        foreach ($obj['gastos'] ?? [] as $g) {
            $totalGastos += (float) ($g['montoNeto'] ?? 0);
        }
        echo json_encode([
            'ok' => true,
            'venta' => $venta,
            'totales' => [
                'ventas' => $totalVentas,
                'gastos' => $totalGastos,
                'saldo' => max(0, $totalGastos - $totalVentas),
            ],
            'actualizado' => $obj['meta']['actualizado'] ?? null,
        ], JSON_UNESCAPED_UNICODE);
        return true;
    }

    if ($uri === '/api/impresoreando' && $method === 'GET') {
        $data = $mergeSeedMissing($readLive());
        $writeLive($data);
        echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        return true;
    }

    if ($uri === '/api/impresoreando' && $method === 'POST') {
        $data = $readBody();
        if ($data === [] || !isset($data['gastos']) || !is_array($data['gastos'])) {
            http_response_code(400);
            echo json_encode(['error' => 'faltan gastos[] (estructura Impresoreando)'], JSON_UNESCAPED_UNICODE);
            return true;
        }
        $data = $mergeSeedMissing($data);
        $writeLive($data);
        echo json_encode([
            'ok' => true,
            'path' => 'data/impresoreando-live.json',
            'actualizado' => $data['meta']['actualizado'] ?? null,
        ], JSON_UNESCAPED_UNICODE);
        return true;
    }

    http_response_code(405);
    echo json_encode(['error' => 'método no permitido'], JSON_UNESCAPED_UNICODE);
    return true;
}

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
