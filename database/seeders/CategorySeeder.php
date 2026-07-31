<?php
// database/seeders/CategorySeeder.php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        Category::truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        $categories = [
            ['name' => 'Antibiotics', 'description' => 'Antibacterial medications', 'shelf_location' => 'A-1'],
            ['name' => 'Pain Relief', 'description' => 'Analgesics and pain medications', 'shelf_location' => 'B-2'],
            ['name' => 'Vitamins', 'description' => 'Vitamin supplements', 'shelf_location' => 'C-3'],
            ['name' => 'First Aid', 'description' => 'First aid supplies', 'shelf_location' => 'D-4'],
            ['name' => 'Chronic Care', 'description' => 'Chronic disease medications', 'shelf_location' => 'E-5'],
            ['name' => 'Controlled Substances', 'description' => 'Controlled medications', 'shelf_location' => 'F-6'],
            ['name' => 'Antihistamines', 'description' => 'Allergy medications', 'shelf_location' => 'G-7'],
            ['name' => 'Antacids', 'description' => 'Stomach acid relief', 'shelf_location' => 'H-8'],
            ['name' => 'Cardiovascular', 'description' => 'Heart and blood pressure medications', 'shelf_location' => 'I-9'],
            ['name' => 'Diabetes', 'description' => 'Diabetes management medications', 'shelf_location' => 'J-10'],
        ];

        foreach ($categories as $cat) {
            Category::create($cat);
        }

        $this->command->info('✅ Categories created: ' . count($categories));
    }
}