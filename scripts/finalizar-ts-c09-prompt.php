<?php
/**
 * Cierra la subtarea 1 (Prompt Gemini video) de la madre [TS] Contenido 9/12.
 *
 *   php scripts/finalizar-ts-c09-prompt.php
 *   (o doble clic en FINALIZAR-TS-C09-PROMPT.bat)
 *
 * Luego: http://127.0.0.1:8000/index.html?disco=1&tarea=trendseeker/14
 */

$root = dirname(__DIR__);
$live = $root . DIRECTORY_SEPARATOR . 'data' . DIRECTORY_SEPARATOR . 'organizacion-live.json';
$id = 'tarea-ts-contenido-9-de-12-prompt';
$madreId = 'tarea-ts-contenido-9-de-12';

if (!is_file($live)) {
    fwrite(STDERR, "No existe data/organizacion-live.json\n");
    fwrite(STDERR, "Cópialo desde tu respaldo o arranca ABRIR-LARAVEL.bat (crea live desde el respaldo).\n");
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

$idx = null;
foreach ($data['tareas'] as $i => $t) {
    if (($t['id'] ?? '') === $id) {
        $idx = $i;
        break;
    }
}

if ($idx === null) {
    fwrite(STDERR, "No existe la subtarea {$id}\n");
    fwrite(STDERR, "En el organizador debe existir [TS] C9/12 — Prompt Gemini (video).\n");
    exit(1);
}

$data['tareas'][$idx]['completada'] = true;
$data['tareas'][$idx]['pendiente'] = false;
$data['tareas'][$idx]['notas'] =
    'FINALIZADO 2026-07-21. Prompt Gemini VIDEO entregado (Play bajas rojo · multi-toma modelo→lateral→frontal→zoom · cielo gris · A–D). TXT: index/clientes/trendseeker/prompts/PROMPT-c09-play-bajas-rojo-mujer-{A,B,C,D}.txt · elegida A multi-toma.';

$titulo = $data['tareas'][$idx]['titulo'] ?? $id;
$num = $data['tareas'][$idx]['numeroHistorico'] ?? '?';
echo "Subtarea cerrada: {$titulo} #{$num}\n";

$hijas = array_values(array_filter(
    $data['tareas'],
    static fn($t) => ($t['parentId'] ?? null) === $madreId
));
$hechas = count(array_filter($hijas, static fn($t) => ($t['completada'] ?? false) === true));
$total = count($hijas);
if ($total > 0) {
    $extra = $hechas === $total
        ? ' → puedes finalizar la madre.'
        : ' (quedan Copys y/o Programar).';
    echo "Madre C9/12: {$hechas}/{$total} subtareas hechas{$extra}\n";
}

$data['respaldoActualizado'] = date('Y-m-d');
$json = json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
if ($json === false || file_put_contents($live, $json . "\n") === false) {
    fwrite(STDERR, "No se pudo guardar data/organizacion-live.json\n");
    exit(1);
}

echo "Guardado en data/organizacion-live.json\n";
echo "Abre http://127.0.0.1:8000/index.html?disco=1&tarea=trendseeker/14\n";
