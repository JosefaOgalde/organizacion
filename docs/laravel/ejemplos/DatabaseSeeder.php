<?php
/**
 * COPIA en: backend/database/seeders/DatabaseSeeder.php (método run)
 * O deja solo ClienteSeeder y ejecuta: php artisan db:seed --class=ClienteSeeder
 */

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            ClienteSeeder::class,
        ]);
    }
}
