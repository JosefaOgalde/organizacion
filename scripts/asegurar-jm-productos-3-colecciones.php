<?php
/**
 * Joyas Mercury — asegura tarea: revisar productos visibles en 3 landings.
 *
 * Lo llama ABRIR-LARAVEL.bat (PHP, sin Node).
 * Luego: http://127.0.0.1:8000/index.html?disco=1&tarea=joyas-mercury/23
 */

$root = dirname(__DIR__);
$live = $root . DIRECTORY_SEPARATOR . 'data' . DIRECTORY_SEPARATOR . 'organizacion-live.json';

if (!is_file($live)) {
    fwrite(STDERR, "No existe data/organizacion-live.json — se omite JM #23.\n");
    exit(0);
}

$raw = file_get_contents($live);
$data = json_decode($raw ?: '', true);
if (!is_array($data)) {
    fwrite(STDERR, "JSON inválido en data/organizacion-live.json\n");
    exit(1);
}

if (!isset($data['tareas']) || !is_array($data['tareas'])) {
    $data['tareas'] = [];
}

$id = 'tarea-jm-productos-visibles-3-colecciones';
$num = '23';
$fecha = '2026-07-21';
$guia = 'index/clientes/joyasmercury/CHECKLIST-PRODUCTOS-3-COLECCIONES.md';

$notas = 'Camila (audio 21-07): en admin ve productos OK; en tienda online faltan (Esencial: +15 anillos → ~3). '
    . 'Revisar las 3 landings Esencial · Gold · Deluxe: Total Products Elementor, query, clases jm-catalogo-*, slugs Woo vs CSS. '
    . "Checklist: {$guia}";

$tarea = [
    'id' => $id,
    'titulo' => '[JM] Landings · productos no visibles (Esencial · Gold · Deluxe)',
    'clienteId' => 'cli-joyas-mercury',
    'rolId' => 'rol-jm-dev',
    'fecha' => $fecha,
    'horaInicio' => '15:00',
    'horaFin' => '18:00',
    'notas' => $notas,
    'prioridad' => 'alta',
    'completada' => false,
    'pendiente' => false,
    'numeroHistorico' => $num,
    'tipoEntregable' => 'jm-landings-visibilidad',
    'entregableArchivo' => $guia,
    'agendaFijada' => true,
    'parentId' => null,
    'estadoFijado' => true,
];

$idx = null;
foreach ($data['tareas'] as $i => $t) {
    if (($t['id'] ?? '') === $id) {
        $idx = $i;
        break;
    }
}

if ($idx === null) {
    $data['tareas'][] = $tarea;
    echo "  · JM: creada tarea #{$num} productos visibles 3 colecciones\n";
} else {
    $prev = $data['tareas'][$idx];
    if (!empty($prev['completada'])) {
        $tarea['completada'] = true;
        $tarea['pendiente'] = false;
    }
    $data['tareas'][$idx] = array_merge($prev, $tarea);
    echo "  · JM: actualizada tarea #{$num} productos visibles 3 colecciones\n";
}

$data['respaldoActualizado'] = date('Y-m-d');
$json = json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
if ($json === false || file_put_contents($live, $json . "\n") === false) {
    fwrite(STDERR, "No se pudo guardar data/organizacion-live.json\n");
    exit(1);
}
