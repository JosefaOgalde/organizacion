<?php
/**
 * Añade en: backend/routes/api.php
 */

use App\Http\Controllers\Api\ClienteController;
use App\Http\Controllers\Api\ImpresoreandoController;
use App\Http\Controllers\Api\OrganizacionController;
use Illuminate\Support\Facades\Route;

Route::get('/clientes', [ClienteController::class, 'index']);

Route::get('/organizacion-config', [OrganizacionController::class, 'config']);
Route::get('/organizacion', [OrganizacionController::class, 'show']);
Route::post('/organizacion', [OrganizacionController::class, 'store']);

Route::get('/impresoreando', [ImpresoreandoController::class, 'show']);
Route::post('/impresoreando', [ImpresoreandoController::class, 'store']);
Route::post('/impresoreando/venta', [ImpresoreandoController::class, 'storeVenta']);
