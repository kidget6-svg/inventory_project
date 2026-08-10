<?php

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
            [
                'name' => 'Ibuprofen',
                'generic_name' => 'Ibuprofen',
                'batch_number' => 'BATCH-003-2026',
                'barcode' => '1234567890125',
                'category_id' => $categories['Pain Relief'] ?? null,
                'supplier_id' => $suppliers['MediSupply Ltd'] ?? null,
                'quantity' => 150,
                'unit_price' => 3.00,
                'purchase_price' => 1.80,
                'selling_price' => 4.00,
                'reorder_level' => 30,
                'expiry_date' => '2027-09-15',
                'status' => 'active',
                'shelf_location' => 'B-2-S3',
                'description' => 'Anti-inflammatory pain reliever',
                'manufacturer' => 'ABC Pharma',
            ],
            [
                'name' => 'Cetirizine',
                'generic_name' => 'Cetirizine',
                'batch_number' => 'BATCH-004-2026',
                'barcode' => '1234567890126',
                'category_id' => $categories['Antihistamines'] ?? null,
                'supplier_id' => $suppliers['PharmaDistributors PLC'] ?? null,
                'quantity' => 80,
                'unit_price' => 4.00,
                'purchase_price' => 2.50,
                'selling_price' => 5.00,
                'reorder_level' => 15,
                'expiry_date' => '2027-11-30',
                'status' => 'active',
                'shelf_location' => 'G-7-S1',
                'description' => 'Antihistamine for allergy relief',
                'manufacturer' => 'XYZ Pharma',
            ],
            [
                'name' => 'Omeprazole',
                'generic_name' => 'Omeprazole',
                'batch_number' => 'BATCH-005-2026',
                'barcode' => '1234567890127',
                'category_id' => $categories['Antacids'] ?? null,
                'supplier_id' => $suppliers['Global Pharma Solutions'] ?? null,
                'quantity' => 60,
                'unit_price' => 6.00,
                'purchase_price' => 3.50,
                'selling_price' => 7.50,
                'reorder_level' => 10,
                'expiry_date' => '2027-10-20',
                'status' => 'active',
                'shelf_location' => 'H-8-S2',
                'description' => 'Proton pump inhibitor for acid reflux',
                'manufacturer' => 'ABC Pharma',
            ],
        ];

        foreach ($medicines as $med) {
            Medicine::create($med);
        }

        $this->command->info('✅ Medicines created: ' . count($medicines));
    }
}