<?php
/**
 * COPIA en: backend/app/Http/Controllers/Api/ImpresoreandoController.php
 *
 * GET/POST /api/impresoreando
 * POST     /api/impresoreando/venta
 *
 * Live: data/impresoreando-live.json (seed si falta).
 */

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;

class ImpresoreandoController extends Controller
{
    private function rootPath(): string
    {
        return dirname(base_path());
    }

    private function livePath(): string
    {
        return $this->rootPath() . DIRECTORY_SEPARATOR . 'data' . DIRECTORY_SEPARATOR . 'impresoreando-live.json';
    }

    private function seedPath(): string
    {
        return $this->rootPath() . DIRECTORY_SEPARATOR . 'data' . DIRECTORY_SEPARATOR . 'impresoreando-seed.json';
    }

    private function ensureLive(): void
    {
        $live = $this->livePath();
        if (is_file($live)) {
            return;
        }
        $seed = $this->seedPath();
        if (!is_file($seed)) {
            abort(500, 'Falta data/impresoreando-seed.json');
        }
        $dir = dirname($live);
        if (!is_dir($dir)) {
            File::makeDirectory($dir, 0775, true);
        }
        if (!copy($seed, $live)) {
            abort(500, 'No se pudo crear data/impresoreando-live.json');
        }
    }

    private function readLive(): array
    {
        $this->ensureLive();
        $raw = file_get_contents($this->livePath());
        $data = json_decode($raw ?: '', true);
        if (!is_array($data)) {
            abort(500, 'JSON inválido en impresoreando-live.json');
        }
        return $data;
    }

    private function writeLive(array $data): void
    {
        $dir = dirname($this->livePath());
        if (!is_dir($dir)) {
            File::makeDirectory($dir, 0775, true);
        }
        if (!isset($data['meta']) || !is_array($data['meta'])) {
            $data['meta'] = [];
        }
        $data['meta']['actualizado'] = date('c');
        $json = json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        if ($json === false || file_put_contents($this->livePath(), $json . "\n") === false) {
            abort(500, 'No se pudo guardar impresoreando-live.json');
        }
    }

    /** GET /api/impresoreando */
    public function show()
    {
        return response()->json($this->readLive());
    }

    /** POST /api/impresoreando */
    public function store(Request $request)
    {
        $data = $request->all();
        if (!is_array($data) || !isset($data['gastos']) || !is_array($data['gastos'])) {
            return response()->json(['error' => 'faltan gastos[] (estructura Impresoreando)'], 400);
        }
        $this->writeLive($data);
        return response()->json([
            'ok' => true,
            'path' => 'data/impresoreando-live.json',
            'actualizado' => $data['meta']['actualizado'] ?? null,
        ]);
    }

    /** POST /api/impresoreando/venta */
    public function venta(Request $request)
    {
        $item = $request->all();
        if (!is_array($item) || empty($item['descripcion']) || !isset($item['montoNeto'])) {
            return response()->json(['error' => 'faltan descripcion / montoNeto'], 400);
        }

        $obj = $this->readLive();
        $obj['ventas'] = isset($obj['ventas']) && is_array($obj['ventas']) ? $obj['ventas'] : [];
        $venta = [
            'id' => (string) ($item['id'] ?? ('ven-' . base_convert((string) time(), 10, 36))),
            'fecha' => (string) ($item['fecha'] ?? date('Y-m-d')),
            'descripcion' => (string) $item['descripcion'],
            'cantidad' => (float) ($item['cantidad'] ?? 1),
            'montoNeto' => (float) $item['montoNeto'],
            'canal' => (string) ($item['canal'] ?? ''),
            'notas' => (string) ($item['notas'] ?? ''),
            'socioRegistro' => (string) ($item['socioRegistro'] ?? 'Ambos'),
        ];
        $obj['ventas'][] = $venta;
        $this->writeLive($obj);

        $totalVentas = array_sum(array_map(fn ($v) => (float) ($v['montoNeto'] ?? 0), $obj['ventas']));
        $totalGastos = array_sum(array_map(fn ($g) => (float) ($g['montoNeto'] ?? 0), $obj['gastos'] ?? []));

        return response()->json([
            'ok' => true,
            'venta' => $venta,
            'totales' => [
                'ventas' => $totalVentas,
                'gastos' => $totalGastos,
                'saldo' => max(0, $totalGastos - $totalVentas),
            ],
            'actualizado' => $obj['meta']['actualizado'] ?? null,
        ]);
    }
}
