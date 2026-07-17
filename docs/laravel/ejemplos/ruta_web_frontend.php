<?php
/**
 * Añade AL FINAL de: backend/routes/web.php
 */

use App\Http\Controllers\FrontendStaticController;
use Illuminate\Support\Facades\Route;

Route::get('/', [FrontendStaticController::class, 'home']);
Route::get('/{path}', [FrontendStaticController::class, 'serve'])
    ->where('path', '^(?!api).*$');
