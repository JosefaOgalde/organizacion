<?php
/**
 * COPIA en: backend/database/migrations/YYYY_MM_DD_HHMMSS_add_activo_to_clientes_table.php
 * (también la genera scripts/usar-sqlite-laravel.php si falta la columna)
 */

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('clientes')) {
            return;
        }
        if (Schema::hasColumn('clientes', 'activo')) {
            return;
        }
        Schema::table('clientes', function (Blueprint $table) {
            // SQLite no soporta after(); solo añadir la columna.
            $table->boolean('activo')->default(true);
        });
    }

    public function down(): void
    {
        if (!Schema::hasTable('clientes') || !Schema::hasColumn('clientes', 'activo')) {
            return;
        }
        Schema::table('clientes', function (Blueprint $table) {
            $table->dropColumn('activo');
        });
    }
};
