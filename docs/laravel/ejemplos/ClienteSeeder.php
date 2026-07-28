<?php
/**
 * COPIA en: backend/database/seeders/ClienteSeeder.php
 * Fuente: ../data/clientes-laravel-seed.json
 *
 * Slugs = carpetas reales bajo index/clientes/ (no abreviaturas).
 * Upsert por slug canónico y elimina duplicados por abreviatura
 * (p. ej. quedaron "ts" y "trendseeker" del mismo cliente).
 */

namespace Database\Seeders;

use App\Models\Cliente;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use PDO;

class ClienteSeeder extends Seeder
{
    /** Slugs viejos / alias → canónicos del portal (= carpeta) */
    private const ALIASES = [
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
        // Antes de cualquier UPDATE: la columna debe existir (DBs SQLite viejas).
        $this->asegurarColumnaActivo();

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
                // Solo tocar slug (evitar dirty de casts sobre columnas ausentes).
                Cliente::query()->where('id', $row->id)->update(['slug' => $nuevo]);
            }
        }

        $preferidoPorAbrev = [];
        $tieneActivo = $this->tieneColumnaActivo();

        foreach ($lista as $c) {
            $slug = $c['slug'] ?? null;
            if (!$slug) {
                continue;
            }
            $abrev = strtoupper((string) ($c['abrev'] ?? substr($slug, 0, 4)));
            $payload = [
                'nombre' => $c['nombre'] ?? $slug,
                'abrev' => $abrev,
                'tipo' => $c['tipo'] ?? 'freelance',
                'color_border' => $c['color_border'] ?? null,
                'color_bg' => $c['color_bg'] ?? null,
                'color_text' => $c['color_text'] ?? null,
                'agente' => $c['agente'] ?? null,
                'resumen' => $c['resumen'] ?? null,
            ];
            if ($tieneActivo) {
                $payload['activo'] = array_key_exists('activo', $c) ? (bool) $c['activo'] : true;
            }

            try {
                Cliente::updateOrCreate(['slug' => $slug], $payload);
            } catch (\Throwable $e) {
                $msg = $e->getMessage();
                if (stripos($msg, 'activo') !== false) {
                    $this->asegurarColumnaActivo();
                    $tieneActivo = $this->tieneColumnaActivo();
                    if ($tieneActivo) {
                        $payload['activo'] = array_key_exists('activo', $c) ? (bool) $c['activo'] : true;
                    } else {
                        unset($payload['activo']);
                    }
                    Cliente::updateOrCreate(['slug' => $slug], $payload);
                } else {
                    throw $e;
                }
            }
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

    /** ALTER directo vía PDO (no depende de Schema::hasColumn / migraciones a medias). */
    private function asegurarColumnaActivo(): void
    {
        try {
            $pdo = DB::connection()->getPdo();
            $hasTable = (bool) $pdo->query(
                "SELECT name FROM sqlite_master WHERE type='table' AND name='clientes'"
            )->fetchColumn();
            if (!$hasTable) {
                return;
            }
            if ($this->tieneColumnaActivo($pdo)) {
                return;
            }
            $pdo->exec('ALTER TABLE clientes ADD COLUMN activo INTEGER NOT NULL DEFAULT 1');
            $this->command?->info('Añadida columna clientes.activo (SQLite)');
        } catch (\Throwable $e) {
            $this->command?->warn('No se pudo asegurar columna activo: ' . $e->getMessage());
        }
    }

    private function tieneColumnaActivo(?PDO $pdo = null): bool
    {
        try {
            $pdo ??= DB::connection()->getPdo();
            foreach ($pdo->query('PRAGMA table_info(clientes)') as $row) {
                $name = is_array($row) ? ($row['name'] ?? $row[1] ?? '') : '';
                if (strtolower((string) $name) === 'activo') {
                    return true;
                }
            }
        } catch (\Throwable $e) {
            return false;
        }
        return false;
    }
}
