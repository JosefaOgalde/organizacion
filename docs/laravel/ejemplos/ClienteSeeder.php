<?php
/**
 * COPIA en: backend/database/seeders/ClienteSeeder.php
 *
 * Importa clientes desde data/clientes-laravel-seed.json (raíz del repo).
 * Uso:
 *   php artisan db:seed --class=ClienteSeeder
 *   o: php artisan migrate:fresh --seed  (si DatabaseSeeder lo llama)
 */

namespace Database\Seeders;

use App\Models\Cliente;
use Illuminate\Database\Seeder;

class ClienteSeeder extends Seeder
{
    public function run(): void
    {
        $path = dirname(base_path()) . DIRECTORY_SEPARATOR . 'data' . DIRECTORY_SEPARATOR . 'clientes-laravel-seed.json';

        if (! is_file($path)) {
            // Fallback: seed embebido relativo al backend
            $path = base_path('..' . DIRECTORY_SEPARATOR . 'data' . DIRECTORY_SEPARATOR . 'clientes-laravel-seed.json');
        }

        if (! is_file($path)) {
            $this->command?->error("No se encontró data/clientes-laravel-seed.json");
            return;
        }

        $payload = json_decode(file_get_contents($path), true);
        $clientes = $payload['clientes'] ?? [];

        if (! is_array($clientes) || ! count($clientes)) {
            $this->command?->error('JSON sin clientes[]');
            return;
        }

        $ok = 0;
        foreach ($clientes as $c) {
            if (empty($c['slug']) || empty($c['nombre'])) {
                continue;
            }

            Cliente::updateOrCreate(
                ['slug' => $c['slug']],
                [
                    'nombre' => $c['nombre'],
                    'abrev' => $c['abrev'] ?? strtoupper(substr($c['slug'], 0, 4)),
                    'tipo' => $c['tipo'] ?? 'freelance',
                    'color_border' => $c['color_border'] ?? null,
                    'color_bg' => $c['color_bg'] ?? null,
                    'color_text' => $c['color_text'] ?? null,
                    'agente' => $c['agente'] ?? null,
                    'resumen' => $c['resumen'] ?? null,
                ]
            );
            $ok++;
        }

        $this->command?->info("Clientes importados/actualizados: {$ok}");
    }
}
