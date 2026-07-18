<?php
/**
 * ECR — mueve NL 1 → 21 jul y NL 2 → 23 jul en TU data/organizacion-live.json
 * (ese archivo no se sube a Git; hay que correr esto en cada PC).
 * Pub LinkedIn: 1 ago / 2 ago.
 *
 * También cierra la subtarea Portada del NL 1.
 *
 *   php scripts/actualizar-fechas-ecr-nl-agosto.php
 *   → recarga http://127.0.0.1:8000/index.html  (Ctrl+F5)
 */
declare(strict_types=1);

$root = dirname(__DIR__);
$live = $root . DIRECTORY_SEPARATOR . 'data' . DIRECTORY_SEPARATOR . 'organizacion-live.json';

const FECHA_NL1 = '2026-07-21';
const FECHA_NL2 = '2026-07-23';
const PUB_NL1 = '2026-08-01';
const PUB_NL2 = '2026-08-02';
const ENTREGABLE_PORTADA =
    'index/clientes/ecr/newsletter/portadas-guardadas/NL1-ago-portadas-canva-finales.md';

if (!is_file($live)) {
    fwrite(STDERR, "ERROR: no existe data/organizacion-live.json en esta PC\n");
    fwrite(STDERR, "Con ABRIR-LARAVEL.bat debería crearse desde el respaldo.\n");
    exit(1);
}

$raw = file_get_contents($live);
$data = json_decode($raw ?: 'null', true);
if (!is_array($data) || !isset($data['tareas']) || !is_array($data['tareas'])) {
    fwrite(STDERR, "ERROR: JSON inválido o sin tareas[]\n");
    exit(1);
}

$now = (new DateTimeImmutable('now', new DateTimeZone('UTC')))->format('Y-m-d\TH:i:s\Z');
$n1 = 0;
$n2 = 0;
$portadaOk = false;

foreach ($data['tareas'] as &$t) {
    if (!is_array($t)) {
        continue;
    }
    $titulo = (string) ($t['titulo'] ?? '');
    $cli = (string) ($t['clienteId'] ?? '');
    $id = (string) ($t['id'] ?? '');

    $esEcr = $cli === 'cli-ecr'
        || str_contains($id, 'ecr')
        || (bool) preg_match('/\[ECR\]/i', $titulo);
    if (!$esEcr) {
        continue;
    }

    $esNl1Madre = (bool) preg_match('/NL\s*1\s*ago/i', $titulo)
        || $id === 'tarea-ecr-ecosistema-nl-agosto-2026-07-17';
    $esTi = (bool) preg_match('/TI\s*[—\-–]/s*/u', $titulo)
        || (bool) preg_match('/tarea-ecr-nl-agosto-/i', $id);

    $esNl2Madre = (bool) preg_match('/NL\s*2\s*ago/i', $titulo)
        || $id === 'tarea-ecr-ecosistema-equipos-terreno-2026-07-24';
    $esEt = (bool) preg_match('/ET\s*[—\-–]/s*/u', $titulo)
        || (bool) preg_match('/tarea-ecr-et-/i', $id);

    if ($esNl1Madre || $esTi) {
        $t['fecha'] = FECHA_NL1;
        if (empty($t['parentId'])) {
            $t['fechaFin'] = FECHA_NL1;
            $t['articuloPublicacion'] = PUB_NL1;
        }
        $t['agendaFijada'] = true;
        $n1++;

        $esPortada = (bool) preg_match('/Portada/i', $titulo)
            || $id === 'tarea-ecr-nl-agosto-portada-2026-07-17';
        if ($esPortada) {
            $t['completada'] = true;
            $t['pendiente'] = false;
            $t['completadaEn'] = $now;
            $t['entregableArchivo'] = ENTREGABLE_PORTADA;
            $t['notas'] =
                'Portadas Canva FINALES (3) con logo ECR + título. ' .
                'Archivo: NL1-ago-portadas-canva-finales.md · imágenes en nl1-ago-finales/.';
            $t['estadoFijado'] = true;
            $portadaOk = true;
        }
        echo '  NL1 ' . FECHA_NL1 . ' · ' . $titulo . ($esPortada ? ' [Portada x]' : '') . "\n";
        continue;
    }

    if ($esNl2Madre || $esEt) {
        $t['fecha'] = FECHA_NL2;
        if (empty($t['parentId'])) {
            $t['fechaFin'] = FECHA_NL2;
            $t['articuloPublicacion'] = PUB_NL2;
        }
        $t['agendaFijada'] = true;
        $n2++;
        echo '  NL2 ' . FECHA_NL2 . ' · ' . $titulo . "\n";
    }
}
unset($t);

if ($n1 === 0 && $n2 === 0) {
    fwrite(STDERR, "ERROR: no encontré tareas ECR NL 1 / NL 2 en el live.\n");
    fwrite(STDERR, "Revisa que existan en el organizador (títulos con «NL 1 ago» / «NL 2 ago»).\n");
    exit(1);
}

$json = json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
if ($json === false) {
    fwrite(STDERR, "ERROR: no se pudo serializar JSON\n");
    exit(1);
}
file_put_contents($live, $json . "\n");

echo "\nOK · actualizadas NL1={$n1} · NL2={$n2}" . ($portadaOk ? ' · Portada NL1 cerrada' : '') . "\n";
echo "Archivo: {$live}\n";
echo "Ahora: recarga http://127.0.0.1:8000/index.html con Ctrl+F5\n";
echo "(Si sigues en el 17, el bat no se ejecutó en ESTA carpeta del proyecto.)\n";
