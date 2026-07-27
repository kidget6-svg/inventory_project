<?php

namespace Database\Seeders;

use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\Batch;
use App\Models\Product;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SaleSeeder extends Seeder
{
    public function run(): void
    {
        $cashier = User::whereHas('role', function ($q) {
            $q->where('name', 'cashier');
        })->first();

        if (!$cashier) {
            return;
        }

        $paymentMethods = ['cash', 'card', 'insurance'];
        $customers = ['Walk-in', 'John Smith', 'Mary Johnson', 'Robert Davis', 'Patricia Miller'];

        for ($i = 0; $i < 25; $i++) {
            $date = now()->subDays(rand(0, 6))->setTime(rand(8, 20), rand(0, 59));

            $sale = Sale::create([
                'user_id' => $cashier->id,
                'invoice_number' => 'INV-' . now()->year . '-' . str_pad($i + 1, 4, '0', STR_PAD_LEFT),
                'customer_name' => $customers[array_rand($customers)],
                'total_amount' => 0,
                'discount' => 0,
                'tax' => 0,
                'payment_method' => $paymentMethods[array_rand($paymentMethods)],
                'payment_status' => 'completed',
                'created_at' => $date,
                'updated_at' => $date,
            ]);

            $itemCount = rand(1, 4);
            $totalAmount = 0;

            for ($j = 0; $j < $itemCount; $j++) {
                $product = Product::inRandomOrder()->first();
                $batch = Batch::where('product_id', $product->id)
                    ->where('quantity_remaining', '>', 0)
                    ->inRandomOrder()
                    ->first();

                if (!$batch) {
                    continue;
                }

                $quantity = rand(1, 5);
                $unitPrice = $product->price;
                $totalPrice = $quantity * $unitPrice;
                $totalAmount += $totalPrice;

                SaleItem::create([
                    'sale_id' => $sale->id,
                    'product_id' => $product->id,
                    'batch_id' => $batch->id,
                    'quantity' => $quantity,
                    'unit_price' => $unitPrice,
                    'total_price' => $totalPrice,
                    'created_at' => $date,
                    'updated_at' => $date,
                ]);

                // Reduce batch stock
                $batch->decrement('quantity_remaining', $quantity);

                // Record stock ledger entry
                DB::table('stock_ledger')->insert([
                    'batch_id' => $batch->id,
                    'product_id' => $product->id,
                    'transaction_type' => 'out',
                    'quantity_change' => -$quantity,
                    'quantity_before' => $batch->quantity_remaining + $quantity,
                    'quantity_after' => $batch->quantity_remaining,
                    'reference_type' => 'Sale',
                    'reference_id' => $sale->id,
                    'user_id' => $cashier->id,
                    'created_at' => $date,
                ]);
            }

            $sale->update(['total_amount' => $totalAmount]);
        }
    }
}
