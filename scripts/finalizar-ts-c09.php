<?php
/**
 * Cierra Contenido 9/12 Trendseeker completo:
 *   1) Prompt Gemini · 2) Copys · 3) Programar · + madre
 *
 *   php scripts/finalizar-ts-c09.php
 *   (o FINALIZAR-TS-C09.bat)
 *
 * Luego: http://127.0.0.1:8000/index.html?disco=1&tarea=trendseeker/13
 */

$root = dirname(__DIR__);
$live = $root . DIRECTORY_SEPARATOR . 'data' . DIRECTORY_SEPARATOR . 'organizacion-live.json';

$cierres = [
    'tarea-ts-contenido-9-de-12-prompt' =>
        'FINALIZADO 2026-07-21. Prompt Gemini VIDEO entregado (Play bajas rojo · multi-toma · cielo gris · A/B/C/D).',
    'tarea-ts-contenido-9-de-12-copy' =>
        'FINALIZADO 2026-07-21. Copy elegida C (checklist + contexto/emojis + CTA 50% OFF). TXT: index/clientes/trendseeker/copys/COPY-c09-play-bajas-rojo-mujer-C.txt',
    'tarea-ts-contenido-9-de-12-programar' =>
        'FINALIZADO 2026-07-21. Contenido C9/12 programado (video + copy C + link producto Play bajas rojo mujer).',
    'tarea-ts-contenido-9-de-12' =>
        'FINALIZADO 2026-07-21. Contenido 9/12 cerrado: prompt + video + copy C + programado. Producto: Botas Play Bajas Rojo Mujer · SKU WFS2020RMA-LRD.',
];

if (!is_file($live)) {
    fwrite(STDERR, "No existe data/organizacion-live.json\n");
    fwrite(STDERR, "Arranca ABRIR-LARAVEL.bat primero.\n");
    exit(1);
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

$porId = [];
foreach ($data['tareas'] as $i => $t) {
    if (isset($t['id'])) {
        $porId[$t['id']] = $i;
    }
}

$faltantes = [];
foreach (array_keys($cierres) as $id) {
    if (!isset($porId[$id])) {
        $faltantes[] = $id;
    }
}
if ($faltantes) {
    fwrite(STDERR, "Faltan tareas en el live:\n  - " . implode("\n  - ", $faltantes) . "\n");
    exit(1);
}

foreach ($cierres as $id => $notas) {
    $i = $porId[$id];
    $data['tareas'][$i]['completada'] = true;
    $data['tareas'][$i]['pendiente'] = false;
    $data['tareas'][$i]['notas'] = $notas;
    $titulo = $data['tareas'][$i]['titulo'] ?? $id;
    $num = $data['tareas'][$i]['numeroHistorico'] ?? '?';
    echo "Cerrada: {$titulo} #{$num}\n";
}

$data['respaldoActualizado'] = date('Y-m-d');
$json = json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
if ($json === false || file_put_contents($live, $json . "\n") === false) {
    fwrite(STDERR, "No se pudo guardar data/organizacion-live.json\n");
    exit(1);
}

echo "\nMadre C9/12 + subtareas cerradas.\n";
echo "Guardado en data/organizacion-live.json\n";
echo "Abre http://127.0.0.1:8000/index.html?disco=1&tarea=trendseeker/13\n";
