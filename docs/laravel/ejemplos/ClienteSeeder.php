<?php
/**
 * COPIA en: backend/database/seeders/ClienteSeeder.php
 * Fuente: ../data/clientes-laravel-seed.json
 *
 * Upsert por slug canónico y elimina duplicados por abreviatura
 * (p. ej. quedaron "ts" y "trendseeker" del mismo cliente).
 */

namespace Database\Seeders;

use App\Models\Cliente;
use Illuminate\Database\Seeder;

class ClienteSeeder extends Seeder
{
    /** Slugs viejos → canónicos del portal */
    private const ALIASES = [
        'ts' => 'trendseeker',
        'pisc' => 'piscineria',
        'hs' => 'hotspring',
        'jm' => 'joyas-mercury',
        'adl' => 'desafio-latam',
        'imp' => 'impresoreando',
        'tw' => 'tronwell',
        'her' => 'herramientas',
        'joyasmercury' => 'joyas-mercury',
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

        // Renombrar slugs alias → canónico antes del upsert
        foreach (self::ALIASES as $old => $nuevo) {
            $row = Cliente::query()->where('slug', $old)->first();
            if (!$row) {
                continue;
            }
            if (Cliente::query()->where('slug', $nuevo)->exists()) {
                $row->delete();
            } else {
                $row->slug = $nuevo;
                $row->save();
            }
        }

        $preferidoPorAbrev = [];
        foreach ($lista as $c) {
            $slug = $c['slug'] ?? null;
            if (!$slug) {
                continue;
            }
            $abrev = strtoupper((string) ($c['abrev'] ?? substr($slug, 0, 4)));
            Cliente::updateOrCreate(
                ['slug' => $slug],
                [
                    'nombre' => $c['nombre'] ?? $slug,
                    'abrev' => $abrev,
                    'tipo' => $c['tipo'] ?? 'freelance',
                    'color_border' => $c['color_border'] ?? null,
                    'color_bg' => $c['color_bg'] ?? null,
                    'color_text' => $c['color_text'] ?? null,
                    'agente' => $c['agente'] ?? null,
                    'resumen' => $c['resumen'] ?? null,
                ]
            );
            $preferidoPorAbrev[$abrev] = $slug;
        }

        $borrados = 0;
        $grupos = Cliente::all()->groupBy(fn ($c) => strtoupper((string) $c->abrev));
        foreach ($grupos as $abrev => $group) {
            if ($group->count() <= 1) {
                continue;
            }
            $keepSlug = $preferidoPorAbrev[$abrev]
                ?? $group->sortByDesc(fn ($c) => strlen((string) $c->slug))->first()->slug;
            foreach ($group as $row) {
                if ($row->slug !== $keepSlug) {
                    $row->delete();
                    $borrados++;
                }
            }
        }

        $this->command?->info('Clientes: ' . Cliente::count() . " (duplicados eliminados: $borrados)");
    }
}
