<?php
/**
 * COPIA en: backend/app/Http/Controllers/Api/ClienteController.php
 */

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cliente;

class ClienteController extends Controller
{
    /** GET /api/clientes — un cliente por abreviatura (sin duplicados). */
    public function index()
    {
        $lista = Cliente::query()->orderBy('nombre')->get();
        $unicos = [];
        $visto = [];
        foreach ($lista as $c) {
            $key = strtoupper((string) ($c->abrev ?: $c->slug));
            if (isset($visto[$key])) {
                continue;
            }
            $visto[$key] = true;
            $unicos[] = $c;
        }

        return response()->json(array_values($unicos));
    }
}
