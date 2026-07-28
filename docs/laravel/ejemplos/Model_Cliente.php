<?php
/**
 * COPIA en: backend/app/Models/Cliente.php
 * (reemplaza el contenido después de make:model Cliente)
 *
 * NOTA: no incluir "activo" en $fillable/$casts.
 * Si la columna aún no existe en SQLite, Eloquent rompía el seed con:
 *   SQLSTATE no such column: activo
 * La columna se gestiona con scripts/asegurar-columna-activo-clientes.php
 * y updates SQL en crudo en el seeder (si la columna ya está).
 */

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Cliente extends Model
{
    protected $table = 'clientes';

    protected $fillable = [
        'slug',
        'nombre',
        'abrev',
        'tipo',
        'activo',
        'color_border',
        'color_bg',
        'color_text',
        'agente',
        'resumen',
    ];

    protected $casts = [
        'activo' => 'boolean',
    ];
}
