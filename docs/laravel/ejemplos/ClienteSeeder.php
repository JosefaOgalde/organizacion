<?php
/**
 * COPIA en: backend/database/seeders/ClienteSeeder.php
 * Fuente: ../data/clientes-laravel-seed.json (respaldo 2026-07-17)
 */

namespace Database\Seeders;

use App\Models\Cliente;
use Illuminate\Database\Seeder;

class ClienteSeeder extends Seeder
{
    public function run(): void
    {
        $path = dirname(base_path()) . DIRECTORY_SEPARATOR . 'data' . DIRECTORY_SEPARATOR . 'clientes-laravel-seed.json';
        if (!is_file($path)) {
            $this->command?->error("No existe $path");
            return;
        }

        $json = json_decode(file_get_contents($path), true);
        $lista = $json['clientes'] ?? [];
        if (!is_array($lista) || !$lista) {
            $this->command?->error('Seed sin clientes[]');
            return;
        }

        foreach ($lista as $c) {
            $slug = $c['slug'] ?? null;
            if (!$slug) {
                continue;
            }
            Cliente::updateOrCreate(
                ['slug' => $slug],
                [
                    'nombre' => $c['nombre'] ?? $slug,
                    'abrev' => $c['abrev'] ?? strtoupper(substr($slug, 0, 4)),
                    'tipo' => $c['tipo'] ?? 'freelance',
                    'color_border' => $c['color_border'] ?? null,
                    'color_bg' => $c['color_bg'] ?? null,
                    'color_text' => $c['color_text'] ?? null,
                    'agente' => $c['agente'] ?? null,
                    'resumen' => $c['resumen'] ?? null,
                ]
            );
        }

        $this->command?->info('Clientes importados: ' . Cliente::count());
    }
}
