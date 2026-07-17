<?php
/**
 * Añade AL FINAL de: backend/routes/web.php
 * Sirve el frontend sin tocar MySQL/sesiones.
 */

use App\Http\Controllers\FrontendStaticController;
use Illuminate\Support\Facades\Route;

Route::get('/', [FrontendStaticController::class, 'home'])
    ->withoutMiddleware([
        \Illuminate\Session\Middleware\StartSession::class,
        \Illuminate\View\Middleware\ShareErrorsFromSession::class,
        \Illuminate\Foundation\Http\Middleware\VerifyCsrfToken::class,
    ]);
Route::get('/{path}', [FrontendStaticController::class, 'serve'])
    ->where('path', '^(?!api).*$')
    ->withoutMiddleware([
        \Illuminate\Session\Middleware\StartSession::class,
        \Illuminate\View\Middleware\ShareErrorsFromSession::class,
        \Illuminate\Foundation\Http\Middleware\VerifyCsrfToken::class,
    ]);
