<?php

namespace Database\Seeders;

use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\Medicine;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Carbon\Carbon;

class SaleSeeder extends Seeder
{
    public function run(): void
    {
        // Get the actual columns from the sales table
        $columns = Schema::getColumnListing('sales');
        $this->command->info('📋 Sales table columns: ' . implode(', ', $columns));

        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        SaleItem::truncate();
        Sale::truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        $medicines = Medicine::all();
        $users = User::where('status', 'approved')->get();

        $this->command->info('📊 Medicines found: ' . $medicines->count());
        $this->command->info('👤 Approved users found: ' . $users->count());

        if ($medicines->isEmpty() || $users->isEmpty()) {
            $this->command->warn('⚠️ No medicines or approved users found! Skipping SaleSeeder.');
            return;
        }

        $salesCreated = 0;
        $itemsCreated = 0;

        // Create 20 sales
        for ($i = 0; $i < 20; $i++) {
            $user = $users->random();
            $saleDate = Carbon::now()->subDays(rand(0, 30))->setTime(rand(8, 20), rand(0, 59), 0);

            // Select 1-4 random medicines
            $numItems = rand(1, 4);
            $selectedMedicines = $medicines->random(min($numItems, $medicines->count()));

            $totalAmount = 0;
            $items = [];

            foreach ($selectedMedicines as $medicine) {
                $quantity = rand(1, 4);
                $price = $medicine->selling_price ?? rand(50, 200);
                $subtotal = $quantity * $price;
                $totalAmount += $subtotal;

                $items[] = [
                    'medicine_id' => $medicine->id,
                    'quantity' => $quantity,
                    'unit_price' => $price,
                    'subtotal' => $subtotal,
                ];
            }

            // Build sale data based on available columns
            $saleData = [
                'user_id' => $user->id,
                'status' => 'completed',
                'sale_date' => $saleDate,
                'created_at' => $saleDate,
                'updated_at' => $saleDate,
            ];

            // Add columns if they exist
            if (in_array('total_amount', $columns)) {
                $saleData['total_amount'] = $totalAmount;
            }

            if (in_array('subtotal', $columns)) {
                $saleData['subtotal'] = $totalAmount;
            }

            if (in_array('discount', $columns)) {
                $saleData['discount'] = rand(0, 10) > 7 ? rand(5, 15) : 0;
            }

            if (in_array('tax', $columns)) {
                $saleData['tax'] = round($totalAmount * 0.15, 2);
            }

            if (in_array('grand_total', $columns)) {
                $discount = $saleData['discount'] ?? 0;
                $tax = $saleData['tax'] ?? 0;
                $saleData['grand_total'] = $totalAmount - $discount + $tax;
            }

            if (in_array('total', $columns)) {
                $saleData['total'] = $totalAmount;
            }

            // Add customer fields if they exist
            if (in_array('customer_name', $columns)) {
                $saleData['customer_name'] = 'Customer ' . rand(1, 100);
            }

            if (in_array('customer_phone', $columns)) {
                $saleData['customer_phone'] = '+2519' . rand(10000000, 99999999);
            }

            try {
                // Create the sale
                $sale = Sale::create($saleData);

                if ($sale) {
                    $salesCreated++;

                    // Create sale items
                    foreach ($items as $item) {
                        $itemData = [
                            'sale_id' => $sale->id,
                            'medicine_id' => $item['medicine_id'],
                            'quantity' => $item['quantity'],
                            'unit_price' => $item['unit_price'],
                        ];

                        // Check if 'total' or 'subtotal' column exists in sale_items
                        $itemColumns = Schema::getColumnListing('sale_items');

                        if (in_array('total', $itemColumns)) {
                            $itemData['total'] = $item['subtotal'];
                        }

                        if (in_array('subtotal', $itemColumns)) {
                            $itemData['subtotal'] = $item['subtotal'];
                        }

                        SaleItem::create($itemData);
                        $itemsCreated++;
                    }
                }
            } catch (\Exception $e) {
                $this->command->error('❌ Error creating sale: ' . $e->getMessage());
                // Continue with next sale
            }
        }

        $this->command->info('✅ Sales created: ' . $salesCreated);
        $this->command->info('✅ Sale items created: ' . $itemsCreated);

        // Show sample data
        $sampleSale = Sale::with('items')->first();
        if ($sampleSale) {
            $this->command->info('📊 Sample sale: #' . $sampleSale->id . ' - Total: $' . $sampleSale->total_amount);
            $this->command->info('📊 Sample items: ' . $sampleSale->items->count() . ' items');
        }
    }
}
