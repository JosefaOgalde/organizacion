<?php
/**
 * Cambia Laravel a SQLite (sin MySQL / sin Laragon).
 * Uso: php scripts/usar-sqlite-laravel.php
 */
declare(strict_types=1);

$root = dirname(__DIR__);
$backend = $root . DIRECTORY_SEPARATOR . 'backend';
$envPath = $backend . DIRECTORY_SEPARATOR . '.env';
$dbFile = $backend . DIRECTORY_SEPARATOR . 'database' . DIRECTORY_SEPARATOR . 'database.sqlite';

if (!is_file($backend . DIRECTORY_SEPARATOR . 'artisan')) {
    fwrite(STDERR, "ERROR: falta backend/artisan\n");
    exit(1);
}
if (!is_file($envPath)) {
    fwrite(STDERR, "ERROR: falta backend/.env\n");
    exit(1);
}

if (!is_file($dbFile)) {
    touch($dbFile);
    echo "  · Creado database/database.sqlite\n";
} else {
    echo "  · database.sqlite ya existe\n";
}

$env = file_get_contents($envPath);
$orig = $env;

$replacements = [
    '/^DB_CONNECTION=.*/m' => 'DB_CONNECTION=sqlite',
    '/^SESSION_DRIVER=.*/m' => 'SESSION_DRIVER=file',
];

foreach ($replacements as $pattern => $line) {
    if (preg_match($pattern, $env)) {
        $env = preg_replace($pattern, $line, $env);
    } else {
        $env .= "\n" . $line . "\n";
    }
}

// Comentar host/port/database de MySQL para que no confundan
foreach (['DB_HOST', 'DB_PORT', 'DB_DATABASE', 'DB_USERNAME', 'DB_PASSWORD'] as $key) {
    $env = preg_replace('/^' . $key . '=/m', '# ' . $key . '=', $env);
}

// Laravel sqlite: ruta relativa (sin espacios) — evita romper .env con "Josefa Ogalde"
if (preg_match('/^#?\s*DB_DATABASE=.*/m', $env)) {
    $env = preg_replace('/^#?\s*DB_DATABASE=.*/m', 'DB_DATABASE=database/database.sqlite', $env);
} else {
    $env .= "\nDB_DATABASE=database/database.sqlite\n";
}

if (preg_match('/^CACHE_STORE=.*/m', $env)) {
    $env = preg_replace('/^CACHE_STORE=.*/m', 'CACHE_STORE=file', $env);
} elseif (preg_match('/^CACHE_DRIVER=.*/m', $env)) {
    $env = preg_replace('/^CACHE_DRIVER=.*/m', 'CACHE_DRIVER=file', $env);
}

if ($env !== $orig) {
    file_put_contents($envPath, $env);
    echo "  · backend/.env → DB_CONNECTION=sqlite\n";
} else {
    echo "  · .env ya en sqlite\n";
}

// Asegurar modelo + seeder + migración mínima de clientes
$ej = $root . DIRECTORY_SEPARATOR . 'docs' . DIRECTORY_SEPARATOR . 'laravel' . DIRECTORY_SEPARATOR . 'ejemplos';

@mkdir($backend . DIRECTORY_SEPARATOR . 'database' . DIRECTORY_SEPARATOR . 'seeders', 0775, true);
@mkdir($backend . DIRECTORY_SEPARATOR . 'app' . DIRECTORY_SEPARATOR . 'Models', 0775, true);
@mkdir($backend . DIRECTORY_SEPARATOR . 'database' . DIRECTORY_SEPARATOR . 'migrations', 0775, true);

copy($ej . DIRECTORY_SEPARATOR . 'Model_Cliente.php', $backend . DIRECTORY_SEPARATOR . 'app' . DIRECTORY_SEPARATOR . 'Models' . DIRECTORY_SEPARATOR . 'Cliente.php');
copy($ej . DIRECTORY_SEPARATOR . 'ClienteSeeder.php', $backend . DIRECTORY_SEPARATOR . 'database' . DIRECTORY_SEPARATOR . 'seeders' . DIRECTORY_SEPARATOR . 'ClienteSeeder.php');
copy($ej . DIRECTORY_SEPARATOR . 'DatabaseSeeder.php', $backend . DIRECTORY_SEPARATOR . 'database' . DIRECTORY_SEPARATOR . 'seeders' . DIRECTORY_SEPARATOR . 'DatabaseSeeder.php');
echo "  · Modelo + seeders copiados\n";

// Migración clientes si no hay ninguna create_clientes
$migDir = $backend . DIRECTORY_SEPARATOR . 'database' . DIRECTORY_SEPARATOR . 'migrations';
$hasClientes = false;
foreach (glob($migDir . DIRECTORY_SEPARATOR . '*clientes*') ?: [] as $f) {
    $hasClientes = true;
    break;
}
if (!$hasClientes) {
    $stamp = date('Y_m_d_His');
    $target = $migDir . DIRECTORY_SEPARATOR . "{$stamp}_create_clientes_table.php";
    // El ejemplo tiene comentarios de doc; generar migración limpia
    $mig = <<<'PHP'
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('clientes', function (Blueprint $table) {
            $table->id();
            $table->string('slug', 64)->unique();
            $table->string('nombre');
            $table->string('abrev', 16);
            $table->string('tipo', 32)->default('freelance');
            $table->boolean('activo')->default(true);
            $table->string('color_border', 7)->nullable();
            $table->string('color_bg', 7)->nullable();
            $table->string('color_text', 7)->nullable();
            $table->string('agente')->nullable();
            $table->text('resumen')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('clientes');
    }
};
PHP;
    file_put_contents($target, $mig);
    echo "  · Migración create_clientes_table creada (con activo)\n";
} else {
    echo "  · Migración clientes ya existe\n";
}

// DB vieja sin columna activo → migración add_activo (idempotente) + ALTER directo
$hasAddActivo = false;
foreach (glob($migDir . DIRECTORY_SEPARATOR . '*add_activo*clientes*') ?: [] as $f) {
    $hasAddActivo = true;
    break;
}
if (!$hasAddActivo) {
    $stamp = date('Y_m_d_His', time() + 1);
    $targetAdd = $migDir . DIRECTORY_SEPARATOR . "{$stamp}_add_activo_to_clientes_table.php";
    $migAdd = <<<'PHP'
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('clientes') || Schema::hasColumn('clientes', 'activo')) {
            return;
        }
        Schema::table('clientes', function (Blueprint $table) {
            $table->boolean('activo')->default(true);
        });
    }

    public function down(): void
    {
        if (!Schema::hasTable('clientes') || !Schema::hasColumn('clientes', 'activo')) {
            return;
        }
        Schema::table('clientes', function (Blueprint $table) {
            $table->dropColumn('activo');
        });
    }
};
PHP;
    file_put_contents($targetAdd, $migAdd);
    echo "  · Migración add_activo_to_clientes_table creada\n";
} else {
    echo "  · Migración add_activo ya existe\n";
}

// Cinturón: ALTER directo en SQLite si la tabla existe y falta la columna
if (is_file($dbFile)) {
    try {
        $pdo = new PDO('sqlite:' . $dbFile);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $hasTable = (bool) $pdo->query("SELECT name FROM sqlite_master WHERE type='table' AND name='clientes'")->fetchColumn();
        if ($hasTable) {
            $cols = [];
            foreach ($pdo->query('PRAGMA table_info(clientes)') as $row) {
                $cols[strtolower((string) $row['name'])] = true;
            }
            if (!isset($cols['activo'])) {
                $pdo->exec('ALTER TABLE clientes ADD COLUMN activo INTEGER NOT NULL DEFAULT 1');
                echo "  · ALTER TABLE clientes ADD activo (SQLite directo)\n";
            } else {
                echo "  · SQLite clientes.activo OK\n";
            }
        }
    } catch (Throwable $e) {
        echo "  · Aviso ALTER activo: " . $e->getMessage() . "\n";
    }
}

echo "\nSiguiente (en backend):\n";
echo "  php artisan config:clear\n";
echo "  php artisan migrate --force\n";
echo "  php artisan db:seed --class=ClienteSeeder --force\n";
echo "  php artisan serve\n";
echo "\nAPI: http://127.0.0.1:8000/api/clientes\n";
