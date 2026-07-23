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

    comprobar(
        $reciente,
        seleccionarRespaldoOrganizacion($dir),
        'Debe omitir respaldos recientes inválidos'
    );

    echo "OK: selección segura del respaldo más reciente\n";
} finally {
    borrarDirectorio($dir);
}
