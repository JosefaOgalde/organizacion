<?php
/**
 * Restaura PED-001 y PED-002 en Impresoreando + madre del organizador.
 *
 *   php scripts/restaurar-impresoreando-pedidos.php
 *
 * 1) data/impresoreando-live.json ← seed si falta o no tiene pedidos activos
 * 2) data/organizacion-live.json → madre [IMP] Pedidos activos · N + subtareas
 */

$root = dirname(__DIR__);
$impLive = $root . DIRECTORY_SEPARATOR . 'data' . DIRECTORY_SEPARATOR . 'impresoreando-live.json';
$impSeed = $root . DIRECTORY_SEPARATOR . 'data' . DIRECTORY_SEPARATOR . 'impresoreando-seed.json';
$orgLive = $root . DIRECTORY_SEPARATOR . 'data' . DIRECTORY_SEPARATOR . 'organizacion-live.json';

$estadosActivos = ['pendiente', 'listo', 'en_impresion'];
$madreId = 'tarea-imp-pedidos-hoy';
$cliId = 'cli-impresoreando';
$rolId = 'rol-imp-dis';
$fecha = date('Y-m-d');

function readJson(string $path): ?array
{
    if (!is_file($path)) {
        return null;
    }
    $data = json_decode(file_get_contents($path) ?: '', true);
    return is_array($data) ? $data : null;
}

function writeJson(string $path, array $data): void
{
    $json = json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    if ($json === false || file_put_contents($path, $json . "\n") === false) {
        fwrite(STDERR, "No se pudo guardar {$path}\n");
        exit(1);
    }
}

function pedidosActivos(array $imp): array
{
    global $estadosActivos;
    $out = [];
    foreach ($imp['pedidos'] ?? [] as $p) {
        if (!is_array($p)) {
            continue;
        }
        $est = (string) ($p['estado'] ?? '');
        if (in_array($est, $estadosActivos, true)) {
            $out[] = $p;
        }
    }
    return $out;
}

function etiquetaEstado(string $est): string
{
    return match ($est) {
        'en_impresion' => 'en impresión',
        'listo' => 'listo',
        'pendiente' => 'pendiente',
        'transferido' => 'transferido',
        default => $est,
    };
}

function resumenItems(array $ped): string
{
    $parts = [];
    foreach ($ped['items'] ?? [] as $it) {
        $parts[] = ((int) ($it['cantidad'] ?? 1)) . '× ' . ($it['nombre'] ?? $it['sku'] ?? 'ítem');
    }
    return implode(' + ', $parts) ?: 'sin ítems';
}

if (!is_file($impSeed)) {
    fwrite(STDERR, "Falta data/impresoreando-seed.json\n");
    exit(1);
}

$seed = readJson($impSeed);
if (!$seed) {
    fwrite(STDERR, "Seed inválido\n");
    exit(1);
}

$imp = readJson($impLive);
$activos = $imp ? pedidosActivos($imp) : [];

if (!$imp || count($activos) === 0) {
    if (!$imp) {
        copy($impSeed, $impLive);
        echo "Creado impresoreando-live.json desde seed\n";
        $imp = readJson($impLive);
    } else {
        // Live existe pero sin pedidos activos → reinyectar pedidos del seed (no pisa gastos/ventas).
        $imp['pedidos'] = $seed['pedidos'] ?? [];
        $imp['meta'] = $imp['meta'] ?? [];
        $imp['meta']['pedidoSeq'] = max(
            (int) ($imp['meta']['pedidoSeq'] ?? 0),
            (int) ($seed['meta']['pedidoSeq'] ?? 2)
        );
        $imp['meta']['actualizado'] = date('c');
        // Productos del seed si faltan
        if (empty($imp['productos']) && !empty($seed['productos'])) {
            $imp['productos'] = $seed['productos'];
        }
        writeJson($impLive, $imp);
        echo "Pedidos del seed restaurados en impresoreando-live.json\n";
    }
    $activos = pedidosActivos($imp ?: []);
}

echo 'Pedidos activos: ' . count($activos) . "\n";
foreach ($activos as $p) {
    echo '  · ' . ($p['numero'] ?? $p['id']) . ' ' . ($p['cliente'] ?? '') . ' · ' . ($p['estado'] ?? '') . "\n";
}

if (!is_file($orgLive)) {
    fwrite(STDERR, "No existe data/organizacion-live.json — corre ABRIR-LARAVEL.bat primero.\n");
    exit(1);
}

$org = readJson($orgLive);
if (!$org) {
    fwrite(STDERR, "organizacion-live.json inválido\n");
    exit(1);
}
$org['tareas'] = isset($org['tareas']) && is_array($org['tareas']) ? $org['tareas'] : [];
$org['clientes'] = isset($org['clientes']) && is_array($org['clientes']) ? $org['clientes'] : [];

$n = count($activos);
$resumenPed = [];
foreach ($activos as $p) {
    $resumenPed[] = ($p['numero'] ?? '?') . ' ' . ($p['cliente'] ?? '') . ' ' . etiquetaEstado((string) ($p['estado'] ?? ''));
}

$madre = [
    'id' => $madreId,
    'titulo' => '[IMP] Pedidos activos · ' . $n,
    'clienteId' => $cliId,
    'rolId' => $rolId,
    'fecha' => $fecha,
    'fechaFin' => $fecha,
    'horaInicio' => '10:00',
    'horaFin' => '18:00',
    'notas' => 'Panel socios 50/50 · pedidos del live (' . date('c') . '). '
        . 'Abrir panel: /index/clientes/impresoreando/panel/ · Transferir a venta baja la deuda. '
        . implode(' · ', $resumenPed) . '.',
    'prioridad' => 'alta',
    'completada' => false,
    'pendiente' => false,
    'numeroHistorico' => '01',
    'tipoEntregable' => 'ecosistema',
    'parentId' => null,
];

function upsertTarea(array &$org, array $tarea): void
{
    foreach ($org['tareas'] as $i => $t) {
        if (($t['id'] ?? null) === $tarea['id']) {
            $prev = $t;
            $org['tareas'][$i] = array_merge($prev, $tarea, [
                'completada' => !empty($prev['completada']),
            ]);
            echo 'Actualizada: ' . $tarea['titulo'] . "\n";
            return;
        }
    }
    $org['tareas'][] = $tarea;
    echo 'Agregada: ' . $tarea['titulo'] . "\n";
}

// Quitar subtareas viejas de esta madre que ya no estén en activos
$idsHijosKeep = [];
foreach ($activos as $p) {
    $idsHijosKeep[] = 'tarea-imp-' . ($p['id'] ?? '');
}
$org['tareas'] = array_values(array_filter($org['tareas'], function ($t) use ($madreId, $idsHijosKeep) {
    if (($t['parentId'] ?? null) !== $madreId) {
        return true;
    }
    return in_array($t['id'] ?? '', $idsHijosKeep, true);
}));

upsertTarea($org, $madre);

$num = 2;
foreach ($activos as $idx => $p) {
    $pid = (string) ($p['id'] ?? ('ped-' . $idx));
    $numStr = (string) ($p['numero'] ?? ('PED-' . str_pad((string) ($idx + 1), 3, '0', STR_PAD_LEFT)));
    $est = etiquetaEstado((string) ($p['estado'] ?? ''));
    $total = (float) ($p['montoNeto'] ?? 0);
    upsertTarea($org, [
        'id' => 'tarea-imp-' . $pid,
        'titulo' => '[IMP] ' . $numStr . ' ' . ($p['cliente'] ?? '') . ' · ' . resumenItems($p),
        'clienteId' => $cliId,
        'rolId' => $rolId,
        'fecha' => $fecha,
        'horaInicio' => '10:00',
        'horaFin' => '18:00',
        'notas' => 'Estado pedido: ' . $est . '. Total $' . number_format($total, 0, ',', '.') . '. '
            . resumenItems($p) . ' · Panel: /index/clientes/impresoreando/panel/',
        'prioridad' => 'alta',
        'completada' => false,
        'pendiente' => false,
        'numeroHistorico' => str_pad((string) $num, 2, '0', STR_PAD_LEFT),
        'tipoEntregable' => 'pedido',
        'parentId' => $madreId,
        'ordenHijo' => $idx + 1,
        'pedidoId' => $pid,
        'pedidoNumero' => $numStr,
    ]);
    $num++;
}

$org['meta'] = $org['meta'] ?? [];
$nota = 'Impresoreando pedidos sincronizados ' . $fecha . ' → madre ' . $madreId . '.';
$prev = (string) ($org['meta']['nota'] ?? '');
if (strpos($prev, 'Impresoreando pedidos sincronizados ' . $fecha) === false) {
    $org['meta']['nota'] = $prev !== '' ? ($prev . ' · ' . $nota) : $nota;
}
$org['respaldoActualizado'] = date('c');

writeJson($orgLive, $org);

echo "\nOK. Madre: [IMP] Pedidos activos · {$n}\n";
echo "Panel: http://127.0.0.1:8000/index/clientes/impresoreando/panel/\n";
echo "Organizador: http://127.0.0.1:8000/index.html?disco=1&tarea=impresoreando/01\n";
