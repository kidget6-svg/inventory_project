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

    public function test_purchase_order_workflow_draft_to_completed(): void
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
            'generic_name' => 'Acetaminophen',
            'batch_number' => 'BATCH001',
            'quantity' => 10,
            'reorder_level' => 5,
            'unit_price' => 5.00,
            'category_id' => null,
            'supplier_id' => $supplier->id,
        ]);

        $purchaseOrder = PurchaseOrder::create([
            'supplier_id' => $supplier->id,
            'order_date' => now()->toDateString(),
            'status' => 'draft',
            'total_amount' => 50.00,
        ]);

        PurchaseOrderItem::create([
            'purchase_order_id' => $purchaseOrder->id,
            'medicine_id' => $medicine->id,
            'quantity' => 5,
            'unit_price' => 10.00,
            'subtotal' => 50.00,
        ]);

        // Step 1: Submit (draft → pending)
        $this->assertTrue($purchaseOrder->submit());
        $purchaseOrder->refresh();
        $this->assertSame('pending', $purchaseOrder->status);

        // Step 2: Send (pending → sent)
        $this->assertTrue($purchaseOrder->send());
        $purchaseOrder->refresh();
        $this->assertSame('sent', $purchaseOrder->status);
        $purchaseOrder->update(['sent_at' => now()]);
        $purchaseOrder->refresh();
        $this->assertNotNull($purchaseOrder->sent_at);

        // Stock should NOT have changed yet (still 10)
        $medicine->refresh();
        $this->assertSame(10, $medicine->quantity);

        // Step 3: Complete (sent → completed) — stock increases
        $this->assertTrue($purchaseOrder->complete());
        $purchaseOrder->refresh();
        $this->assertSame('completed', $purchaseOrder->status);
        $this->assertNotNull($purchaseOrder->completed_at);

        // Stock should now be 15 (10 + 5)
        $medicine->refresh();
        $this->assertSame(15, $medicine->quantity);

        // Verify stock movement was created
        $this->assertDatabaseHas('stock_movements', [
            'medicine_id' => $medicine->id,
            'type' => 'in',
            'quantity' => 5,
            'reference' => 'PO-' . $purchaseOrder->id,
        ]);
    }

    public function test_purchase_order_can_be_cancelled_at_any_stage(): void
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
            'generic_name' => 'Acetaminophen',
            'batch_number' => 'BATCH001',
            'quantity' => 10,
            'reorder_level' => 5,
            'unit_price' => 5.00,
            'category_id' => null,
            'supplier_id' => $supplier->id,
        ]);

        // Test cancellation from draft
        $order = PurchaseOrder::create([
            'supplier_id' => $supplier->id,
            'order_date' => now()->toDateString(),
            'status' => 'draft',
            'total_amount' => 50.00,
        ]);

        $this->assertTrue($order->cancel());
        $order->refresh();
        $this->assertSame('cancelled', $order->status);

        // Test cancellation from pending
        $order = PurchaseOrder::create([
            'supplier_id' => $supplier->id,
            'order_date' => now()->toDateString(),
            'status' => 'pending',
            'total_amount' => 50.00,
        ]);

        $this->assertTrue($order->cancel());
        $order->refresh();
        $this->assertSame('cancelled', $order->status);

        // Test cancellation from sent
        $order = PurchaseOrder::create([
            'supplier_id' => $supplier->id,
            'order_date' => now()->toDateString(),
            'status' => 'sent',
            'total_amount' => 50.00,
        ]);

        $this->assertTrue($order->cancel());
        $order->refresh();
        $this->assertSame('cancelled', $order->status);

        // Test cancellation from delivered
        $order = PurchaseOrder::create([
            'supplier_id' => $supplier->id,
            'order_date' => now()->toDateString(),
            'status' => 'delivered',
            'total_amount' => 50.00,
        ]);

        $this->assertTrue($order->cancel());
        $order->refresh();
        $this->assertSame('cancelled', $order->status);
    }

    public function test_purchase_order_cannot_be_cancelled_when_completed(): void
    {
        $supplier = Supplier::create([
            'name' => 'Test Supplier',
            'contact_person' => 'Jane',
            'email' => 'supplier@example.com',
            'phone' => '0712345678',
            'address' => 'Nairobi',
        ]);

        $order = PurchaseOrder::create([
            'supplier_id' => $supplier->id,
            'order_date' => now()->toDateString(),
            'status' => 'completed',
            'total_amount' => 50.00,
        ]);

        $this->assertFalse($order->cancel());
        $order->refresh();
        $this->assertSame('completed', $order->status);
    }
}
