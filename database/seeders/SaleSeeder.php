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
        $itemColumns = Schema::getColumnListing('sale_items');
        $this->command->info('📋 Sale items table columns: ' . implode(', ', $itemColumns));

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

        // Get sale_items columns
        $itemColumns = Schema::getColumnListing('sale_items');
        $this->command->info('📋 Sale Items columns: ' . implode(', ', $itemColumns));

        // Check if batch_id exists in sale_items
        $hasBatchId = in_array('batch_id', $itemColumns);
        $hasItemableType = in_array('itemable_type', $itemColumns);
        $hasItemableId = in_array('itemable_id', $itemColumns);

        $salesCreated = 0;
        $itemsCreated = 0;
        $receiptCounter = 1;

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
                $price = $medicine->selling_price ?? $medicine->unit_price ?? rand(50, 200);
                $subtotal = $quantity * $price;
                $totalAmount += $subtotal;

                $itemData = [
                    'medicine_id' => $medicine->id,
                    'quantity' => $quantity,
                    'unit_price' => $price,
                    'subtotal' => $subtotal,
                ];

                // Only add batch_id if the column exists
                if ($hasBatchId) {
                    $itemData['batch_id'] = $medicine->batches()->first()?->id ?? null;
                }

                // Only add itemable fields if they exist
                if ($hasItemableType) {
                    $itemData['itemable_type'] = 'App\\Models\\Medicine';
                }
                if ($hasItemableId) {
                    $itemData['itemable_id'] = $medicine->id;
                }

                $items[] = $itemData;
            }

            // ✅ FIXED: Generate unique receipt number
            $receiptNumber = 'RCP-' . date('Ymd') . '-' . str_pad($receiptCounter, 4, '0', STR_PAD_LEFT);
            $receiptCounter++;

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

            if (in_array('net_amount', $columns)) {
                $saleData['net_amount'] = $totalAmount;
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

            if (in_array('payment_method', $columns)) {
                $saleData['payment_method'] = ['cash', 'telebirr', 'card', 'bank_transfer'][rand(0, 3)];
            }

            if (in_array('amount_paid', $columns)) {
                $saleData['amount_paid'] = $totalAmount;
            }

            if (in_array('change_amount', $columns)) {
                $saleData['change_amount'] = 0;
            }

            if (in_array('payment_status', $columns)) {
                $saleData['payment_status'] = 'paid';
            }

            if (in_array('receipt_number', $columns)) {
                $saleData['receipt_number'] = $receiptNumber;
            }

            // Add customer fields if they exist
            if (in_array('customer_name', $columns)) {
                $saleData['customer_name'] = 'Customer ' . rand(1, 100);
            }

            if (in_array('customer_phone', $columns)) {
                $saleData['customer_phone'] = '+2519' . rand(10000000, 99999999);
            }

            if (in_array('customer_email', $columns)) {
                $saleData['customer_email'] = 'customer' . rand(1, 100) . '@example.com';
            }

            // ✅ FIXED: Use proper type values - 'prescription' or 'otc' only
            if (in_array('type', $columns)) {
                $saleData['type'] = rand(0, 1) === 0 ? 'prescription' : 'retail';
            }

            if (in_array('notes', $columns)) {
                $saleData['notes'] = 'Auto-generated sale';
            }

            // Add branch_id if column exists
            if (in_array('branch_id', $columns)) {
                $saleData['branch_id'] = null;
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
                            'created_at' => $saleDate,
                            'updated_at' => $saleDate,
                        ];

                        // Only add fields that exist
                        if ($hasBatchId) {
                            $itemData['batch_id'] = $item['batch_id'] ?? null;
                        }
                        if ($hasItemableType) {
                            $itemData['itemable_type'] = $item['itemable_type'] ?? 'App\\Models\\Medicine';
                        }
                        if ($hasItemableId) {
                            $itemData['itemable_id'] = $item['itemable_id'] ?? $item['medicine_id'];
                        }

                        // Check if 'total' or 'subtotal' column exists in sale_items
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
