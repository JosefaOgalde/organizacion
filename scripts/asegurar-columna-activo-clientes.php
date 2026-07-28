<?php
/**
 * Asegura columna clientes.activo en SQLite (DBs viejas).
 * Uso: php scripts/asegurar-columna-activo-clientes.php
 *
 * Lee la ruta real desde backend/.env (DB_DATABASE) para no ALTER-ear otro archivo.
 * Lo llama ABRIR-LARAVEL.bat antes del seed para evitar:
 *   SQLSTATE[HY000]: no such column: activo
 */
declare(strict_types=1);

$root = dirname(__DIR__);
$backend = $root . DIRECTORY_SEPARATOR . 'backend';
$envPath = $backend . DIRECTORY_SEPARATOR . '.env';
$sqlite = $backend . DIRECTORY_SEPARATOR . 'database' . DIRECTORY_SEPARATOR . 'database.sqlite';

if (is_file($envPath)) {
    $env = file_get_contents($envPath) ?: '';
    if (preg_match('/^DB_DATABASE\s*=\s*(.+)$/m', $env, $m)) {
        $dbVal = trim($m[1], " \t\"'");
        if ($dbVal !== '' && !str_starts_with($dbVal, '#')) {
            if (preg_match('/^[A-Za-z]:[\\\\\/]/', $dbVal) || str_starts_with($dbVal, '/')) {
                $sqlite = $dbVal;
            } else {
                $sqlite = $backend . DIRECTORY_SEPARATOR . str_replace(['/', '\\'], DIRECTORY_SEPARATOR, $dbVal);
            }
        }
    }
}

echo '  · SQLite: ' . $sqlite . "\n";

if (!is_file($sqlite)) {
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
    echo "  · Columnas clientes: activo OK (" . count($cols) . " cols)\n";
    exit(0);
}

echo "  · Falta activo. Columnas actuales: " . implode(', ', array_keys($cols)) . "\n";
$db->exec('ALTER TABLE clientes ADD COLUMN activo INTEGER NOT NULL DEFAULT 1');

$cols2 = [];
foreach ($db->query('PRAGMA table_info(clientes)') as $row) {
    $cols2[strtolower((string) $row['name'])] = true;
}
if (!isset($cols2['activo'])) {
    fwrite(STDERR, "  · ERROR: ALTER no dejó la columna activo\n");
    exit(1);
}

echo "  · Añadida columna clientes.activo (SQLite) OK\n";
exit(0);
