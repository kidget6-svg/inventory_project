<?php
// database/seeders/RetailProductSeeder.php

namespace Database\Seeders;

use App\Models\RetailProduct;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Schema;

class RetailProductSeeder extends Seeder
{
    public function run(): void
    {
        Schema::disableForeignKeyConstraints();
        RetailProduct::truncate();
        Schema::enableForeignKeyConstraints();

        $products = [
            // Cosmetics
            [
                'name' => 'Lipstick - Ruby Red',
                'sku' => 'COS-001',
                'category' => 'Cosmetics',
                'price' => 12.50,
                'quantity' => 150,
            ],
            [
                'name' => 'Foundation - Natural Beige',
                'sku' => 'COS-002',
                'category' => 'Cosmetics',
                'price' => 24.99,
                'quantity' => 120,
            ],
            [
                'name' => 'Mascara - Black Volume',
                'sku' => 'COS-003',
                'category' => 'Cosmetics',
                'price' => 18.75,
                'quantity' => 90,
            ],
            [
                'name' => 'Nail Polish - Midnight Blue',
                'sku' => 'COS-004',
                'category' => 'Cosmetics',
                'price' => 8.50,
                'quantity' => 200,
            ],
            [
                'name' => 'Face Cream - Moisturizing',
                'sku' => 'COS-005',
                'category' => 'Cosmetics',
                'price' => 32.00,
                'quantity' => 80,
            ],
            [
                'name' => 'Sunscreen SPF 30',
                'sku' => 'COS-006',
                'category' => 'Cosmetics',
                'price' => 19.99,
                'quantity' => 110,
            ],

            // OTC (Over-the-Counter)
            [
                'name' => 'Vitamin C Tablets 100ct',
                'sku' => 'OTC-001',
                'category' => 'OTC',
                'price' => 15.99,
                'quantity' => 250,
            ],
            [
                'name' => 'Omega-3 Fish Oil 120ct',
                'sku' => 'OTC-002',
                'category' => 'OTC',
                'price' => 22.50,
                'quantity' => 180,
            ],
            [
                'name' => 'Digestive Enzyme Capsules',
                'sku' => 'OTC-003',
                'category' => 'OTC',
                'price' => 19.99,
                'quantity' => 140,
            ],
            [
                'name' => 'Antacid Tablets 50ct',
                'sku' => 'OTC-004',
                'category' => 'OTC',
                'price' => 7.25,
                'quantity' => 300,
            ],
            [
                'name' => 'Sleep Aid - Melatonin 10mg',
                'sku' => 'OTC-005',
                'category' => 'OTC',
                'price' => 14.50,
                'quantity' => 95,
            ],
            [
                'name' => 'First Aid Antiseptic Cream',
                'sku' => 'OTC-006',
                'category' => 'OTC',
                'price' => 9.99,
                'quantity' => 160,
            ],

            // General / Health & Wellness
            [
                'name' => 'Hand Sanitizer 250ml',
                'sku' => 'GEN-001',
                'category' => 'Health & Wellness',
                'price' => 5.50,
                'quantity' => 400,
            ],
            [
                'name' => 'Face Masks - Pack of 10',
                'sku' => 'GEN-002',
                'category' => 'General',
                'price' => 6.99,
                'quantity' => 350,
            ],
        ];

        foreach ($products as $product) {
            RetailProduct::create($product);
        }

        $this->command->info('✅ Retail products created: ' . count($products));
    }
}
