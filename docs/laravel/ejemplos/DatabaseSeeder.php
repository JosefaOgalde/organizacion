<?php
/**
 * COPIA en: backend/database/seeders/DatabaseSeeder.php
 * (reemplaza el método run)
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
