<?php

namespace Tests\Feature;

use App\Models\Medicine;
use App\Models\PurchaseOrder;
use App\Models\PurchaseOrderItem;
use App\Models\StockMovement;
use App\Models\Supplier;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PurchaseOrderTest extends TestCase
{
    use RefreshDatabase;

    private function adminUser()
    {
        return User::factory()->create(['role' => 'admin']);
    }

    private function createMedicine(int $quantity = 100): Medicine
    {
        return Medicine::factory()->create([
            'quantity' => $quantity,
            'reorder_level' => 10,
        ]);
    }

    private function createOrderWithItem(Medicine $medicine, int $quantity = 20, string $status = 'pending'): PurchaseOrder
    {
        $order = PurchaseOrder::create([
            'supplier_id' => Supplier::factory()->create()->id,
            'order_date' => now()->toDateString(),
            'total_amount' => $quantity * 10,
            'status' => $status,
        ]);

        PurchaseOrderItem::create([
            'purchase_order_id' => $order->id,
            'medicine_id' => $medicine->id,
            'quantity' => $quantity,
            'unit_price' => 10.00,
            'subtotal' => $quantity * 10,
        ]);

        return $order;
    }

    public function test_admin_can_view_all_purchase_orders()
    {
        $user = $this->adminUser();
        $supplier = Supplier::factory()->create();
        $medicine = $this->createMedicine();

        PurchaseOrder::factory()->count(3)->create([
            'supplier_id' => $supplier->id,
        ]);

        $response = $this->actingAs($user)->getJson('/purchase-orders');

        $response->assertOk()
            ->assertJsonCount(3);
    }

    public function test_admin_can_create_a_purchase_order()
    {
        $user = $this->adminUser();
        $supplier = Supplier::factory()->create();
        $medicine = $this->createMedicine(50);

        $response = $this->actingAs($user)->postJson('/purchase-orders', [
            'supplier_id' => $supplier->id,
            'order_date' => now()->toDateString(),
            'medicine_id' => $medicine->id,
            'quantity' => 25,
            'unit_price' => 10.50,
        ]);

        $response->assertCreated()
            ->assertJsonFragment([
                'supplier_id' => $supplier->id,
                'status' => 'pending',
            ]);

        // Verify the purchase order was created
        $this->assertDatabaseHas('purchase_orders', [
            'supplier_id' => $supplier->id,
            'status' => 'pending',
        ]);

        // Verify the purchase order item was created
        $this->assertDatabaseHas('purchase_order_items', [
            'medicine_id' => $medicine->id,
            'quantity' => 25,
            'unit_price' => 10.50,
        ]);

        // Verify medicine stock did NOT increase (stock is added on completion)
        $medicine->refresh();
        $this->assertEquals(50, $medicine->quantity);
    }

    public function test_create_purchase_order_requires_supplier_and_medicine()
    {
        $user = $this->adminUser();

        $response = $this->actingAs($user)->postJson('/purchase-orders', [
            'order_date' => now()->toDateString(),
            'quantity' => 10,
            'unit_price' => 5.00,
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['supplier_id', 'medicine_id']);
    }

    public function test_admin_can_edit_a_pending_purchase_order()
    {
        $user = $this->adminUser();
        $medicine = $this->createMedicine(100);
        $order = $this->createOrderWithItem($medicine, 20, 'pending');

        // Medicine stock should still be 100 (no stock added at creation)
        $medicine->refresh();
        $this->assertEquals(100, $medicine->quantity);

        // Edit the order: change quantity to 30
        $response = $this->actingAs($user)->putJson("/purchase-orders/{$order->id}", [
            'supplier_id' => $order->supplier_id,
            'order_date' => now()->toDateString(),
            'medicine_id' => $medicine->id,
            'quantity' => 30,
            'unit_price' => 10.00,
        ]);

        $response->assertOk()
            ->assertJsonFragment([
                'status' => 'pending',
            ]);

        // Verify the item was updated
        $this->assertDatabaseHas('purchase_order_items', [
            'purchase_order_id' => $order->id,
            'quantity' => 30,
        ]);

        // Verify medicine stock did NOT change (stock is only added on completion)
        $medicine->refresh();
        $this->assertEquals(100, $medicine->quantity);
    }

    public function test_admin_can_delete_a_pending_purchase_order()
    {
        $user = $this->adminUser();
        $medicine = $this->createMedicine(100);
        $order = $this->createOrderWithItem($medicine, 25, 'pending');

        // Medicine stock should still be 100 (no stock added at creation)
        $medicine->refresh();
        $this->assertEquals(100, $medicine->quantity);

        // Delete the order
        $response = $this->actingAs($user)->deleteJson("/purchase-orders/{$order->id}");

        $response->assertOk()
            ->assertJson(['message' => 'Purchase order deleted']);

        // Verify the order was deleted
        $this->assertDatabaseMissing('purchase_orders', ['id' => $order->id]);

        // Verify medicine stock was NOT reversed (no stock was added)
        $medicine->refresh();
        $this->assertEquals(100, $medicine->quantity);
    }

    public function test_admin_can_approve_a_purchase_order()
    {
        $user = $this->adminUser();
        $medicine = $this->createMedicine();
        $order = $this->createOrderWithItem($medicine, 20, 'pending');

        $response = $this->actingAs($user)->postJson("/purchase-orders/{$order->id}/approve");

        $response->assertOk()
            ->assertJsonFragment([
                'status' => 'approved',
            ]);

        $this->assertDatabaseHas('purchase_orders', [
            'id' => $order->id,
            'status' => 'approved',
        ]);
    }

    public function test_admin_can_process_a_purchase_order()
    {
        $user = $this->adminUser();
        $medicine = $this->createMedicine();
        $order = $this->createOrderWithItem($medicine, 20, 'approved');

        $response = $this->actingAs($user)->postJson("/purchase-orders/{$order->id}/process");

        $response->assertOk()
            ->assertJsonFragment([
                'status' => 'processing',
            ]);

        $this->assertDatabaseHas('purchase_orders', [
            'id' => $order->id,
            'status' => 'processing',
        ]);
    }

    public function test_admin_can_complete_a_purchase_order_and_stock_increases()
    {
        $user = $this->adminUser();
        $medicine = $this->createMedicine(100);
        $order = $this->createOrderWithItem($medicine, 25, 'approved');

        $response = $this->actingAs($user)->postJson("/purchase-orders/{$order->id}/complete");

        $response->assertOk()
            ->assertJsonFragment([
                'status' => 'completed',
            ]);

        // Verify the order was completed
        $this->assertDatabaseHas('purchase_orders', [
            'id' => $order->id,
            'status' => 'completed',
        ]);

        // Verify medicine stock increased by 25 (from 100 to 125)
        $medicine->refresh();
        $this->assertEquals(125, $medicine->quantity);

        // Verify a stock movement record was created
        $this->assertDatabaseHas('stock_movements', [
            'medicine_id' => $medicine->id,
            'type' => 'in',
            'quantity' => 25,
            'reference' => 'PO-' . $order->id,
        ]);
    }

    public function test_complete_prevents_duplicate_stock_additions()
    {
        $user = $this->adminUser();
        $medicine = $this->createMedicine(100);
        $order = $this->createOrderWithItem($medicine, 25, 'approved');

        // Complete the order
        $this->actingAs($user)->postJson("/purchase-orders/{$order->id}/complete");

        // Medicine stock should be 125
        $medicine->refresh();
        $this->assertEquals(125, $medicine->quantity);

        // Try to complete again (should not add stock again)
        $order->update(['status' => 'approved']);
        $this->actingAs($user)->postJson("/purchase-orders/{$order->id}/complete");

        // Medicine stock should still be 125 (no duplicate addition)
        $medicine->refresh();
        $this->assertEquals(125, $medicine->quantity);

        // Only one stock movement record should exist
        $this->assertEquals(1, StockMovement::where('reference', 'PO-' . $order->id)->count());
    }

    public function test_admin_can_cancel_a_purchase_order()
    {
        $user = $this->adminUser();
        $medicine = $this->createMedicine();
        $order = $this->createOrderWithItem($medicine, 20, 'pending');

        $response = $this->actingAs($user)->postJson("/purchase-orders/{$order->id}/cancel");

        $response->assertOk()
            ->assertJsonFragment([
                'status' => 'cancelled',
            ]);

        $this->assertDatabaseHas('purchase_orders', [
            'id' => $order->id,
            'status' => 'cancelled',
        ]);
    }

    public function test_cannot_edit_completed_order()
    {
        $user = $this->adminUser();
        $medicine = $this->createMedicine();
        $order = $this->createOrderWithItem($medicine, 20, 'completed');

        $response = $this->actingAs($user)->putJson("/purchase-orders/{$order->id}", [
            'supplier_id' => $order->supplier_id,
            'order_date' => now()->toDateString(),
            'medicine_id' => $medicine->id,
            'quantity' => 30,
            'unit_price' => 10.00,
        ]);

        $response->assertStatus(422)
            ->assertJsonFragment([
                'message' => 'Cannot edit order in completed status',
            ]);
    }

    public function test_cannot_delete_approved_order()
    {
        $user = $this->adminUser();
        $medicine = $this->createMedicine();
        $order = $this->createOrderWithItem($medicine, 20, 'approved');

        $response = $this->actingAs($user)->deleteJson("/purchase-orders/{$order->id}");

        $response->assertStatus(422)
            ->assertJsonFragment([
                'message' => 'Cannot delete order in approved status',
            ]);

        // Verify the order still exists
        $this->assertDatabaseHas('purchase_orders', ['id' => $order->id]);
    }

    public function test_cannot_approve_non_pending_order()
    {
        $user = $this->adminUser();
        $medicine = $this->createMedicine();
        $order = $this->createOrderWithItem($medicine, 20, 'approved');

        $response = $this->actingAs($user)->postJson("/purchase-orders/{$order->id}/approve");

        $response->assertStatus(422)
            ->assertJsonFragment([
                'message' => 'Cannot approve order in approved status',
            ]);
    }

    public function test_purchase_order_show_returns_order_with_items()
    {
        $user = $this->adminUser();
        $medicine = $this->createMedicine();
        $order = $this->createOrderWithItem($medicine, 10, 'pending');

        $response = $this->actingAs($user)->getJson("/purchase-orders/{$order->id}");

        $response->assertOk()
            ->assertJsonFragment([
                'supplier_id' => $order->supplier_id,
            ])
            ->assertJsonStructure([
                'supplier',
                'items',
            ]);
    }

    public function test_non_admin_cannot_access_purchase_orders()
    {
        $cashier = User::factory()->create(['role' => 'cashier']);

        $response = $this->actingAs($cashier)->getJson('/purchase-orders');

        $response->assertStatus(403);
    }
}
