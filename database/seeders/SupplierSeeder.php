<?php
// database/seeders/SupplierSeeder.php

namespace Database\Seeders;

use App\Models\Supplier;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class SupplierSeeder extends Seeder
{
    public function run(): void
    {
        Schema::disableForeignKeyConstraints();
        Supplier::truncate();
        Schema::enableForeignKeyConstraints();

        $suppliers = [
            [
                'name' => 'MediSupply Ltd',
                'contact_person' => 'John Doe',
                'email' => 'john@medisupply.com',
                'phone' => '+251 911 234 567',
                'address' => 'Addis Ababa, Ethiopia',
                'tax_number' => 'TAX-001-2026',
            ],
            [
                'name' => 'PharmaDistributors PLC',
                'contact_person' => 'Jane Smith',
                'email' => 'jane@pharmadist.com',
                'phone' => '+251 922 345 678',
                'address' => 'Addis Ababa, Ethiopia',
                'tax_number' => 'TAX-002-2026',
            ],
            [
                'name' => 'Global Pharma Solutions',
                'contact_person' => 'Bob Johnson',
                'email' => 'info@globalpharma.com',
                'phone' => '+251 933 456 789',
                'address' => 'Addis Ababa, Ethiopia',
                'tax_number' => 'TAX-003-2026',
            ],
            [
                'name' => 'EthioHealth Distributors',
                'contact_person' => 'Sarah Williams',
                'email' => 'sarah@ethiohealth.com',
                'phone' => '+251 944 567 890',
                'address' => 'Addis Ababa, Ethiopia',
                'tax_number' => 'TAX-004-2026',
            ],
        ];

        foreach ($suppliers as $sup) {
            Supplier::create($sup);
        }

        $this->command->info('✅ Suppliers created: ' . count($suppliers));
    }
}