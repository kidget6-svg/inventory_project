<?php

namespace Tests\Feature;

use App\Models\Medicine;
use App\Models\PurchaseOrder;
use App\Models\PurchaseOrderItem;
use App\Models\StockMovement;
use App\Models\Supplier;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PurchaseOrderWorkflowTest extends TestCase
{
    use RefreshDatabase;

    public function test_purchase_order_can_be_approved_and_stock_updated(): void
    {
        $supplier = Supplier::create([
            'name' => 'Test Supplier',
            'contact_person' => 'Jane',
            'email' => 'supplier@example.com',
            'phone' => '0712345678',
            'address' => 'Nairobi',
        ]);

        $medicine = Medicine::create([
            'name' => 'Paracetamol',
            'sku' => 'PARA-001',
            'quantity' => 10,
            'reorder_level' => 5,
            'unit_price' => 5.00,
            'category_id' => null,
            'supplier_id' => $supplier->id,
        ]);

        $purchaseOrder = PurchaseOrder::create([
            'supplier_id' => $supplier->id,
            'order_date' => now()->toDateString(),
            'status' => 'pending',
            'total_amount' => 50.00,
        ]);

        PurchaseOrderItem::create([
            'purchase_order_id' => $purchaseOrder->id,
            'medicine_id' => $medicine->id,
            'quantity' => 5,
            'unit_price' => 10.00,
            'subtotal' => 50.00,
        ]);

        $this->assertTrue($purchaseOrder->approve());

        $purchaseOrder->refresh();
        $medicine->refresh();

        $this->assertSame('approved', $purchaseOrder->status);
        $this->assertSame(15, $medicine->quantity);
        $this->assertDatabaseHas('stock_movements', [
            'medicine_id' => $medicine->id,
            'type' => 'in',
            'reference' => 'PO-' . $purchaseOrder->id,
        ]);
    }
}
