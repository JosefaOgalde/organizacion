<?php
/**
 * COPIA en: backend/app/Http/Controllers/Api/OrganizacionController.php
 *
 * GET/POST /api/organizacion — calendario/madres (JSON en disco)
 * GET      /api/organizacion-config
 */

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;

class OrganizacionController extends Controller
{
    private function rootPath(): string
    {
        return dirname(base_path());
    }

    private function livePath(): string
    {
        return $this->rootPath() . DIRECTORY_SEPARATOR . 'data' . DIRECTORY_SEPARATOR . 'organizacion-live.json';
    }

    private function respaldoPath(): string
    {
        return $this->rootPath() . DIRECTORY_SEPARATOR . 'data' . DIRECTORY_SEPARATOR . 'organizacion-respaldo-2026-07-17.json';
    }

    private function readDatos(): ?array
    {
        foreach ([$this->livePath(), $this->respaldoPath()] as $path) {
            if (!is_file($path)) {
                continue;
            }
            $raw = file_get_contents($path);
            $data = json_decode($raw ?: '', true);
            if (is_array($data)) {
                return $data;
            }
        }
        return null;
    }

    /** GET /api/organizacion-config */
    public function config()
    {
        return response()->json([
            'ok' => true,
            'servidor' => 'laravel',
            'live' => is_file($this->livePath()),
            'respaldo' => is_file($this->respaldoPath()),
            'laravelApi' => url('/api/clientes'),
        ]);
    }

    /** GET /api/organizacion */
    public function show()
    {
        $data = $this->readDatos();
        if (!$data) {
            return response()->json(['error' => 'Sin datos. Falta data/organizacion-live.json o el respaldo.'], 404);
        }
        return response()->json($data);
    }

    /** POST /api/organizacion */
    public function store(Request $request)
    {
        $data = $request->all();
        if (!is_array($data) || !isset($data['clientes'], $data['tareas'])) {
            return response()->json(['error' => 'JSON inválido: faltan clientes[] o tareas[]'], 400);
        }
        if (!is_array($data['clientes']) || !is_array($data['tareas'])) {
            return response()->json(['error' => 'clientes y tareas deben ser arrays'], 400);
        }

        $dir = dirname($this->livePath());
        if (!is_dir($dir)) {
            File::makeDirectory($dir, 0775, true);
        }

        $data['respaldoActualizado'] = $data['respaldoActualizado'] ?? date('Y-m-d');
        $json = json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        if ($json === false || file_put_contents($this->livePath(), $json) === false) {
            return response()->json(['error' => 'No se pudo guardar'], 500);
        }

        return response()->json([
            'ok' => true,
            'tareas' => count($data['tareas']),
            'clientes' => count($data['clientes']),
        ]);
    }
}
