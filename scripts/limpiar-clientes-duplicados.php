<?php
/**
 * Elimina clientes duplicados en SQLite (misma abrev, distinto slug).
 * Uso (desde la raíz del repo, con backend Laravel):
 *   php scripts/limpiar-clientes-duplicados.php
 */
declare(strict_types=1);

$root = dirname(__DIR__);
$sqlite = $root . DIRECTORY_SEPARATOR . 'backend' . DIRECTORY_SEPARATOR . 'database' . DIRECTORY_SEPARATOR . 'database.sqlite';
if (!is_file($sqlite)) {
    fwrite(STDERR, "No existe $sqlite\n");
    exit(1);
}

$db = new PDO('sqlite:' . $sqlite);
$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

$preferidos = [
    'TS' => 'trendseeker',
    'ECR' => 'ecr',
    'PISC' => 'piscineria',
    'HS' => 'hotspring',
    'MKOF' => 'mkof',
    'JM' => 'joyas-mercury',
    'SIE' => 'sie',
    'ADL' => 'desafio-latam',
    'IMP' => 'impresoreando',
    'TW' => 'tronwell',
    'HER' => 'herramientas',
];

$rows = $db->query('SELECT id, slug, abrev, nombre FROM clientes ORDER BY id')->fetchAll(PDO::FETCH_ASSOC);
$byAbrev = [];
foreach ($rows as $r) {
    $a = strtoupper((string) $r['abrev']);
    $byAbrev[$a][] = $r;
}

$borrados = 0;
foreach ($byAbrev as $abrev => $group) {
    if (count($group) <= 1) {
        continue;
    }
    $keepSlug = $preferidos[$abrev] ?? null;
    if ($keepSlug === null || !in_array($keepSlug, array_column($group, 'slug'), true)) {
        usort($group, static fn ($a, $b) => strlen($b['slug']) <=> strlen($a['slug']));
        $keepSlug = $group[0]['slug'];
    }
    foreach ($group as $r) {
        if ($r['slug'] === $keepSlug) {
            continue;
        }
        $st = $db->prepare('DELETE FROM clientes WHERE id = ?');
        $st->execute([(int) $r['id']]);
        $borrados++;
        echo "Borrado duplicado: {$r['nombre']} (slug={$r['slug']})\n";
    }
}

$total = (int) $db->query('SELECT COUNT(*) FROM clientes')->fetchColumn();
echo "Listo. Duplicados eliminados: $borrados. Clientes restantes: $total\n";
