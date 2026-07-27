<?php

namespace Database\Seeders;

use App\Models\Batch;
use App\Models\Product;
use App\Models\Supplier;
use Illuminate\Database\Seeder;

class BatchSeeder extends Seeder
{
    public function run(): void
    {
        $products = Product::all();
        $suppliers = Supplier::all();

        $batches = [
            ['product_id' => 1, 'supplier_id' => 1, 'batch_number' => 'BT001-PAR-001', 'expiry_date' => '2026-12-31', 'quantity_received' => 500, 'quantity_remaining' => 320, 'cost_price' => 2.50, 'received_date' => '2025-06-01'],
            ['product_id' => 1, 'supplier_id' => 1, 'batch_number' => 'BT001-PAR-002', 'expiry_date' => '2025-08-15', 'quantity_received' => 300, 'quantity_remaining' => 85, 'cost_price' => 2.50, 'received_date' => '2025-02-01'],
            ['product_id' => 2, 'supplier_id' => 2, 'batch_number' => 'BT002-AMX-001', 'expiry_date' => '2026-06-30', 'quantity_received' => 200, 'quantity_remaining' => 150, 'cost_price' => 6.00, 'received_date' => '2025-05-15'],
            ['product_id' => 3, 'supplier_id' => 4, 'batch_number' => 'BT003-LIS-001', 'expiry_date' => '2025-09-30', 'quantity_received' => 150, 'quantity_remaining' => 15, 'cost_price' => 4.50, 'received_date' => '2025-03-10'],
            ['product_id' => 3, 'supplier_id' => 4, 'batch_number' => 'BT003-LIS-002', 'expiry_date' => '2027-01-15', 'quantity_received' => 200, 'quantity_remaining' => 120, 'cost_price' => 4.50, 'received_date' => '2025-06-20'],
            ['product_id' => 4, 'supplier_id' => 5, 'batch_number' => 'BT004-MET-001', 'expiry_date' => '2026-03-31', 'quantity_received' => 300, 'quantity_remaining' => 250, 'cost_price' => 3.50, 'received_date' => '2025-04-01'],
            ['product_id' => 5, 'supplier_id' => 3, 'batch_number' => 'BT005-OME-001', 'expiry_date' => '2025-07-30', 'quantity_received' => 100, 'quantity_remaining' => 5, 'cost_price' => 7.00, 'received_date' => '2025-01-15'],
            ['product_id' => 6, 'supplier_id' => 1, 'batch_number' => 'BT006-ATO-001', 'expiry_date' => '2026-08-31', 'quantity_received' => 120, 'quantity_remaining' => 90, 'cost_price' => 11.00, 'received_date' => '2025-05-20'],
            ['product_id' => 7, 'supplier_id' => 2, 'batch_number' => 'BT007-IBU-001', 'expiry_date' => '2025-11-30', 'quantity_received' => 250, 'quantity_remaining' => 200, 'cost_price' => 3.00, 'received_date' => '2025-03-15'],
            ['product_id' => 8, 'supplier_id' => 4, 'batch_number' => 'BT008-AMD-001', 'expiry_date' => '2026-04-15', 'quantity_received' => 100, 'quantity_remaining' => 75, 'cost_price' => 5.00, 'received_date' => '2025-04-10'],
            ['product_id' => 9, 'supplier_id' => 5, 'batch_number' => 'BT009-CET-001', 'expiry_date' => '2025-10-15', 'quantity_received' => 150, 'quantity_remaining' => 100, 'cost_price' => 5.50, 'received_date' => '2025-03-20'],
            ['product_id' => 10, 'supplier_id' => 3, 'batch_number' => 'BT010-ALB-001', 'expiry_date' => '2025-09-15', 'quantity_received' => 50, 'quantity_remaining' => 30, 'cost_price' => 12.00, 'received_date' => '2025-02-15'],
            ['product_id' => 10, 'supplier_id' => 3, 'batch_number' => 'BT010-ALB-002', 'expiry_date' => '2027-02-28', 'quantity_received' => 80, 'quantity_remaining' => 60, 'cost_price' => 12.00, 'received_date' => '2025-06-10'],
        ];

        foreach ($batches as $batch) {
            Batch::create($batch);
        }
    }
}
