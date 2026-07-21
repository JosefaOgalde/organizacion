<?php
/**
 * Joyas Mercury — asegura tarea #22: 3 círculos colecciones HOME (Elementor Free, sin CSS).
 *
 * Lo llama ABRIR-LARAVEL.bat (PHP, sin Node).
 * Luego: http://127.0.0.1:8000/index.html?disco=1&tarea=joyas-mercury/22
 */

$root = dirname(__DIR__);
$live = $root . DIRECTORY_SEPARATOR . 'data' . DIRECTORY_SEPARATOR . 'organizacion-live.json';

if (!is_file($live)) {
    fwrite(STDERR, "No existe data/organizacion-live.json — se omite JM círculos.\n");
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

$id = 'tarea-jm-home-circulos-elementor-free';
$num = '22';
$fecha = '2026-07-21';
$guia = 'index/clientes/joyasmercury/HOME-CIRCULOS-ELEMENTOR-FREE.md';

$notas = 'Home joyasmercury.cl: configurar los 3 círculos de colecciones (Esencial · Gold · Deluxe) SOLO con Elementor Free (radio 50%, contenedores, imágenes 1:1, links). '
    . 'NO usar CSS adicional de Apariencia → Personalizar para estos círculos: el CSS se desconfigura a los 1–2 días. '
    . "Guía paso a paso: {$guia} "
    . 'Validar desktop + móvil tras publicar. Al terminar → marcar hecha.';

$tarea = [
    'id' => $id,
    'titulo' => '[JM] Home · 3 círculos colecciones (Elementor Free, sin CSS)',
    'clienteId' => 'cli-joyas-mercury',
    'rolId' => 'rol-jm-dev',
    'fecha' => $fecha,
    'horaInicio' => '10:00',
    'horaFin' => '13:00',
    'notas' => $notas,
    'prioridad' => 'alta',
    'completada' => false,
    'pendiente' => false,
    'numeroHistorico' => $num,
    'tipoEntregable' => 'jm-elementor-home-circulos',
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
    echo "  · JM: creada tarea #{$num} círculos Elementor Free ({$fecha})\n";
} else {
    // Conservar completada si ya la marcaron hecha
    $prev = $data['tareas'][$idx];
    if (!empty($prev['completada'])) {
        $tarea['completada'] = true;
        $tarea['pendiente'] = false;
    }
    $data['tareas'][$idx] = array_merge($prev, $tarea);
    echo "  · JM: actualizada tarea #{$num} círculos Elementor Free ({$fecha})\n";
}

$data['respaldoActualizado'] = date('Y-m-d');
$json = json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
if ($json === false || file_put_contents($live, $json . "\n") === false) {
    fwrite(STDERR, "No se pudo guardar data/organizacion-live.json\n");
    exit(1);
}
