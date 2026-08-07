<?php
// database/seeders/DatabaseSeeder.php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            UserSeeder::class,
            CategorySeeder::class,
            SupplierSeeder::class,
            MedicineSeeder::class,
            BatchSeeder::class,
            RetailProductSeeder::class,
        ]);
        
        $this->command->info('✅ All data seeded successfully!');
        $this->command->info('📊 Dashboard will now show real data!');
        $this->command->info('🔑 Login: admin@pharmacy.com / password');
    }
}