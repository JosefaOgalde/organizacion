<?php
/**
 * Servidor único :8000 — estáticos del repo + API Laravel.
 *
 * Uso (desde la raíz organizacion/):
 *   php -S 0.0.0.0:8000 scripts/servidor-unificado-8000.php
 *   (0.0.0.0 = localhost + celular en la misma WiFi; 127.0.0.1 = solo esta PC)
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
                continue;
            }
            // Propagar anulado / transferido desde seed → live (no dejar PED-007 en listo).
            $seedEstado = (string) ($sp['estado'] ?? '');
            if ($seedEstado !== 'anulado' && $seedEstado !== 'transferido') {
                continue;
            }
            foreach ($data['pedidos'] as &$lp) {
                if (!is_array($lp)) {
                    continue;
                }
                $same =
                    (!empty($sp['id']) && ($lp['id'] ?? '') === $sp['id'])
                    || (!empty($sp['numero']) && ($lp['numero'] ?? '') === $sp['numero']);
                if (!$same) {
                    continue;
                }
                $liveEstado = (string) ($lp['estado'] ?? '');
                if ($liveEstado === 'transferido' && $seedEstado === 'anulado') {
                    break;
                }
                if ($liveEstado === $seedEstado && $seedEstado === 'anulado') {
                    // Asegurar notas/filamento limpios aunque ya diga anulado.
                    if (!empty($sp['notas'])) {
                        $lp['notas'] = $sp['notas'];
                    }
                    if (!empty($sp['anuladoEn'])) {
                        $lp['anuladoEn'] = $sp['anuladoEn'];
                    }
                    if (isset($sp['items']) && is_array($sp['items'])) {
                        $lp['items'] = $sp['items'];
                    }
                    $lp['ventaId'] = null;
                    break;
                }
                if ($liveEstado !== $seedEstado) {
                    $lp['estado'] = $seedEstado;
                    if ($seedEstado === 'anulado') {
                        $lp['ventaId'] = null;
                        if (!empty($sp['anuladoEn'])) {
                            $lp['anuladoEn'] = $sp['anuladoEn'];
                        }
                        if (!empty($sp['notas'])) {
                            $lp['notas'] = $sp['notas'];
                        }
                        if (isset($sp['items']) && is_array($sp['items'])) {
                            $lp['items'] = $sp['items'];
                        }
                    }
                    if ($seedEstado === 'transferido') {
                        if (!empty($sp['ventaId'])) {
                            $lp['ventaId'] = $sp['ventaId'];
                        }
                        if (!empty($sp['transferidoEn'])) {
                            $lp['transferidoEn'] = $sp['transferidoEn'];
                        }
                        if (!empty($sp['notas'])) {
                            $lp['notas'] = $sp['notas'];
                        }
                        if (isset($sp['montoNeto'])) {
                            $lp['montoNeto'] = $sp['montoNeto'];
                        }
                    }
                }
                break;
            }
            unset($lp);
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
        // Hard-fix: PED-007 Torreón siempre anulado (live viejos quedaban en listo).
        $data['pedidos'] = is_array($data['pedidos'] ?? null) ? $data['pedidos'] : [];
        foreach ($data['pedidos'] as &$p007) {
            if (!is_array($p007)) {
                continue;
            }
            if (($p007['numero'] ?? '') !== 'PED-007' && ($p007['id'] ?? '') !== 'ped-juan-torreon-007') {
                continue;
            }
            if (($p007['estado'] ?? '') === 'transferido') {
                break;
            }
            $p007['estado'] = 'anulado';
            $p007['ventaId'] = null;
            $p007['anuladoEn'] = $p007['anuladoEn'] ?? date('c');
            $p007['notas'] = '1× Torreón · ANULADO · costo estimado $3.293,48 · PVP sugerido $6.500';
            if (isset($p007['items']) && is_array($p007['items'])) {
                foreach ($p007['items'] as &$it007) {
                    if (!is_array($it007)) {
                        continue;
                    }
                    $it007['estado'] = 'anulado';
                    $it007['filamento'] = 'PLA color';
                }
                unset($it007);
            }
            break;
        }
        unset($p007);
        // Hard-fix: PED-008 Juan MKOF Bob → venta I000019 (ya no fiado).
        foreach ($data['pedidos'] as &$p008) {
            if (!is_array($p008)) {
                continue;
            }
            if (($p008['numero'] ?? '') !== 'PED-008' && ($p008['id'] ?? '') !== 'ped-juan-bob-008') {
                continue;
            }
            $p008['estado'] = 'transferido';
            $p008['fiado'] = false;
            unset($p008['fechaPagoEsperada']);
            $p008['ventaId'] = 'ven-juan-bob-019';
            $p008['transferidoEn'] = $p008['transferidoEn'] ?? date('c');
            $p008['montoNeto'] = 7000;
            $p008['montoBruto'] = 7000;
            $p008['notas'] = '1× Porta Bob Esponja · transferido a venta I000019 · pagado $7.000 · MKOF (Josefa)';
            break;
        }
        unset($p008);
        $data['ventas'] = is_array($data['ventas'] ?? null) ? $data['ventas'] : [];
        $has019 = false;
        foreach ($data['ventas'] as $v019) {
            if (is_array($v019) && (($v019['id'] ?? '') === 'ven-juan-bob-019' || ($v019['codigo'] ?? '') === 'I000019')) {
                $has019 = true;
                break;
            }
        }
        if (!$has019) {
            $data['ventas'][] = [
                'id' => 'ven-juan-bob-019',
                'codigo' => 'I000019',
                'fecha' => '2026-07-31',
                'cliente' => 'Juan MKOF',
                'clienteNombre' => 'Juan',
                'clienteOrigen' => 'MKOF',
                'descripcion' => 'PED-008 · 1× Porta Bob Esponja · Juan MKOF',
                'cantidad' => 1,
                'montoBruto' => 7000,
                'descuentoClp' => 0,
                'montoNeto' => 7000,
                'costoTotal' => 998.17,
                'canal' => 'WhatsApp',
                'notas' => 'Transferido desde PED-008 · fiado cobrado · 1× Porta Bob Esponja · pagado $7.000',
                'socioRegistro' => 'Ambos',
                'pedidoId' => 'ped-juan-bob-008',
                'pedidoNumero' => 'PED-008',
                'items' => [
                    [
                        'sku' => 'PTBOBES001',
                        'nombre' => 'Porta Bob Esponja',
                        'cantidad' => 1,
                        'precioUnitarioClp' => 7000,
                        'costoUnitarioClp' => 998.17,
                        'filamento' => 'multicolor',
                    ],
                ],
            ];
        }
        // Hard-force: PED-013 Mel MKOF soporte → venta I000020 (ya no fiado).
        foreach ($data['pedidos'] as &$p013) {
            if (!is_array($p013)) {
                continue;
            }
            if (($p013['numero'] ?? '') !== 'PED-013' && ($p013['id'] ?? '') !== 'ped-mel-soporte-013') {
                continue;
            }
            $p013['estado'] = 'transferido';
            $p013['fiado'] = false;
            unset($p013['fechaPagoEsperada']);
            $p013['ventaId'] = 'ven-mel-soporte-020';
            $p013['transferidoEn'] = $p013['transferidoEn'] ?? date('c');
            $p013['montoNeto'] = 4000;
            $p013['montoBruto'] = 4000;
            $p013['notas'] = '1× Soporte celular negro · transferido a venta I000020 · pagado $4.000 · MKOF (Josefa)';
            break;
        }
        unset($p013);
        $has020 = false;
        foreach ($data['ventas'] as $v020) {
            if (is_array($v020) && (($v020['id'] ?? '') === 'ven-mel-soporte-020' || ($v020['codigo'] ?? '') === 'I000020')) {
                $has020 = true;
                break;
            }
        }
        if (!$has020) {
            $data['ventas'][] = [
                'id' => 'ven-mel-soporte-020',
                'codigo' => 'I000020',
                'fecha' => '2026-07-31',
                'cliente' => 'Mel MKOF',
                'clienteNombre' => 'Mel',
                'clienteOrigen' => 'MKOF',
                'descripcion' => 'PED-013 · 1× Soporte celular negro · Mel MKOF',
                'cantidad' => 1,
                'montoBruto' => 4000,
                'descuentoClp' => 0,
                'montoNeto' => 4000,
                'costoTotal' => 683.69,
                'canal' => 'WhatsApp',
                'notas' => 'Transferido desde PED-013 · fiado cobrado · 1× Soporte celular negro · pagado $4.000',
                'socioRegistro' => 'Ambos',
                'pedidoId' => 'ped-mel-soporte-013',
                'pedidoNumero' => 'PED-013',
                'items' => [
                    [
                        'sku' => 'SOPCEL001',
                        'nombre' => 'Soporte celular',
                        'cantidad' => 1,
                        'precioUnitarioClp' => 4000,
                        'costoUnitarioClp' => 683.69,
                        'filamento' => 'PLA+ negro',
                    ],
                ],
            ];
        }
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

// --- Estrategia redes Impresoreando (HTML embebido: nunca página en blanco) ---
$impRedesUris = [
    '/index/clientes/impresoreando/estrategia-redes.html',
    '/index/clientes/impresoreando/redes',
    '/index/clientes/impresoreando/redes/',
    '/index/clientes/impresoreando/redes/index.html',
    '/index/clientes/impresoreando/panel/estrategia.html',
];
if (in_array($uri, $impRedesUris, true)) {
    $lib = $root . DIRECTORY_SEPARATOR . 'scripts' . DIRECTORY_SEPARATOR . 'lib' . DIRECTORY_SEPARATOR . 'imp-estrategia-redes-page.php';
    if (is_file($lib)) {
        require_once $lib;
        header('Content-Type: text/html; charset=utf-8');
        header('Cache-Control: no-store, no-cache, must-revalidate');
        echo imp_estrategia_redes_html();
        return true;
    }
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
header('Cache-Control: no-store, no-cache, must-revalidate');

// Panel Impresoreando viejo (sin pestaña Redes): inyectar enlace a la estrategia.
$isImpPanelIndex =
    str_ends_with($fullNorm, '/index/clientes/impresoreando/panel/index.html')
    || str_ends_with($relFromRoot, 'index/clientes/impresoreando/panel/index.html');
if ($isImpPanelIndex && $ext === 'html') {
    $html = (string) file_get_contents($full);
    if ($html !== '' && !str_contains($html, 'data-tab="redes"') && !str_contains($html, 'estrategia.html')) {
        $tabHtml = '<a class="imp-tab--redes" href="./estrategia.html?v=srv-redes-1" style="display:inline-flex;align-items:center;padding:0.45rem 0.8rem;border-radius:999px;border:1px solid #5a8f7b;background:#eef7f2;color:#2f5c4a;font-weight:700;text-decoration:none">Redes sociales</a>';
        if (str_contains($html, 'data-tab="bitacora"')) {
            $html = preg_replace(
                '/(<button[^>]*data-tab="bitacora"[^>]*>.*?<\/button>)/is',
                '$1' . "\n      " . $tabHtml,
                $html,
                1
            ) ?? $html;
        }
        $btnTop = '<a class="imp-btn" href="./estrategia.html?v=srv-redes-1" style="background:#eef7f2;border-color:#5a8f7b;color:#2f5c4a">Estrategia redes</a>';
        if (str_contains($html, 'id="btn-recargar"')) {
            $html = str_replace(
                '<button type="button" id="btn-recargar"',
                $btnTop . "\n        <button type=\"button\" id=\"btn-recargar\"",
                $html
            );
        }
        echo $html;
        return true;
    }
}

readfile($full);
return true;
