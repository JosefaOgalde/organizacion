<?php
/**
 * Asegura columna clientes.activo en SQLite (DBs viejas).
 * Uso: php scripts/asegurar-columna-activo-clientes.php
 *
 * Lo llama ABRIR-LARAVEL.bat antes del seed para evitar:
 *   SQLSTATE[HY000]: no such column: activo
 */
declare(strict_types=1);

$root = dirname(__DIR__);
$sqlite = $root . DIRECTORY_SEPARATOR . 'backend' . DIRECTORY_SEPARATOR . 'database' . DIRECTORY_SEPARATOR . 'database.sqlite';

if (!is_file($sqlite)) {
    // Crear vacío; migrate creará tablas después
    @mkdir(dirname($sqlite), 0775, true);
    touch($sqlite);
    echo "  · Creado database.sqlite vacío\n";
}

$db = new PDO('sqlite:' . $sqlite);
$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

$tables = $db->query("SELECT name FROM sqlite_master WHERE type='table' AND name='clientes'")->fetchColumn();
if (!$tables) {
    echo "  · Tabla clientes aún no existe (migrate la creará)\n";
    exit(0);
}

$cols = [];
foreach ($db->query('PRAGMA table_info(clientes)') as $row) {
    $cols[strtolower((string) $row['name'])] = true;
}

if (isset($cols['activo'])) {
    echo "  · Columnas clientes: activo OK\n";
    exit(0);
}

$db->exec('ALTER TABLE clientes ADD COLUMN activo INTEGER NOT NULL DEFAULT 1');
echo "  · Añadida columna clientes.activo (SQLite)\n";
