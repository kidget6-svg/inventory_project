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
                'image' => 'images/retail-products/lipstick-ruby-red.svg',
            ],
            [
                'name' => 'Foundation - Natural Beige',
                'sku' => 'COS-002',
                'category' => 'Cosmetics',
                'price' => 24.99,
                'quantity' => 120,
                'image' => 'images/retail-products/foundation-natural-beige.svg',
            ],
            [
                'name' => 'Mascara - Black Volume',
                'sku' => 'COS-003',
                'category' => 'Cosmetics',
                'price' => 18.75,
                'quantity' => 90,
                'image' => 'images/retail-products/mascara-black-volume.svg',
            ],
            [
                'name' => 'Nail Polish - Midnight Blue',
                'sku' => 'COS-004',
                'category' => 'Cosmetics',
                'price' => 8.50,
                'quantity' => 200,
                'image' => 'images/retail-products/nail-polish-midnight-blue.svg',
            ],
            [
                'name' => 'Face Cream - Moisturizing',
                'sku' => 'COS-005',
                'category' => 'Cosmetics',
                'price' => 32.00,
                'quantity' => 80,
                'image' => 'images/retail-products/face-cream-moisturizing.svg',
            ],
            [
                'name' => 'Sunscreen SPF 30',
                'sku' => 'COS-006',
                'category' => 'Cosmetics',
                'price' => 19.99,
                'quantity' => 110,
                'image' => 'images/retail-products/sunscreen-spf30.svg',
            ],

            // OTC (Over-the-Counter)
            [
                'name' => 'Vitamin C Tablets 100ct',
                'sku' => 'OTC-001',
                'category' => 'OTC',
                'price' => 15.99,
                'quantity' => 250,
                'image' => 'images/retail-products/vitamin-c-tablets-100ct.svg',
            ],
            [
                'name' => 'Omega-3 Fish Oil 120ct',
                'sku' => 'OTC-002',
                'category' => 'OTC',
                'price' => 22.50,
                'quantity' => 180,
                'image' => 'images/retail-products/omega-3-fish-oil-120ct.svg',
            ],
            [
                'name' => 'Digestive Enzyme Capsules',
                'sku' => 'OTC-003',
                'category' => 'OTC',
                'price' => 19.99,
                'quantity' => 140,
                'image' => 'images/retail-products/digestive-enzyme-capsules.svg',
            ],
            [
                'name' => 'Antacid Tablets 50ct',
                'sku' => 'OTC-004',
                'category' => 'OTC',
                'price' => 7.25,
                'quantity' => 300,
                'image' => 'images/retail-products/antacid-tablets-50ct.svg',
            ],
            [
                'name' => 'Sleep Aid - Melatonin 10mg',
                'sku' => 'OTC-005',
                'category' => 'OTC',
                'price' => 14.50,
                'quantity' => 95,
                'image' => 'images/retail-products/sleep-aid-melatonin-10mg.svg',
            ],
            [
                'name' => 'First Aid Antiseptic Cream',
                'sku' => 'OTC-006',
                'category' => 'OTC',
                'price' => 9.99,
                'quantity' => 160,
                'image' => 'images/retail-products/first-aid-antiseptic-cream.svg',
            ],

            // General / Health & Wellness
            [
                'name' => 'Hand Sanitizer 250ml',
                'sku' => 'GEN-001',
                'category' => 'Health & Wellness',
                'price' => 5.50,
                'quantity' => 400,
                'image' => 'images/retail-products/hand-sanitizer-250ml.svg',
            ],
            [
                'name' => 'Face Masks - Pack of 10',
                'sku' => 'GEN-002',
                'category' => 'General',
                'price' => 6.99,
                'quantity' => 350,
                'image' => 'images/retail-products/face-masks-pack-of-10.svg',
            ],
        ];

        foreach ($products as $product) {
            RetailProduct::create($product);
        }

        $this->command->info('✅ Retail products created: ' . count($products));
    }
}
