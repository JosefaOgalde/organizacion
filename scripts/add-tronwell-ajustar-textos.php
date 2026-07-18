<?php
/**
 * Tronwell — tarea madre «Ajustar textos» (19 jul) + subtareas por documento.
 *
 *   php scripts/add-tronwell-ajustar-textos.php
 *
 * Stack: Laravel + SQLite (sin Node). Luego:
 *   ABRIR-LARAVEL.bat → http://127.0.0.1:8000/index.html?disco=1
 */

$root = dirname(__DIR__);
$live = $root . DIRECTORY_SEPARATOR . 'data' . DIRECTORY_SEPARATOR . 'organizacion-live.json';
$respaldo = $root . DIRECTORY_SEPARATOR . 'data' . DIRECTORY_SEPARATOR . 'organizacion-respaldo-2026-07-18.json';

$fecha = '2026-07-19';
$clienteId = 'cli-tronwell';
$rolId = 'rol-tw-textos';
$madreId = 'tarea-tw-ajustar-textos-2026-07-19';

$cliente = [
    'id' => $clienteId,
    'nombre' => 'Tronwell',
    'abrev' => 'TW',
    'tipo' => 'freelance',
    'color' => 'indigo',
    'roles' => [
        [
            'id' => $rolId,
            'nombre' => 'Textos / contenidos',
            'abrev' => 'TXT',
            'funciones' => "Ajuste de textos\nRevisión de documentos\nEntrega de copys",
            'tareasAlMes' => 'Según encargos',
            'plazosEntregables' => 'Por tarea en el calendario',
        ],
    ],
    'agente' => [
        'nombre' => 'Agente Tronwell',
        'emoji' => '📄',
        'especialidad' => 'Ajuste de textos y documentos',
        'instrucciones' => 'Eres el asistente de Tronwell. Ayudas a revisar y ajustar textos de documentos (Word), mantener tono claro y entregar versiones listas.',
    ],
    'manualMarca' => ['texto' => '', 'archivos' => []],
    'metas' => '',
    'contextoPrompt' => '',
    'ficha' => [
        'contacto' => '',
        'links' => '',
        'notas' => 'Docs de trabajo: Contacto, curso adultos, Home, tutor ia.',
        'seccionesExtra' => [],
        'documentos' => [],
    ],
];

$docs = [
    ['id' => 'contacto', 'titulo' => 'Contacto.docx', 'horaInicio' => '09:00', 'horaFin' => '11:00', 'num' => '02'],
    ['id' => 'curso-adultos', 'titulo' => 'curso adultos.docx', 'horaInicio' => '11:00', 'horaFin' => '13:00', 'num' => '03'],
    ['id' => 'home', 'titulo' => 'Home.docx', 'horaInicio' => '13:00', 'horaFin' => '15:00', 'num' => '04'],
    ['id' => 'tutor-ia', 'titulo' => 'tutor ia.docx', 'horaInicio' => '15:00', 'horaFin' => '17:00', 'num' => '05'],
];

$madre = [
    'id' => $madreId,
    'titulo' => '[TW] Ajustar textos',
    'clienteId' => $clienteId,
    'rolId' => $rolId,
    'fecha' => $fecha,
    'fechaFin' => $fecha,
    'horaInicio' => '09:00',
    'horaFin' => '17:00',
    'notas' => 'Tarea madre · ajustar textos Tronwell (domingo 19 jul). '
        . 'Subtareas = un documento cada una: Contacto.docx · curso adultos.docx · Home.docx · tutor ia.docx. '
        . 'Completar la madre cuando terminen las 4 subtareas.',
    'prioridad' => 'alta',
    'completada' => false,
    'pendiente' => false,
    'numeroHistorico' => '01',
    'tipoEntregable' => 'ecosistema',
    'parentId' => null,
];

function upsertTarea(array &$data, array $tarea): void
{
    $data['tareas'] = isset($data['tareas']) && is_array($data['tareas']) ? $data['tareas'] : [];
    foreach ($data['tareas'] as $i => $t) {
        if (($t['id'] ?? null) === $tarea['id']) {
            $prev = $t;
            $data['tareas'][$i] = array_merge($prev, $tarea, [
                'completada' => !empty($prev['completada']),
                'pendiente' => !empty($prev['pendiente']),
            ]);
            echo 'Actualizada: ' . $tarea['titulo'] . ' #' . $tarea['numeroHistorico'] . "\n";
            return;
        }
    }
    $data['tareas'][] = $tarea;
    echo 'Agregada: ' . $tarea['titulo'] . ' #' . $tarea['numeroHistorico'] . "\n";
}

function ensureCliente(array &$data, array $cliente): void
{
    $data['clientes'] = isset($data['clientes']) && is_array($data['clientes']) ? $data['clientes'] : [];
    foreach ($data['clientes'] as $i => $c) {
        if (($c['id'] ?? null) === $cliente['id']) {
            $data['clientes'][$i] = array_merge($c, $cliente);
            echo "Cliente actualizado: Tronwell\n";
            return;
        }
    }
    $data['clientes'][] = $cliente;
    echo "Cliente agregado: Tronwell\n";
}

function applyFile(string $path, array $cliente, array $madre, array $docs, string $madreId, string $clienteId, string $rolId, string $fecha): void
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

    ensureCliente($data, $cliente);
    upsertTarea($data, $madre);

    foreach ($docs as $idx => $doc) {
        upsertTarea($data, [
            'id' => 'tarea-tw-ajustar-textos-' . $doc['id'] . '-2026-07-19',
            'titulo' => '[TW] ' . $doc['titulo'],
            'clienteId' => $clienteId,
            'rolId' => $rolId,
            'fecha' => $fecha,
            'horaInicio' => $doc['horaInicio'],
            'horaFin' => $doc['horaFin'],
            'notas' => 'Subtarea de «Ajustar textos» · documento ' . $doc['titulo'] . '.',
            'prioridad' => 'alta',
            'completada' => false,
            'pendiente' => false,
            'numeroHistorico' => $doc['num'],
            'tipoEntregable' => 'texto-doc',
            'parentId' => $madreId,
            'ordenHijo' => $idx + 1,
            'documentoNombre' => $doc['titulo'],
        ]);
    }

    if (!isset($data['meta']) || !is_array($data['meta'])) {
        $data['meta'] = [];
    }
    $nota = 'Tronwell · madre Ajustar textos 2026-07-19 + 4 docs (Contacto, curso adultos, Home, tutor ia).';
    $prev = (string) ($data['meta']['nota'] ?? '');
    if (strpos($prev, 'Tronwell · madre Ajustar textos') === false) {
        $data['meta']['nota'] = $prev !== '' ? ($prev . ' · ' . $nota) : $nota;
    }

    $data['respaldoActualizado'] = date('c');
    $json = json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    if ($json === false || file_put_contents($path, $json . "\n") === false) {
        fwrite(STDERR, "No se pudo guardar {$path}\n");
        exit(1);
    }
    echo 'OK → ' . $path . "\n";
}

if (!is_file($live)) {
    if (is_file($respaldo)) {
        if (!is_dir(dirname($live))) {
            mkdir(dirname($live), 0777, true);
        }
        copy($respaldo, $live);
        echo "Creado live desde respaldo 2026-07-18\n";
    } else {
        fwrite(STDERR, "No existe data/organizacion-live.json ni el respaldo 18-07.\n");
        fwrite(STDERR, "Arranca ABRIR-LARAVEL.bat o copiá tu respaldo a data/.\n");
        exit(1);
    }
}

applyFile($live, $cliente, $madre, $docs, $madreId, $clienteId, $rolId, $fecha);
if (is_file($respaldo)) {
    applyFile($respaldo, $cliente, $madre, $docs, $madreId, $clienteId, $rolId, $fecha);
}

echo "\nVer: http://127.0.0.1:8000/index.html?disco=1\n";
echo "Portal: http://127.0.0.1:8000/index/clientes/tronwell/\n";
