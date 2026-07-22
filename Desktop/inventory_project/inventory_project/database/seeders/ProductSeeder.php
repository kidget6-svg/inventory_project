<?php

namespace Database\Seeders;

use App\Models\Product;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $products = [
            ['name_generic' => 'Paracetamol', 'name_brand' => 'Tylenol', 'strength' => '500mg', 'dosage_form' => 'Tablet', 'manufacturer' => 'PharmaTech', 'unit_of_measure' => 'strip', 'category' => 'Analgesic', 'minimum_stock_level' => 50, 'price' => 5.50],
            ['name_generic' => 'Amoxicillin', 'name_brand' => 'Amoxil', 'strength' => '250mg', 'dosage_form' => 'Capsule', 'manufacturer' => 'MediCore', 'unit_of_measure' => 'bottle', 'category' => 'Antibiotic', 'minimum_stock_level' => 30, 'price' => 12.00],
            ['name_generic' => 'Lisinopril', 'name_brand' => 'Zestril', 'strength' => '10mg', 'dosage_form' => 'Tablet', 'manufacturer' => 'Apex Med', 'unit_of_measure' => 'strip', 'category' => 'Antihypertensive', 'minimum_stock_level' => 40, 'price' => 8.75],
            ['name_generic' => 'Metformin', 'name_brand' => 'Glucophage', 'strength' => '500mg', 'dosage_form' => 'Tablet', 'manufacturer' => 'Nova Pharma', 'unit_of_measure' => 'strip', 'category' => 'Antidiabetic', 'minimum_stock_level' => 60, 'price' => 7.25],
            ['name_generic' => 'Omeprazole', 'name_brand' => 'Prilosec', 'strength' => '20mg', 'dosage_form' => 'Capsule', 'manufacturer' => 'Global Drug', 'unit_of_measure' => 'strip', 'category' => 'Antacid', 'minimum_stock_level' => 35, 'price' => 15.00],
            ['name_generic' => 'Atorvastatin', 'name_brand' => 'Lipitor', 'strength' => '20mg', 'dosage_form' => 'Tablet', 'manufacturer' => 'PharmaTech', 'unit_of_measure' => 'strip', 'category' => 'Antihyperlipidemic', 'minimum_stock_level' => 25, 'price' => 22.50],
            ['name_generic' => 'Ibuprofen', 'name_brand' => 'Advil', 'strength' => '400mg', 'dosage_form' => 'Tablet', 'manufacturer' => 'MediCore', 'unit_of_measure' => 'strip', 'category' => 'Analgesic', 'minimum_stock_level' => 45, 'price' => 6.00],
            ['name_generic' => 'Amlodipine', 'name_brand' => 'Norvasc', 'strength' => '5mg', 'dosage_form' => 'Tablet', 'manufacturer' => 'Apex Med', 'unit_of_measure' => 'strip', 'category' => 'Antihypertensive', 'minimum_stock_level' => 30, 'price' => 9.50],
            ['name_generic' => 'Cetirizine', 'name_brand' => 'Zyrtec', 'strength' => '10mg', 'dosage_form' => 'Tablet', 'manufacturer' => 'Nova Pharma', 'unit_of_measure' => 'strip', 'category' => 'Antihistamine', 'minimum_stock_level' => 40, 'price' => 11.00],
            ['name_generic' => 'Albuterol', 'name_brand' => 'Ventolin', 'strength' => '90mcg', 'dosage_form' => 'Inhaler', 'manufacturer' => 'Global Drug', 'unit_of_measure' => 'piece', 'category' => 'Bronchodilator', 'minimum_stock_level' => 15, 'price' => 25.00],
        ];

        foreach ($products as $product) {
            Product::create($product);
        }
    }
}
