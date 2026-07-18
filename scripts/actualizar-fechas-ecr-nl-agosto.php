<?php
/**
 * ECR — fechas NL agosto (sin Node):
 *   NL 1 (TI) → 2026-08-20
 *   NL 2 (ET) → 2026-08-22
 * Marca Portada NL 1 como hecha (Canva finales).
 *
 *   php scripts/actualizar-fechas-ecr-nl-agosto.php
 * Luego: http://127.0.0.1:8000/index.html?disco=1
 */
declare(strict_types=1);

$root = dirname(__DIR__);
$live = $root . DIRECTORY_SEPARATOR . 'data' . DIRECTORY_SEPARATOR . 'organizacion-live.json';

const FECHA_NL1 = '2026-08-20';
const FECHA_NL2 = '2026-08-22';
const PORTADA_NL1 = 'tarea-ecr-nl-agosto-portada-2026-07-17';
const ENTREGABLE_PORTADA =
    'index/clientes/ecr/newsletter/portadas-guardadas/NL1-ago-portadas-canva-finales.md';

$idsNl1 = [
    'tarea-ecr-ecosistema-nl-agosto-2026-07-17',
    'tarea-ecr-nl-agosto-copys-2026-07-17',
    'tarea-ecr-nl-agosto-portada-2026-07-17',
    'tarea-ecr-nl-agosto-carrusel-2026-07-17',
    'tarea-ecr-nl-agosto-video-2026-07-17',
];
$idsNl2 = [
    'tarea-ecr-ecosistema-equipos-terreno-2026-07-24',
    'tarea-ecr-et-copys-2026-07-24',
    'tarea-ecr-et-portada-2026-07-24',
    'tarea-ecr-et-carrusel-2026-07-24',
    'tarea-ecr-et-video-2026-07-24',
];

if (!is_file($live)) {
    fwrite(STDERR, "ERROR: no existe data/organizacion-live.json\n");
    fwrite(STDERR, "Copia un respaldo a live o abre el organizador una vez con ABRIR-LARAVEL.bat\n");
    exit(1);
}

$raw = file_get_contents($live);
$data = json_decode($raw ?: 'null', true);
if (!is_array($data)) {
    fwrite(STDERR, "ERROR: JSON inválido en organizacion-live.json\n");
    exit(1);
}
if (!isset($data['tareas']) || !is_array($data['tareas'])) {
    $data['tareas'] = [];
}

$byId = [];
foreach ($data['tareas'] as $i => $t) {
    if (!empty($t['id'])) {
        $byId[$t['id']] = $i;
    }
}

$now = (new DateTimeImmutable('now', new DateTimeZone('UTC')))->format('Y-m-d\TH:i:s\Z');

$setFecha = function (string $id, string $fecha, array $extra = []) use (&$data, &$byId): void {
    if (!isset($byId[$id])) {
        fwrite(STDERR, "  (aviso) No encontrada: {$id}\n");
        return;
    }
    $i = $byId[$id];
    $data['tareas'][$i]['fecha'] = $fecha;
    if (empty($data['tareas'][$i]['parentId'])) {
        $data['tareas'][$i]['fechaFin'] = $fecha;
    }
    foreach ($extra as $k => $v) {
        $data['tareas'][$i][$k] = $v;
    }
    $done = !empty($data['tareas'][$i]['completada']) ? ' [x]' : '';
    $titulo = $data['tareas'][$i]['titulo'] ?? $id;
    echo "  {$fecha}  {$titulo}{$done}\n";
};

echo 'NL 1 → ' . FECHA_NL1 . "\n";
foreach ($idsNl1 as $id) {
    $extra = [];
    if ($id === $idsNl1[0]) {
        $extra['articuloPublicacion'] = FECHA_NL1;
    }
    if ($id === PORTADA_NL1) {
        $extra['completada'] = true;
        $extra['pendiente'] = false;
        $extra['completadaEn'] = $now;
        $extra['entregableArchivo'] = ENTREGABLE_PORTADA;
        $extra['notas'] =
            'Portadas Canva FINALES (3) con logo ECR + título. ' .
            'Archivo: NL1-ago-portadas-canva-finales.md · imágenes en nl1-ago-finales/.';
    }
    $setFecha($id, FECHA_NL1, $extra);
}

echo 'NL 2 → ' . FECHA_NL2 . "\n";
foreach ($idsNl2 as $id) {
    $extra = [];
    if ($id === $idsNl2[0]) {
        $extra['articuloPublicacion'] = FECHA_NL2;
    }
    $setFecha($id, FECHA_NL2, $extra);
}

$json = json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
if ($json === false) {
    fwrite(STDERR, "ERROR: no se pudo serializar JSON\n");
    exit(1);
}
file_put_contents($live, $json . "\n");

echo "\nOK · live actualizado (PHP, sin Node).\n";
echo "Abre: http://127.0.0.1:8000/index.html?disco=1\n";
