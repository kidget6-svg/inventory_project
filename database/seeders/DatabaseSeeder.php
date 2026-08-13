<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Order matters - seed parent tables first
        $this->call([
            RolesAndPermissionsSeeder::class, // Roles & permissions first (needed by users)
            UserSeeder::class,          // Users first
            CategorySeeder::class,      // Categories
            SupplierSeeder::class,      // Suppliers
            MedicineSeeder::class,      // Medicines (depends on categories & suppliers)
            BatchSeeder::class,         // Batches (depends on medicines & suppliers)
            RetailProductSeeder::class, // Retail/OTC products (for Retail & OTC Sales page)
            SaleSeeder::class,          // Sales (depends on medicines & users)
        ]);

        $this->command->info('✅ All data seeded successfully!');
        $this->command->info('📊 Dashboard will now show real data!');
        $this->command->info('🔑 Login Credentials:');
        $this->command->info('   Admin: admin@pharmacy.com / password');
        $this->command->info('   Pharmacist: pharmacist@pharmacy.com / password');
        $this->command->info('   Cashier: cashier@pharmacy.com / password');
    }
}
