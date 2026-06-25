<?php
/**
 * COPIA este contenido dentro de:
 * backend/database/migrations/XXXX_create_clientes_table.php
 * (reemplaza todo el método up() y down())
 */

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('clientes', function (Blueprint $table) {
            $table->id();
            $table->string('slug', 64)->unique();
            $table->string('nombre');
            $table->string('abrev', 16);
            $table->enum('tipo', ['full-time', 'freelance', 'oportunidad', 'personal'])->default('freelance');
            $table->char('color_border', 7)->nullable();
            $table->char('color_bg', 7)->nullable();
            $table->char('color_text', 7)->nullable();
            $table->string('agente')->nullable();
            $table->text('resumen')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('clientes');
    }
};
