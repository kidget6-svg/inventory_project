<?php
// database/seeders/MedicineSeeder.php

namespace Database\Seeders;

use App\Models\Medicine;
use App\Models\Category;
use App\Models\Supplier;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class MedicineSeeder extends Seeder
{
    public function run(): void
    {
        Schema::disableForeignKeyConstraints();
        Medicine::truncate();
        Schema::enableForeignKeyConstraints();

        $categories = Category::pluck('id', 'name')->toArray();
        $suppliers = Supplier::pluck('id', 'name')->toArray();

        $medicines = [
            [
                'name' => 'Amoxicillin',
                'generic_name' => 'Amoxicillin',
                'batch_number' => 'BATCH-001-2026',
                'barcode' => '1234567890123',
                'category_id' => $categories['Antibiotics'] ?? null,
                'supplier_id' => $suppliers['MediSupply Ltd'] ?? null,
                'quantity' => 100,
                'unit_price' => 5.00,
                'purchase_price' => 3.00,
                'selling_price' => 6.00,
                'reorder_level' => 20,
                'expiry_date' => '2027-12-31',
                'status' => 'active',
                'shelf_location' => 'A-1-S1',
                'description' => 'Antibiotic for bacterial infections',
                'manufacturer' => 'ABC Pharma',
            ],
            [
                'name' => 'Paracetamol',
                'generic_name' => 'Paracetamol',
                'batch_number' => 'BATCH-002-2026',
                'barcode' => '1234567890124',
                'category_id' => $categories['Pain Relief'] ?? null,
                'supplier_id' => $suppliers['PharmaDistributors PLC'] ?? null,
                'quantity' => 200,
                'unit_price' => 2.50,
                'purchase_price' => 1.20,
                'selling_price' => 3.00,
                'reorder_level' => 50,
                'expiry_date' => '2028-06-30',
                'status' => 'active',
                'shelf_location' => 'B-2-S2',
                'description' => 'Pain reliever and fever reducer',
                'manufacturer' => 'XYZ Pharma',
            ],
            // Add more medicines here...
        ];

        foreach ($medicines as $med) {
            Medicine::create($med);
        }

        $this->command->info('✅ Medicines created: ' . count($medicines));
    }
}