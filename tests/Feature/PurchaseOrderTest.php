<?php

namespace Tests\Feature;

use App\Models\Medicine;
use App\Models\PurchaseOrder;
use App\Models\PurchaseOrderItem;
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
            ->assertJsonCount(3, 'data');
    }

    public function test_admin_can_create_a_purchase_order_and_stock_increases()
    {
        $user = $this->adminUser();
        $supplier = Supplier::factory()->create();
        $medicine = $this->createMedicine(50);

        $response = $this->actingAs($user)->postJson('/purchase-orders', [
            'supplier_id' => $supplier->id,
            'order_date' => now()->toDateString(),
            'status' => 'pending',
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

        // Verify medicine stock increased
        $medicine->refresh();
        $this->assertEquals(75, $medicine->quantity);
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

    public function test_admin_can_edit_a_purchase_order_and_stock_adjusts()
    {
        $user = $this->adminUser();
        $supplier = Supplier::factory()->create();
        $medicine = $this->createMedicine(100);

        // Create an initial order with quantity 20
        $order = PurchaseOrder::create([
            'supplier_id' => $supplier->id,
            'order_date' => now()->toDateString(),
            'total_amount' => 200,
            'status' => 'pending',
        ]);

        PurchaseOrderItem::create([
            'purchase_order_id' => $order->id,
            'medicine_id' => $medicine->id,
            'quantity' => 20,
            'unit_price' => 10.00,
            'subtotal' => 200,
        ]);

        // Medicine stock should be 120 after creation
        $medicine->refresh();
        $this->assertEquals(120, $medicine->quantity);

        // Edit the order: change quantity to 30 (increase by 10)
        $response = $this->actingAs($user)->putJson("/purchase-orders/{$order->id}", [
            'supplier_id' => $supplier->id,
            'order_date' => now()->toDateString(),
            'status' => 'completed',
            'medicine_id' => $medicine->id,
            'quantity' => 30,
            'unit_price' => 10.00,
        ]);

        $response->assertOk()
            ->assertJsonFragment([
                'status' => 'completed',
            ]);

        // Verify the order was updated
        $this->assertDatabaseHas('purchase_orders', [
            'id' => $order->id,
            'status' => 'completed',
        ]);

        // Verify the item was updated
        $this->assertDatabaseHas('purchase_order_items', [
            'purchase_order_id' => $order->id,
            'quantity' => 30,
        ]);

        // Verify medicine stock increased by 10 (from 120 to 130)
        $medicine->refresh();
        $this->assertEquals(130, $medicine->quantity);
    }

    public function test_admin_can_delete_a_purchase_order_and_stock_reverses()
    {
        $user = $this->adminUser();
        $supplier = Supplier::factory()->create();
        $medicine = $this->createMedicine(100);

        // Create an order with quantity 25
        $order = PurchaseOrder::create([
            'supplier_id' => $supplier->id,
            'order_date' => now()->toDateString(),
            'total_amount' => 250,
            'status' => 'pending',
        ]);

        PurchaseOrderItem::create([
            'purchase_order_id' => $order->id,
            'medicine_id' => $medicine->id,
            'quantity' => 25,
            'unit_price' => 10.00,
            'subtotal' => 250,
        ]);

        // Medicine stock should be 125 after creation
        $medicine->refresh();
        $this->assertEquals(125, $medicine->quantity);

        // Delete the order
        $response = $this->actingAs($user)->deleteJson("/purchase-orders/{$order->id}");

        $response->assertOk()
            ->assertJson(['message' => 'Purchase order deleted']);

        // Verify the order was deleted
        $this->assertDatabaseMissing('purchase_orders', ['id' => $order->id]);

        // Verify medicine stock was reversed (back to 100)
        $medicine->refresh();
        $this->assertEquals(100, $medicine->quantity);
    }

    public function test_purchase_order_show_returns_order_with_items()
    {
        $user = $this->adminUser();
        $supplier = Supplier::factory()->create();
        $medicine = $this->createMedicine();

        $order = PurchaseOrder::create([
            'supplier_id' => $supplier->id,
            'order_date' => now()->toDateString(),
            'total_amount' => 100,
            'status' => 'pending',
        ]);

        PurchaseOrderItem::create([
            'purchase_order_id' => $order->id,
            'medicine_id' => $medicine->id,
            'quantity' => 10,
            'unit_price' => 10.00,
            'subtotal' => 100,
        ]);

        $response = $this->actingAs($user)->getJson("/purchase-orders/{$order->id}");

        $response->assertOk()
            ->assertJsonFragment([
                'supplier_id' => $supplier->id,
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
