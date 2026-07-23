<?php
/**
 * COPIA en: backend/database/seeders/ClienteSeeder.php
 * Fuente: ../data/clientes-laravel-seed.json
 *
 * Slugs = carpetas reales bajo index/clientes/ (no abreviaturas).
 */

namespace Database\Seeders;

use App\Models\Cliente;
use Illuminate\Database\Seeder;

class ClienteSeeder extends Seeder
{
    /** Slugs cortos viejos → carpeta real (se eliminan tras migrar). */
    private const LEGACY_SLUGS = [
        'ts' => 'trendseeker',
        'pisc' => 'piscineria',
        'hs' => 'hotspring',
        'jm' => 'joyasmercury',
        'joyas-mercury' => 'joyasmercury',
        'adl' => 'desafio-latam',
        'imp' => 'impresoreando',
        'tw' => 'tronwell',
        'her' => 'herramientas',
    ];

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

        foreach (self::LEGACY_SLUGS as $old => $canonical) {
            if ($old === $canonical) {
                continue;
            }
            $legacy = Cliente::query()->where('slug', $old)->first();
            if (!$legacy) {
                continue;
            }
            $keep = Cliente::query()->where('slug', $canonical)->first();
            if ($keep) {
                $legacy->delete();
                $this->command?->info("Eliminado slug legacy «{$old}» (queda «{$canonical}»)");
            } else {
                $legacy->slug = $canonical;
                $legacy->save();
                $this->command?->info("Renombrado slug «{$old}» → «{$canonical}»");
            }
        }

        $this->command?->info('Clientes importados: ' . Cliente::count());
    }
}
