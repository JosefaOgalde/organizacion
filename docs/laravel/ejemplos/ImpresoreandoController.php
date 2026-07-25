<?php
/**
 * COPIA en: backend/app/Http/Controllers/Api/ImpresoreandoController.php
 *
 * GET/POST /api/impresoreando — panel socios (JSON en disco)
 * POST     /api/impresoreando/venta — append de una venta
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
        File::ensureDirectoryExists(dirname($live));
        File::copy($seed, $live);
    }

    private function readLive(): array
    {
        $this->ensureLive();
        $raw = file_get_contents($this->livePath());
        $data = json_decode($raw ?: '', true);
        if (!is_array($data)) {
            abort(500, 'impresoreando-live.json inválido');
        }
        return $data;
    }

    private function writeLive(array $data): void
    {
        if (!isset($data['meta']) || !is_array($data['meta'])) {
            $data['meta'] = [];
        }
        $data['meta']['actualizado'] = now()->toIso8601String();
        File::ensureDirectoryExists(dirname($this->livePath()));
        file_put_contents(
            $this->livePath(),
            json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) . "\n"
        );
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
    public function storeVenta(Request $request)
    {
        $item = $request->all();
        if (!is_array($item) || empty($item['descripcion']) || !isset($item['montoNeto'])) {
            return response()->json(['error' => 'faltan descripcion / montoNeto'], 400);
        }

        $obj = $this->readLive();
        $obj['ventas'] = is_array($obj['ventas'] ?? null) ? $obj['ventas'] : [];
        $venta = [
            'id' => (string) ($item['id'] ?? ('ven-' . base_convert((string) time(), 10, 36))),
            'fecha' => (string) ($item['fecha'] ?? now()->toDateString()),
            'descripcion' => (string) $item['descripcion'],
            'cantidad' => (float) ($item['cantidad'] ?? 1),
            'montoNeto' => (float) $item['montoNeto'],
            'canal' => (string) ($item['canal'] ?? ''),
            'notas' => (string) ($item['notas'] ?? ''),
            'socioRegistro' => (string) ($item['socioRegistro'] ?? 'Ambos'),
            'cliente' => (string) ($item['cliente'] ?? ''),
        ];
        $obj['ventas'][] = $venta;
        $this->writeLive($obj);

        $totalVentas = array_reduce($obj['ventas'], fn ($a, $v) => $a + (float) ($v['montoNeto'] ?? 0), 0.0);
        $totalGastos = array_reduce($obj['gastos'] ?? [], fn ($a, $g) => $a + (float) ($g['montoNeto'] ?? 0), 0.0);

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
