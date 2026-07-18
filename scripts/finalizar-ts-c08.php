<?php
/**
 * Cierra Contenido 8/12 Trendseeker completo:
 *   1) Prompt Gemini · 2) Copys · 3) Programar · + madre
 *
 *   php scripts/finalizar-ts-c08.php
 *   (o doble clic en FINALIZAR-TS-C08.bat)
 *
 * Luego: http://127.0.0.1:8000/index.html?disco=1&tarea=trendseeker/09
 */

$root = dirname(__DIR__);
$live = $root . DIRECTORY_SEPARATOR . 'data' . DIRECTORY_SEPARATOR . 'organizacion-live.json';
$madreId = 'tarea-ts-contenido-8-de-12';

$cierres = [
    'tarea-ts-contenido-8-de-12-prompt' =>
        'FINALIZADO 2026-07-18. Prompt Gemini VIDEO entregado (Chelsea Commando · invierno con lluvia · A/B/C). Video generado.',
    'tarea-ts-contenido-8-de-12-copy' =>
        'FINALIZADO 2026-07-18. Copy elegida y guardada en COPY-c08-chelsea-commando-negras-mujer-A.txt (párrafo + checklist + shop). Programada.',
    'tarea-ts-contenido-8-de-12-programar' =>
        'FINALIZADO 2026-07-18. Contenido C8/12 programado (video + copy elegida + link producto).',
    'tarea-ts-contenido-8-de-12' =>
        'FINALIZADO 2026-07-18. Contenido 8/12 cerrado: prompt + video + copy elegida + programado. Producto: Chelsea Commando Negras Brillantes Mujer.',
];

if (!is_file($live)) {
    fwrite(STDERR, "No existe data/organizacion-live.json\n");
    fwrite(STDERR, "Cópialo desde tu respaldo o arranca ABRIR-LARAVEL.bat.\n");
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

echo "\nMadre C8/12 + 3 subtareas cerradas.\n";
echo "Guardado en data/organizacion-live.json\n";
echo "Abre http://127.0.0.1:8000/index.html?disco=1&tarea=trendseeker/09\n";
