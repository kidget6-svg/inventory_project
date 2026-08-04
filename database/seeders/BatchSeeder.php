<?php
// database/seeders/BatchSeeder.php

namespace Database\Seeders;

use App\Models\Batch;
use App\Models\Medicine;
use App\Models\Supplier;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class BatchSeeder extends Seeder
{
    public function run(): void
    {
        // Check if Batch model exists
        if (!class_exists('App\\Models\\Batch')) {
            $this->command->warn('⚠️ Batch model not found! Skipping BatchSeeder.');
            return;
        }

        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        Batch::truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        $medicines = Medicine::all();
        $suppliers = Supplier::all();

        if ($medicines->isEmpty() || $suppliers->isEmpty()) {
            $this->command->warn('⚠️ No medicines or suppliers found! Skipping BatchSeeder.');
            return;
        }

        foreach ($medicines as $medicine) {
            $numBatches = rand(2, 3);
            
            for ($i = 0; $i < $numBatches; $i++) {
                $quantity = rand(5, 100);
                $isLowStock = rand(0, 2) == 0;
                
                if ($isLowStock) {
                    $quantity = rand(0, 5);
                }

                $isExpiringSoon = rand(0, 3) == 0;
                $expiryDate = now()->addMonths(rand(1, 12));
                
                if ($isExpiringSoon) {
                    $expiryDate = now()->addDays(rand(10, 80));
                }

                Batch::create([
                    'medicine_id' => $medicine->id,
                    'batch_number' => 'BATCH-' . $medicine->id . '-' . rand(1000, 9999),
                    'quantity' => $quantity,
                    'expiry_date' => $expiryDate,
                    'received_date' => now()->subDays(rand(1, 30)),
                    'unit_cost' => rand(10, 100),
                    'supplier_id' => $suppliers->random()->id,
                ]);
            }
        }

        $this->command->info('✅ Batches created successfully!');
    }
}