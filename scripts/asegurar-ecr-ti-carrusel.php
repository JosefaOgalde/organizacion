<?php
/**
 * ECR — asegura subtarea TI Carrusel (NL 1 ago) con entregable de slides.
 *
 * Lo llama ABRIR-LARAVEL.bat (PHP, sin Node).
 * Luego: http://127.0.0.1:8000/index.html?disco=1&tarea=ecr/07
 */

$root = dirname(__DIR__);
$live = $root . DIRECTORY_SEPARATOR . 'data' . DIRECTORY_SEPARATOR . 'organizacion-live.json';
$id = 'tarea-ecr-nl-agosto-carrusel-2026-07-17';
$guia = 'index/clientes/ecr/newsletter/carruseles/CARRUSEL-NL1-ago-tecnologia-sin-integracion.md';

if (!is_file($live)) {
    fwrite(STDERR, "No existe data/organizacion-live.json — se omite ECR carrusel.\n");
    exit(0);
}

$raw = file_get_contents($live);
$data = json_decode($raw ?: '', true);
if (!is_array($data)) {
    fwrite(STDERR, "JSON inválido en data/organizacion-live.json\n");
    exit(1);
}

if (!isset($data['tareas']) || !is_array($data['tareas'])) {
    fwrite(STDERR, "Sin tareas en live — se omite ECR carrusel.\n");
    exit(0);
}

$idx = null;
foreach ($data['tareas'] as $i => $t) {
    if (($t['id'] ?? '') === $id) {
        $idx = $i;
        break;
    }
}

if ($idx === null) {
    fwrite(STDERR, "No está la tarea {$id} en live.\n");
    exit(0);
}

$t = $data['tareas'][$idx];
if (empty($t['completada'])) {
    $t['fecha'] = '2026-07-21';
    $t['horaInicio'] = $t['horaInicio'] ?? '13:00';
    $t['horaFin'] = $t['horaFin'] ?? '15:30';
    $t['entregableArchivo'] = $guia;
    $t['notas'] = 'Carrusel Canva NL1 ago · 8 slides. Textos 2–3 líneas (slides 2–5). '
        . "Guión: {$guia}. Fondos MJ: index/clientes/ecr/newsletter/carruseles/PROMPTS-FONDOS-CUADRADOS-NL1-ago.md "
        . '(slide 6 = solo fondo gradiente teal→naranja para logo ECR + tagline). '
        . 'Slide 6 Canva: logo ECR GROUP® + «Para que te dediques a tu negocio».';
    $t['agendaFijada'] = true;
    $data['tareas'][$idx] = $t;
    echo "  · ECR: actualizada TI — Carrusel #07 → {$guia}\n";
} else {
    echo "  · ECR: TI — Carrusel #07 ya estaba cerrada\n";
}

$data['respaldoActualizado'] = date('Y-m-d');
$json = json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
if ($json === false || file_put_contents($live, $json . "\n") === false) {
    fwrite(STDERR, "No se pudo guardar data/organizacion-live.json\n");
    exit(1);
}
