<?php
/**
 * Joyas Mercury — cierra tarea #22 (círculos Elementor Free + ajustes home).
 *
 * Lo llama ABRIR-LARAVEL.bat (PHP, sin Node).
 * Luego: http://127.0.0.1:8000/index.html?disco=1&tarea=joyas-mercury/22
 */

$root = dirname(__DIR__);
$live = $root . DIRECTORY_SEPARATOR . 'data' . DIRECTORY_SEPARATOR . 'organizacion-live.json';
$id = 'tarea-jm-home-circulos-elementor-free';

if (!is_file($live)) {
    fwrite(STDERR, "No existe data/organizacion-live.json — se omite cierre JM.\n");
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

$nota = 'FINALIZADO 2026-07-21. Home círculos Esencial/Gold/Deluxe + CSS completo Astra pegado; '
    . 'snippets redundantes desactivados (Marcadores filtro, ULTIMAS-GRID, NOVEDADES dup, HERO-MOBILE); '
    . 'Últimas unidades carrusel swipe (desktop Show 3 / móvil 2); Novedades móvil 2 productos; '
    . 'guía: index/clientes/joyasmercury/HOME-CIRCULOS-ELEMENTOR-FREE.md.';

$idx = null;
foreach ($data['tareas'] as $i => $t) {
    if (($t['id'] ?? '') === $id) {
        $idx = $i;
        break;
    }
}

if ($idx === null) {
    fwrite(STDERR, "No está la tarea {$id} — ABRIR-LARAVEL debe correr antes asegurar-jm-home-circulos.php\n");
    exit(1);
}

$data['tareas'][$idx]['completada'] = true;
$data['tareas'][$idx]['pendiente'] = false;
$data['tareas'][$idx]['notas'] = $nota;
$titulo = $data['tareas'][$idx]['titulo'] ?? $id;
$num = $data['tareas'][$idx]['numeroHistorico'] ?? '22';
echo "  · JM: cerrada tarea #{$num} — {$titulo}\n";

$data['respaldoActualizado'] = date('Y-m-d');
$json = json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
if ($json === false || file_put_contents($live, $json . "\n") === false) {
    fwrite(STDERR, "No se pudo guardar data/organizacion-live.json\n");
    exit(1);
}
