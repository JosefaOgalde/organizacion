<?php
/**
 * COPIA en: backend/app/Http/Controllers/Api/ClienteController.php
 */

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cliente;

class ClienteController extends Controller
{
    /** GET /api/clientes */
    public function index()
    {
        return response()->json(Cliente::all());
    }
}
