<?php
/**
 * ECR — asegura subtareas ET Carrusel + Video (NL 2 ago) con entregables.
 *
 * Lo llama ABRIR-LARAVEL.bat (PHP, sin Node).
 * Luego: http://127.0.0.1:8000/index.html?disco=1
 */

$root = dirname(__DIR__);
$live = $root . DIRECTORY_SEPARATOR . 'data' . DIRECTORY_SEPARATOR . 'organizacion-live.json';
$idCarrusel = 'tarea-ecr-et-carrusel-2026-07-24';
$idVideo = 'tarea-ecr-et-video-2026-07-24';
$guiaCarrusel = 'index/clientes/ecr/newsletter/carruseles/CARRUSEL-NL2-ago-equipos-en-terreno.md';
$guiaVideo = 'index/clientes/ecr/newsletter/carruseles/VIDEO-NL2-ago-equipos-en-terreno.md';
$prompts = 'index/clientes/ecr/newsletter/carruseles/PROMPTS-FONDOS-CUADRADOS-NL2-ago.md';

if (!is_file($live)) {
    fwrite(STDERR, "No existe data/organizacion-live.json — se omite ECR NL2 carrusel/video.\n");
    exit(0);
}

$raw = file_get_contents($live);
$data = json_decode($raw ?: '', true);
if (!is_array($data)) {
    fwrite(STDERR, "JSON inválido en data/organizacion-live.json\n");
    exit(1);
}

if (!isset($data['tareas']) || !is_array($data['tareas'])) {
    fwrite(STDERR, "Sin tareas en live — se omite ECR NL2 carrusel/video.\n");
    exit(0);
}

$byId = [];
foreach ($data['tareas'] as $i => $t) {
    if (isset($t['id'])) {
        $byId[$t['id']] = $i;
    }
}

$changed = false;

if (isset($byId[$idCarrusel])) {
    $idx = $byId[$idCarrusel];
    $t = $data['tareas'][$idx];
    if (empty($t['completada'])) {
        $t['entregableArchivo'] = $guiaCarrusel;
        $t['notas'] = 'Carrusel Canva NL2 ago · 8 slides. Textos 2–3 líneas (slides 2–5). '
            . "Guión: {$guiaCarrusel}. Fondos MJ: {$prompts} "
            . '(slide 6 = solo fondo gradiente teal→naranja para logo ECR + tagline). '
            . 'Slide 6 Canva: logo ECR GROUP® + «Para que te dediques a tu negocio».';
        $t['agendaFijada'] = true;
        $data['tareas'][$idx] = $t;
        $changed = true;
        echo "  · ECR: actualizada ET — Carrusel #12 → {$guiaCarrusel}\n";
    } else {
        echo "  · ECR: ET — Carrusel #12 ya estaba cerrada\n";
    }
} else {
    echo "  · ECR: no está la tarea {$idCarrusel} en live\n";
}

if (isset($byId[$idVideo])) {
    $idx = $byId[$idVideo];
    $t = $data['tareas'][$idx];
    if (empty($t['completada'])) {
        $t['entregableArchivo'] = $guiaVideo;
        $t['notas'] = 'Video = carrusel animado NL2 ago · Equipos en terreno. '
            . "Brief: {$guiaVideo}. Partir del guión {$guiaCarrusel}.";
        $t['agendaFijada'] = true;
        $data['tareas'][$idx] = $t;
        $changed = true;
        echo "  · ECR: actualizada ET — Video #13 → {$guiaVideo}\n";
    } else {
        echo "  · ECR: ET — Video #13 ya estaba cerrada\n";
    }
} else {
    echo "  · ECR: no está la tarea {$idVideo} en live\n";
}

if (!$changed) {
    exit(0);
}

$data['respaldoActualizado'] = date('Y-m-d');
$json = json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
if ($json === false || file_put_contents($live, $json . "\n") === false) {
    fwrite(STDERR, "No se pudo guardar data/organizacion-live.json\n");
    exit(1);
}
