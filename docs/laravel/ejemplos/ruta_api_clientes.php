<?php
/**
 * Añade en: backend/routes/api.php
 * (junto a las otras rutas use / Route)
 */

use App\Http\Controllers\Api\ClienteController;
use Illuminate\Support\Facades\Route;

Route::get('/clientes', [ClienteController::class, 'index']);
