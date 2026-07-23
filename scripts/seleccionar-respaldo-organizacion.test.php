<?php
declare(strict_types=1);

require_once __DIR__ . DIRECTORY_SEPARATOR . 'seleccionar-respaldo-organizacion.php';

function comprobar(mixed $esperado, mixed $actual, string $mensaje): void
{
    if ($esperado !== $actual) {
        throw new RuntimeException(
            $mensaje . "\nEsperado: " . var_export($esperado, true)
            . "\nActual: " . var_export($actual, true)
        );
    }
}

function escribirRespaldo(string $dir, string $fecha, array $datos): string
{
    $path = $dir . DIRECTORY_SEPARATOR . "organizacion-respaldo-$fecha.json";
    file_put_contents($path, json_encode($datos, JSON_THROW_ON_ERROR));
    return $path;
}

function borrarDirectorio(string $dir): void
{
    foreach (scandir($dir) ?: [] as $nombre) {
        if ($nombre !== '.' && $nombre !== '..') {
            unlink($dir . DIRECTORY_SEPARATOR . $nombre);
        }
    }
    rmdir($dir);
}

$dir = sys_get_temp_dir() . DIRECTORY_SEPARATOR . 'respaldo-organizacion-' . bin2hex(random_bytes(6));
mkdir($dir, 0775, true);

try {
    comprobar(null, seleccionarRespaldoOrganizacion($dir), 'Sin respaldos debe devolver null');

    file_put_contents(
        $dir . DIRECTORY_SEPARATOR . 'organizacion-respaldo-ejemplo.json',
        '{"clientes":[],"tareas":[]}'
    );
    comprobar(null, seleccionarRespaldoOrganizacion($dir), 'Debe ignorar la plantilla sin fecha');

    $antiguo = escribirRespaldo($dir, '2026-07-17', [
        'clientes' => [],
        'tareas' => [['id' => 'antiguo']],
    ]);
    $reciente = escribirRespaldo($dir, '2026-07-21', [
        'clientes' => [],
        'tareas' => [['id' => 'reciente']],
    ]);
    touch($antiguo, strtotime('2026-07-23'));
    touch($reciente, strtotime('2026-07-21'));

    comprobar(
        $reciente,
        seleccionarRespaldoOrganizacion($dir),
        'Debe elegir la fecha más reciente sin depender del mtime'
    );

    file_put_contents(
        $dir . DIRECTORY_SEPARATOR . 'organizacion-respaldo-2026-07-22.json',
        '{"clientes":[],"tareas":'
    );
    escribirRespaldo($dir, '2026-07-23', ['clientes' => [], 'tareas' => 'no-es-array']);
    escribirRespaldo($dir, '2026-13-40', ['clientes' => [], 'tareas' => []]);
    escribirRespaldo($dir, 'zzzz-zz-zz', ['clientes' => [], 'tareas' => []]);

    comprobar(
        $reciente,
        seleccionarRespaldoOrganizacion($dir),
        'Debe omitir respaldos con contenido o fecha inválidos'
    );

    $live = $dir . DIRECTORY_SEPARATOR . 'organizacion-live.json';
    comprobar(
        true,
        restaurarRespaldoOrganizacion($reciente, $live),
        'Debe crear el live desde el respaldo'
    );
    comprobar(
        file_get_contents($reciente),
        file_get_contents($live),
        'El live restaurado debe estar completo'
    );

    file_put_contents($live, '{"clientes":[],"tareas":[{"id":"live-existente"}]}');
    $liveExistente = file_get_contents($live);
    comprobar(
        false,
        restaurarRespaldoOrganizacion($antiguo, $live),
        'Nunca debe reemplazar un live existente'
    );
    comprobar(
        $liveExistente,
        file_get_contents($live),
        'Debe preservar exactamente el live existente'
    );

    $bat = file_get_contents(dirname(__DIR__) . DIRECTORY_SEPARATOR . 'ABRIR-LARAVEL.bat');
    comprobar(
        false,
        str_contains($bat ?: '', 'copy /Y "data\organizacion-respaldo-'),
        'El lanzador no debe saltarse la selección y validación PHP'
    );

    echo "OK: selección y restauración segura del respaldo más reciente\n";
} finally {
    borrarDirectorio($dir);
}
