<?php
/**
 * COPIA en: backend/app/Models/Cliente.php
 * (reemplaza el contenido después de make:model Cliente)
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
        'color_border',
        'color_bg',
        'color_text',
        'agente',
        'resumen',
    ];
}
