<?php
/**
 * COPIA en: backend/app/Http/Controllers/FrontendStaticController.php
 *
 * Sirve el organizador y el portal desde la carpeta padre (organizacion/),
 * para que todo viva en http://127.0.0.1:8000 (mismo origen que la API).
 */

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class FrontendStaticController extends Controller
{
    private function rootPath(): string
    {
        return dirname(base_path());
    }

    public function home()
    {
        return $this->serve('index.html');
    }

    /** Usado por Route::fallback — toma el path real del request (soporta varias barras). */
    public function fallback(Request $request)
    {
        $path = $request->path(); // ej. index/clientes
        if ($path === '/' || $path === '') {
            return $this->home();
        }
        // Si la URL pedía carpeta con / final, path() no la trae; resolveFile prueba index.html
        return $this->serve($path);
    }

    public function serve(string $path = 'index.html')
    {
        $path = rawurldecode(str_replace('\\', '/', $path));
        $path = ltrim($path, '/');

        if (str_starts_with($path, 'api/') || $path === 'api') {
            abort(404);
        }

        $deny = [
            '.git',
            'node_modules',
            '.env',
            'organizacion-live.json',
            'impresoreando-live.json',
        ];
        foreach ($deny as $d) {
            if (stripos($path, $d) !== false) {
                abort(403);
            }
        }
        if (preg_match('#(^|/)backend(/|$)#i', $path)) {
            abort(403);
        }

        $sensitiveCrcPattern =
            '#^index/clientes/herramientas/carga-recetas-cencosud/(?:[^/]+/)*(?:inbox|out|secrets)(?:/|$)#';
        $requestedPath = strtolower(preg_replace('#/+#', '/', $path) ?? $path);
        if (preg_match($sensitiveCrcPattern, $requestedPath)) {
            abort(403);
        }

        $root = realpath($this->rootPath());
        if ($root === false) {
            abort(404);
        }

        $full = $this->resolveFile($root, $path);
        if ($full === null) {
            abort(404);
        }

        $rootNorm = strtolower(rtrim(str_replace('\\', '/', $root), '/'));
        $fullNorm = strtolower(str_replace('\\', '/', $full));
        $relFromRoot = ltrim(substr($fullNorm, strlen($rootNorm)), '/');
        if (preg_match($sensitiveCrcPattern, $relFromRoot)) {
            abort(403);
        }

        $ext = strtolower(pathinfo($full, PATHINFO_EXTENSION));
        $mime = [
            'html' => 'text/html; charset=utf-8',
            'js' => 'text/javascript; charset=utf-8',
            'css' => 'text/css; charset=utf-8',
            'json' => 'application/json; charset=utf-8',
            'png' => 'image/png',
            'jpg' => 'image/jpeg',
            'jpeg' => 'image/jpeg',
            'gif' => 'image/gif',
            'webp' => 'image/webp',
            'svg' => 'image/svg+xml',
            'ico' => 'image/x-icon',
            'txt' => 'text/plain; charset=utf-8',
            'md' => 'text/markdown; charset=utf-8',
            'mp4' => 'video/mp4',
            'webm' => 'video/webm',
            'pdf' => 'application/pdf',
            'woff2' => 'font/woff2',
        ][$ext] ?? 'application/octet-stream';

        return response()->file($full, [
            'Content-Type' => $mime,
            'Cache-Control' => 'no-cache',
        ]);
    }

    /**
     * Resuelve archivo bajo $root. Si el path es carpeta (con o sin / final),
     * sirve index.html. Comparación de root case-insensitive (Windows).
     */
    private function resolveFile(string $root, string $path): ?string
    {
        $candidates = [];

        if ($path === '' || str_ends_with($path, '/')) {
            $candidates[] = trim($path, '/') === ''
                ? 'index.html'
                : trim($path, '/') . '/index.html';
        } else {
            $candidates[] = $path;
            // /index/clientes  →  /index/clientes/index.html
            $candidates[] = $path . '/index.html';
            // /index/clientes/Herramientas/Tendencias → Tendencias.html
            if (!str_contains(basename($path), '.')) {
                $candidates[] = $path . '.html';
            }
        }

        $rootNorm = strtolower(str_replace('\\', '/', $root));

        foreach ($candidates as $rel) {
            $rel = ltrim(str_replace('\\', '/', $rel), '/');
            $absolute = $root . DIRECTORY_SEPARATOR . str_replace('/', DIRECTORY_SEPARATOR, $rel);

            // Si es directorio, probar index.html dentro
            if (is_dir($absolute)) {
                $absolute = rtrim($absolute, '\\/') . DIRECTORY_SEPARATOR . 'index.html';
            }

            $full = realpath($absolute);
            if ($full === false || !is_file($full)) {
                continue;
            }

            $fullNorm = strtolower(str_replace('\\', '/', $full));
            if (!str_starts_with($fullNorm, $rootNorm)) {
                continue;
            }

            return $full;
        }

        return null;
    }
}
