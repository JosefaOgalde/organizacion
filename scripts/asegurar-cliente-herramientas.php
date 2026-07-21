<?php
/**
 * Asegura cliente Herramientas en organizacion-live.json (PHP, sin Node).
 * Lo llama ABRIR-LARAVEL.bat.
 */
$root = dirname(__DIR__);
$live = $root . DIRECTORY_SEPARATOR . 'data' . DIRECTORY_SEPARATOR . 'organizacion-live.json';
if (!is_file($live)) {
    exit(0);
}
$data = json_decode(file_get_contents($live) ?: '', true);
if (!is_array($data)) {
    fwrite(STDERR, "JSON inválido en live\n");
    exit(1);
}
if (!isset($data['clientes']) || !is_array($data['clientes'])) {
    $data['clientes'] = [];
}
$id = 'cli-herramientas';
foreach ($data['clientes'] as $c) {
    if (($c['id'] ?? '') === $id) {
        echo "  · Cliente Herramientas ya está en live\n";
        exit(0);
    }
}
$data['clientes'][] = [
    'id' => $id,
    'nombre' => 'Herramientas',
    'abrev' => 'HER',
    'tipo' => 'freelance',
    'color' => 'grafito',
    'roles' => [[
        'id' => 'rol-her-lab',
        'nombre' => 'Laboratorio',
        'abrev' => 'LAB',
        'funciones' => "Prototipos y utilidades internas",
        'tareasAlMes' => 'Según proyecto',
        'plazosEntregables' => 'Por tarea',
    ]],
    'agente' => [
        'nombre' => 'Herramientas internas',
        'emoji' => '🛠',
        'especialidad' => 'Utilidades internas',
        'instrucciones' => 'Apoyas proyectos internos (Tendencias, dashboards).',
    ],
    'manualMarca' => ['texto' => '', 'archivos' => []],
    'metas' => '',
    'contextoPrompt' => '',
    'ficha' => [
        'contacto' => '',
        'links' => '',
        'notas' => 'Landing: index/clientes/herramientas/ · Tendencias: Herramientas/Tendencias.html',
        'seccionesExtra' => [],
        'documentos' => [],
    ],
];
$data['respaldoActualizado'] = date('Y-m-d');
file_put_contents($live, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) . "\n");
echo "  · Cliente Herramientas agregado a live\n";
