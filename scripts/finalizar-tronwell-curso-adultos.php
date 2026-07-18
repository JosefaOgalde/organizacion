<?php
/**
 * Tronwell — cierra la subtarea curso adultos.docx.
 *
 *   php scripts/finalizar-tronwell-curso-adultos.php
 *   (o doble clic en FINALIZAR-TRONWELL-CURSO-ADULTOS.bat)
 *
 * Luego: ABRIR-LARAVEL.bat → http://127.0.0.1:8000/index.html?disco=1
 */

$root = dirname(__DIR__);
$live = $root . DIRECTORY_SEPARATOR . 'data' . DIRECTORY_SEPARATOR . 'organizacion-live.json';
$respaldo = $root . DIRECTORY_SEPARATOR . 'data' . DIRECTORY_SEPARATOR . 'organizacion-respaldo-2026-07-18.json';

$tareaId = 'tarea-tw-ajustar-textos-curso-adultos-2026-07-19';
$nota = 'FINALIZADO 2026-07-18. Textos de curso de inglés adultos ajustados y OK.';

function cerrarCursoAdultos(string $path, string $tareaId, string $nota): void
{
    if (!is_file($path)) {
        echo "No existe {$path} — se omite\n";
        return;
    }

    $data = json_decode(file_get_contents($path) ?: '', true);
    if (!is_array($data)) {
        fwrite(STDERR, "JSON inválido: {$path}\n");
        exit(1);
    }

    $data['tareas'] = isset($data['tareas']) && is_array($data['tareas']) ? $data['tareas'] : [];
    $found = false;

    foreach ($data['tareas'] as $i => $t) {
        if (($t['id'] ?? null) !== $tareaId) {
            continue;
        }
        $data['tareas'][$i]['completada'] = true;
        $data['tareas'][$i]['pendiente'] = false;
        $data['tareas'][$i]['notas'] = $nota;
        $titulo = $data['tareas'][$i]['titulo'] ?? $tareaId;
        $num = $data['tareas'][$i]['numeroHistorico'] ?? '?';
        echo "Cerrada: {$titulo} #{$num}\n";
        $found = true;
        break;
    }

    if (!$found) {
        fwrite(STDERR, "No está la tarea {$tareaId} en {$path}\n");
        fwrite(STDERR, "Corré antes: php scripts/add-tronwell-ajustar-textos.php\n");
        exit(1);
    }

    if (!isset($data['meta']) || !is_array($data['meta'])) {
        $data['meta'] = [];
    }
    $metaNota = 'Tronwell · curso adultos.docx finalizado 2026-07-18.';
    $prev = (string) ($data['meta']['nota'] ?? '');
    if (strpos($prev, 'curso adultos.docx finalizado') === false) {
        $data['meta']['nota'] = $prev !== '' ? ($prev . ' · ' . $metaNota) : $metaNota;
    }

    $data['respaldoActualizado'] = date('c');
    $json = json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    if ($json === false || file_put_contents($path, $json . "\n") === false) {
        fwrite(STDERR, "No se pudo guardar {$path}\n");
        exit(1);
    }
    echo "OK → {$path}\n";
}

if (!is_file($live)) {
    fwrite(STDERR, "No existe data/organizacion-live.json\n");
    fwrite(STDERR, "Arrancá ABRIR-LARAVEL.bat o corré primero AGREGAR-TRONWELL-AJUSTAR-TEXTOS.bat\n");
    exit(1);
}

cerrarCursoAdultos($live, $tareaId, $nota);
if (is_file($respaldo)) {
    cerrarCursoAdultos($respaldo, $tareaId, $nota);
}

echo "\nVer: http://127.0.0.1:8000/index.html?disco=1\n";
echo "Portal: http://127.0.0.1:8000/index/clientes/tronwell/\n";
echo "(Madre «Ajustar textos» sigue abierta: queda tutor ia)\n";
