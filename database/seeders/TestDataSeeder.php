<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Product;
use App\Models\Batch;
use App\Models\Supplier;
use App\Models\Category;

class TestDataSeeder extends Seeder
{
    public function run()
    {
        // Create a test user if none exists
        if (!User::where('email', 'admin@pharmacy.com')->exists()) {
            User::create([
                'name' => 'Admin User',
                'email' => 'admin@pharmacy.com',
                'password' => Hash::make('password'),
                'role_id' => 1, // Assuming role 1 is admin
            ]);
        }

        // Create suppliers
        $supplier1 = Supplier::create([
            'name' => 'MediSupply Ltd',
            'contact_person' => 'John Doe',
            'email' => 'john@medisupply.com',
            'phone' => '+251 911 234 567',
            'address' => 'Addis Ababa, Ethiopia'
        ]);

        $supplier2 = Supplier::create([
            'name' => 'PharmaDistributors PLC',
            'contact_person' => 'Jane Smith',
            'email' => 'jane@pharmadist.com',
            'phone' => '+251 922 345 678',
            'address' => 'Addis Ababa, Ethiopia'
        ]);

        // Create categories
        $categories = [
            ['name' => 'Antibiotics', 'description' => 'Antibacterial medications'],
            ['name' => 'Pain Relief', 'description' => 'Analgesics and pain medications'],
            ['name' => 'Vitamins', 'description' => 'Vitamin supplements'],
            ['name' => 'First Aid', 'description' => 'First aid supplies'],
            ['name' => 'Chronic Care', 'description' => 'Chronic disease medications'],
            ['name' => 'Controlled Substances', 'description' => 'Controlled medications'],
        ];

        foreach ($categories as $cat) {
            Category::create($cat);
        }

        // Create products (medicines)
        $products = [
            [
                'generic_name' => 'Amoxicillin',
                'brand_name' => 'Amoxil',
                'barcode' => '1234567890123',
                'category' => 'Antibiotics',
                'is_controlled' => false,
                'is_refrigerated' => false,
                'aisle' => 'A1',
                'shelf' => 'S1',
                'bin' => 'B1',
                'reorder_level' => 20,
            ],
            [
                'generic_name' => 'Paracetamol',
                'brand_name' => 'Panadol',
                'barcode' => '1234567890124',
                'category' => 'Pain Relief',
                'is_controlled' => false,
                'is_refrigerated' => false,
                'aisle' => 'B1',
                'shelf' => 'S2',
                'bin' => 'B2',
                'reorder_level' => 50,
            ],
            [
                'generic_name' => 'Ibuprofen',
                'brand_name' => 'Brufen',
                'barcode' => '1234567890125',
                'category' => 'Pain Relief',
                'is_controlled' => false,
                'is_refrigerated' => false,
                'aisle' => 'B2',
                'shelf' => 'S3',
                'bin' => 'B3',
                'reorder_level' => 30,
            ],
            [
                'generic_name' => 'Vitamin C',
                'brand_name' => 'Redoxon',
                'barcode' => '1234567890126',
                'category' => 'Vitamins',
                'is_controlled' => false,
                'is_refrigerated' => false,
                'aisle' => 'C1',
                'shelf' => 'S1',
                'bin' => 'B1',
                'reorder_level' => 25,
            ],
            [
                'generic_name' => 'Tramadol',
                'brand_name' => 'Ultram',
                'barcode' => '1234567890127',
                'category' => 'Controlled Substances',
                'is_controlled' => true,
                'is_refrigerated' => false,
                'aisle' => 'D1',
                'shelf' => 'S1',
                'bin' => 'B1',
                'reorder_level' => 10,
            ],
            [
                'generic_name' => 'Metformin',
                'brand_name' => 'Glucophage',
                'barcode' => '1234567890128',
                'category' => 'Chronic Care',
                'is_controlled' => false,
                'is_refrigerated' => false,
                'aisle' => 'E1',
                'shelf' => 'S1',
                'bin' => 'B1',
                'reorder_level' => 40,
            ],
            [
                'generic_name' => 'Insulin',
                'brand_name' => 'Humulin',
                'barcode' => '1234567890129',
                'category' => 'Chronic Care',
                'is_controlled' => false,
                'is_refrigerated' => true,
                'aisle' => 'F1',
                'shelf' => 'S1',
                'bin' => 'B1',
                'reorder_level' => 15,
            ],
            [
                'generic_name' => 'Morphine',
                'brand_name' => 'MS Contin',
                'barcode' => '1234567890130',
                'category' => 'Controlled Substances',
                'is_controlled' => true,
                'is_refrigerated' => false,
                'aisle' => 'D2',
                'shelf' => 'S1',
                'bin' => 'B2',
                'reorder_level' => 5,
            ],
        ];

        foreach ($products as $productData) {
            $product = Product::create($productData);

            // Create batches for each product
            // Some with low stock to trigger alerts
            $batches = [
                [
                    'batch_number' => 'BATCH' . rand(1000, 9999),
                    'quantity' => rand(5, 100),
                    'expiry_date' => now()->addMonths(rand(1, 12)),
                    'received_date' => now()->subDays(rand(1, 30)),
                    'unit_cost' => rand(10, 100),
                    'supplier_id' => rand(0, 1) ? $supplier1->id : $supplier2->id,
                ],
                [
                    'batch_number' => 'BATCH' . rand(1000, 9999),
                    'quantity' => rand(0, 30),
                    'expiry_date' => now()->addMonths(rand(1, 6)),
                    'received_date' => now()->subDays(rand(1, 15)),
                    'unit_cost' => rand(10, 100),
                    'supplier_id' => rand(0, 1) ? $supplier1->id : $supplier2->id,
                ],
            ];

            foreach ($batches as $batchData) {
                // Make some batches low stock
                if (rand(0, 2) == 0) { // 1 in 3 chance
                    $batchData['quantity'] = rand(0, 5);
                }
                // Make some batches expiring soon
                if (rand(0, 3) == 0) { // 1 in 4 chance
                    $batchData['expiry_date'] = now()->addDays(rand(10, 80));
                }
                
                Batch::create(array_merge($batchData, ['product_id' => $product->id]));
            }
        }

        // Create some sales records
        for ($i = 0; $i < 10; $i++) {
            DB::table('sales')->insert([
                'sale_date' => now()->subDays(rand(0, 5)),
                'cashier_id' => 1,
                'total_amount' => rand(100, 5000),
                'payment_method' => ['cash', 'card', 'mobile'][rand(0, 2)],
                'prescription_ref' => 'RX' . rand(1000, 9999),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        $this->command->info('✅ Test data seeded successfully!');
        $this->command->info('📊 Dashboard will now show real data!');
    }
}