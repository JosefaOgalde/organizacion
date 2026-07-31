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

    /** Productos/gastos del seed que falten en live (no pisa existentes). */
    private function mergeSeedMissing(array $data): array
    {
        $seedPath = $this->seedPath();
        if (!is_file($seedPath)) {
            return $data;
        }
        $seedData = json_decode((string) file_get_contents($seedPath), true);
        if (!is_array($seedData)) {
            return $data;
        }
        $data['productos'] = is_array($data['productos'] ?? null) ? $data['productos'] : [];
        $data['gastos'] = is_array($data['gastos'] ?? null) ? $data['gastos'] : [];
        $prodKeys = [];
        foreach ($data['productos'] as $p) {
            if (!is_array($p)) {
                continue;
            }
            if (!empty($p['id'])) {
                $prodKeys['id:' . $p['id']] = true;
            }
            if (!empty($p['sku'])) {
                $prodKeys['sku:' . strtoupper((string) $p['sku'])] = true;
            }
        }
        foreach ($seedData['productos'] ?? [] as $sp) {
            if (!is_array($sp) || empty($sp['id'])) {
                continue;
            }
            $has =
                (!empty($sp['id']) && isset($prodKeys['id:' . $sp['id']]))
                || (!empty($sp['sku']) && isset($prodKeys['sku:' . strtoupper((string) $sp['sku'])]));
            if (!$has) {
                $data['productos'][] = $sp;
                $prodKeys['id:' . $sp['id']] = true;
                if (!empty($sp['sku'])) {
                    $prodKeys['sku:' . strtoupper((string) $sp['sku'])] = true;
                }
            }
        }
        $gasIds = [];
        foreach ($data['gastos'] as $g) {
            if (is_array($g) && !empty($g['id'])) {
                $gasIds[$g['id']] = true;
            }
        }
        foreach ($seedData['gastos'] ?? [] as $sg) {
            if (!is_array($sg) || empty($sg['id']) || isset($gasIds[$sg['id']])) {
                continue;
            }
            $data['gastos'][] = $sg;
            $gasIds[$sg['id']] = true;
        }
        // Pedidos/ventas del seed que falten (no pisa). No borrar PED-012 por número.
        $data['pedidos'] = is_array($data['pedidos'] ?? null) ? $data['pedidos'] : [];
        $data['pedidos'] = array_values(array_filter(
            $data['pedidos'],
            static fn ($p) => is_array($p) && (($p['id'] ?? '') !== 'ped-ele-pesa-012')
        ));
        $pedKeys = [];
        foreach ($data['pedidos'] as $p) {
            if (!is_array($p)) {
                continue;
            }
            if (!empty($p['id'])) {
                $pedKeys['id:' . $p['id']] = true;
            }
            if (!empty($p['numero'])) {
                $pedKeys['num:' . $p['numero']] = true;
            }
        }
        foreach ($seedData['pedidos'] ?? [] as $sp) {
            if (!is_array($sp) || empty($sp['id']) || ($sp['id'] ?? '') === 'ped-ele-pesa-012') {
                continue;
            }
            $has =
                (!empty($sp['id']) && isset($pedKeys['id:' . $sp['id']]))
                || (!empty($sp['numero']) && isset($pedKeys['num:' . $sp['numero']]));
            if (!$has) {
                $data['pedidos'][] = $sp;
                $pedKeys['id:' . $sp['id']] = true;
                if (!empty($sp['numero'])) {
                    $pedKeys['num:' . $sp['numero']] = true;
                }
            }
        }
        $data['ventas'] = is_array($data['ventas'] ?? null) ? $data['ventas'] : [];
        $venIds = [];
        foreach ($data['ventas'] as $v) {
            if (is_array($v) && !empty($v['id'])) {
                $venIds[$v['id']] = true;
            }
        }
        foreach ($seedData['ventas'] ?? [] as $sv) {
            if (!is_array($sv) || empty($sv['id']) || isset($venIds[$sv['id']])) {
                continue;
            }
            $data['ventas'][] = $sv;
            $venIds[$sv['id']] = true;
        }
        return $data;
    }

    /** GET /api/impresoreando */
    public function show()
    {
        $data = $this->mergeSeedMissing($this->readLive());
        $this->writeLive($data);
        return response()->json($data);
    }

    /** POST /api/impresoreando */
    public function store(Request $request)
    {
        $data = $request->all();
        if (!is_array($data) || !isset($data['gastos']) || !is_array($data['gastos'])) {
            return response()->json(['error' => 'faltan gastos[] (estructura Impresoreando)'], 400);
        }
        $data = $this->mergeSeedMissing($data);
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
