<?php
/**
 * COPIA en: backend/app/Http/Controllers/FrontendStaticController.php
 *
 * Sirve el organizador y el portal desde la carpeta padre (organizacion/),
 * para que todo viva en http://127.0.0.1:8000 (mismo origen que la API).
 */

namespace App\Http\Controllers;

use Symfony\Component\HttpFoundation\BinaryFileResponse;

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

    public function serve(string $path = 'index.html')
    {
        $path = ltrim(str_replace('\\', '/', $path), '/');
        if ($path === '' || str_ends_with($path, '/')) {
            $path .= 'index.html';
        }

        $deny = [
            '.git', 'backend', 'node_modules', '.env',
            'organizacion-live.json', 'impresoreando-live.json',
        ];
        foreach ($deny as $d) {
            if (stripos($path, $d) !== false) {
                abort(403);
            }
        }

        $root = realpath($this->rootPath());
        $full = realpath($root . DIRECTORY_SEPARATOR . str_replace('/', DIRECTORY_SEPARATOR, $path));

        if ($full === false || $root === false || !str_starts_with($full, $root) || !is_file($full)) {
            abort(404);
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
}
