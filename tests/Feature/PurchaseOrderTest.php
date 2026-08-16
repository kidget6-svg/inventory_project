<?php

namespace Tests\Feature;

use App\Mail\PurchaseOrderMail;
use App\Models\Medicine;
use App\Models\PurchaseOrder;
use App\Models\PurchaseOrderItem;
use App\Models\StockMovement;
use App\Models\Supplier;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class PurchaseOrderTest extends TestCase
{
    use RefreshDatabase;

    private function adminUser()
    {
        return User::factory()->create([
            'role' => 'admin',
            'status' => 'approved',
        ]);
    }

    private function createMedicine(int $quantity = 100): Medicine
    {
        return Medicine::factory()->create([
            'quantity' => $quantity,
            'reorder_level' => 10,
        ]);
    }

    private function createOrderWithItem(Medicine $medicine, int $quantity = 20, string $status = 'draft'): PurchaseOrder
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
            ->assertJsonCount(3, 'data');
    }

    public function test_admin_can_create_a_purchase_order()
    {
        $user = $this->adminUser();
        $supplier = Supplier::factory()->create();
        $medicine = $this->createMedicine(50);

        $response = $this->actingAs($user)->postJson('/purchase-orders', [
            'supplier_id' => $supplier->id,
            'medicine_id' => $medicine->id,
            'quantity' => 25,
        ]);

        $response->assertCreated()
            ->assertJsonFragment([
                'supplier_id' => $supplier->id,
                'status' => 'draft',
            ]);

        // Verify the purchase order was created
        $this->assertDatabaseHas('purchase_orders', [
            'supplier_id' => $supplier->id,
            'status' => 'draft',
        ]);

        // Verify the purchase order item was created
        $this->assertDatabaseHas('purchase_order_items', [
            'medicine_id' => $medicine->id,
            'quantity' => 25,
            'unit_price' => 0,
        ]);

        // Verify medicine stock did NOT increase (stock is added on completion)
        $medicine->refresh();
        $this->assertEquals(50, $medicine->quantity);
    }

    public function test_create_purchase_order_requires_supplier_and_medicine()
    {
        $user = $this->adminUser();
        $supplier = Supplier::factory()->create();

        $response = $this->actingAs($user)->postJson('/purchase-orders', [
            'supplier_id' => $supplier->id,
            'quantity' => 10,
        ]);

        $response->assertStatus(422)
            ->assertJson(['message' => 'Medicine name or medicine ID is required']);
    }

    public function test_admin_can_edit_a_draft_purchase_order()
    {
        $user = $this->adminUser();
        $medicine = $this->createMedicine(100);
        $order = $this->createOrderWithItem($medicine, 20, 'draft');

        // Medicine stock should still be 100 (no stock added at creation)
        $medicine->refresh();
        $this->assertEquals(100, $medicine->quantity);

        // Edit the order: change quantity to 30
        $response = $this->actingAs($user)->putJson("/purchase-orders/{$order->id}", [
            'supplier_id' => $order->supplier_id,
            'medicine_id' => $medicine->id,
            'quantity' => 30,
        ]);
        $response->assertOk()
            ->assertJsonFragment([
                'status' => 'draft',
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

    public function test_admin_can_delete_a_draft_purchase_order()
    {
        $user = $this->adminUser();
        $medicine = $this->createMedicine(100);
        $order = $this->createOrderWithItem($medicine, 25, 'draft');

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

    public function test_admin_can_submit_a_draft_purchase_order()
    {
        $user = $this->adminUser();
        $medicine = $this->createMedicine();
        $order = $this->createOrderWithItem($medicine, 20, 'draft');

        $response = $this->actingAs($user)->postJson("/purchase-orders/{$order->id}/submit");

        $response->assertOk()
            ->assertJsonFragment([
                'status' => 'pending',
            ]);

        $this->assertDatabaseHas('purchase_orders', [
            'id' => $order->id,
            'status' => 'pending',
        ]);
    }

    public function test_admin_can_send_a_pending_purchase_order()
    {
        Mail::fake();

        $user = $this->adminUser();
        $medicine = $this->createMedicine();
        $order = $this->createOrderWithItem($medicine, 20, 'pending');

        $response = $this->actingAs($user)->postJson("/purchase-orders/{$order->id}/send");

        $response->assertOk()
            ->assertJsonFragment([
                'status' => 'sent',
            ]);

        $this->assertDatabaseHas('purchase_orders', [
            'id' => $order->id,
            'status' => 'sent',
        ]);

        // Verify sent_at was recorded
        $order->refresh();
        $this->assertNotNull($order->sent_at);

        // Verify the email was actually sent to the supplier
        Mail::assertSent(PurchaseOrderMail::class, function ($mail) use ($order) {
            return $mail->hasTo($order->supplier->email)
                && $mail->purchaseOrder->is($order);
        });
    }

    public function test_admin_can_preview_a_pending_purchase_order()
    {
        $user = $this->adminUser();
        $medicine = $this->createMedicine();
        $order = $this->createOrderWithItem($medicine, 20, 'pending');

        $response = $this->actingAs($user)->getJson("/purchase-orders/{$order->id}/preview");

        $response->assertOk()
            ->assertJsonStructure([
                'pdf',
                'purchase_order',
            ]);

        // Verify the PDF data is a valid base64-encoded string
        $this->assertNotEmpty($response->json('pdf'));
        $this->assertNotEmpty(base64_decode($response->json('pdf'), true));
    }

    public function test_can_preview_non_pending_order()
    {
        $user = $this->adminUser();
        $medicine = $this->createMedicine();
        $order = $this->createOrderWithItem($medicine, 20, 'sent');

        $response = $this->actingAs($user)->getJson("/purchase-orders/{$order->id}/preview");

        $response->assertOk()
            ->assertJsonStructure([
                'pdf',
                'purchase_order',
            ]);

        // Verify the PDF data is a valid base64-encoded string
        $this->assertNotEmpty($response->json('pdf'));
        $this->assertNotEmpty(base64_decode($response->json('pdf'), true));
    }

    public function test_can_preview_pdf_in_all_active_statuses()
    {
        $user = $this->adminUser();
        $medicine = $this->createMedicine();

        foreach (['pending', 'sent', 'delivered', 'completed', 'cancelled'] as $status) {
            $order = $this->createOrderWithItem($medicine, 20, $status);

            $response = $this->actingAs($user)->getJson("/purchase-orders/{$order->id}/preview");

            $response->assertOk()
                ->assertJsonStructure([
                    'pdf',
                    'purchase_order',
                ]);

            $this->assertNotEmpty($response->json('pdf'));
        }
    }

    public function test_can_download_pdf_in_all_active_statuses()
    {
        $user = $this->adminUser();
        $medicine = $this->createMedicine();

        foreach (['pending', 'sent', 'delivered', 'completed', 'cancelled'] as $status) {
            $order = $this->createOrderWithItem($medicine, 20, $status);

            $response = $this->actingAs($user)->getJson("/purchase-orders/{$order->id}/download");

            $response->assertOk()
                ->assertHeader('Content-Type', 'application/pdf')
                ->assertHeader('Content-Disposition', 'attachment; filename="purchase-order-' . $order->id . '.pdf"');
        }
    }

    public function test_cannot_download_pdf_for_draft_order()
    {
        $user = $this->adminUser();
        $medicine = $this->createMedicine();
        $order = $this->createOrderWithItem($medicine, 20, 'draft');

        $response = $this->actingAs($user)->getJson("/purchase-orders/{$order->id}/download");

        $response->assertStatus(422)
            ->assertJsonFragment([
                'message' => 'Cannot download PDF for order in draft status',
            ]);
    }

    public function test_admin_can_resend_a_sent_purchase_order()
    {
        Mail::fake();

        $user = $this->adminUser();
        $medicine = $this->createMedicine();
        $order = $this->createOrderWithItem($medicine, 20, 'sent');

        $response = $this->actingAs($user)->postJson("/purchase-orders/{$order->id}/resend");

        $response->assertOk()
            ->assertJsonFragment([
                'status' => 'sent',
            ]);

        // Verify the email was sent again
        Mail::assertSent(PurchaseOrderMail::class, function ($mail) use ($order) {
            return $mail->hasTo($order->supplier->email)
                && $mail->purchaseOrder->is($order);
        });
    }

    public function test_cannot_resend_non_sent_order()
    {
        $user = $this->adminUser();
        $medicine = $this->createMedicine();
        $order = $this->createOrderWithItem($medicine, 20, 'pending');

        $response = $this->actingAs($user)->postJson("/purchase-orders/{$order->id}/resend");

        $response->assertStatus(422)
            ->assertJsonFragment([
                'message' => 'Cannot resend order in pending status',
            ]);
    }

    public function test_admin_can_complete_a_sent_purchase_order_and_stock_increases()
    {
        $user = $this->adminUser();
        $medicine = $this->createMedicine(100);
        $order = $this->createOrderWithItem($medicine, 25, 'sent');

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

        // Verify completed_at was recorded
        $order->refresh();
        $this->assertNotNull($order->completed_at);
    }

    public function test_complete_prevents_duplicate_stock_additions()
    {
        $user = $this->adminUser();
        $medicine = $this->createMedicine(100);
        $order = $this->createOrderWithItem($medicine, 25, 'sent');

        // Complete the order
        $this->actingAs($user)->postJson("/purchase-orders/{$order->id}/complete");

        // Medicine stock should be 125
        $medicine->refresh();
        $this->assertEquals(125, $medicine->quantity);

        // Try to complete again (should not add stock again)
        $order->update(['status' => 'sent']);
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
        $order = $this->createOrderWithItem($medicine, 20, 'draft');

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
            'medicine_id' => $medicine->id,
            'quantity' => 30,
        ]);

        $response->assertStatus(422)
            ->assertJsonFragment([
                'message' => 'Cannot edit order in completed status',
            ]);
    }

    public function test_cannot_delete_pending_order()
    {
        $user = $this->adminUser();
        $medicine = $this->createMedicine();
        $order = $this->createOrderWithItem($medicine, 20, 'pending');

        $response = $this->actingAs($user)->deleteJson("/purchase-orders/{$order->id}");

        $response->assertStatus(422)
            ->assertJsonFragment([
                'message' => 'Cannot delete order in pending status',
            ]);

        // Verify the order still exists
        $this->assertDatabaseHas('purchase_orders', ['id' => $order->id]);
    }

    public function test_cannot_send_non_pending_order()
    {
        $user = $this->adminUser();
        $medicine = $this->createMedicine();
        $order = $this->createOrderWithItem($medicine, 20, 'sent');

        $response = $this->actingAs($user)->postJson("/purchase-orders/{$order->id}/send");

        $response->assertStatus(422)
            ->assertJsonFragment([
                'message' => 'Cannot send order in sent status',
            ]);
    }

    public function test_cannot_complete_non_sent_order()
    {
        $user = $this->adminUser();
        $medicine = $this->createMedicine();
        $order = $this->createOrderWithItem($medicine, 20, 'pending');

        $response = $this->actingAs($user)->postJson("/purchase-orders/{$order->id}/complete");

        $response->assertStatus(422)
            ->assertJsonFragment([
                'message' => 'Cannot complete order in pending status',
            ]);
    }

    public function test_cannot_cancel_completed_order()
    {
        $user = $this->adminUser();
        $medicine = $this->createMedicine();
        $order = $this->createOrderWithItem($medicine, 20, 'completed');

        $response = $this->actingAs($user)->postJson("/purchase-orders/{$order->id}/cancel");

        $response->assertStatus(422)
            ->assertJsonFragment([
                'message' => 'Cannot cancel order in completed status',
            ]);
    }

    public function test_cannot_cancel_cancelled_order()
    {
        $user = $this->adminUser();
        $medicine = $this->createMedicine();
        $order = $this->createOrderWithItem($medicine, 20, 'cancelled');

        $response = $this->actingAs($user)->postJson("/purchase-orders/{$order->id}/cancel");

        $response->assertStatus(422)
            ->assertJsonFragment([
                'message' => 'Cannot cancel order in cancelled status',
            ]);
    }

    public function test_purchase_order_show_returns_order_with_items()
    {
        $user = $this->adminUser();
        $medicine = $this->createMedicine();
        $order = $this->createOrderWithItem($medicine, 10, 'draft');

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

    // ------------------------------------------------------------------
    // Approve endpoint tests
    // ------------------------------------------------------------------

    public function test_admin_can_approve_a_pending_purchase_order()
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

    public function test_cannot_approve_non_pending_order()
    {
        $user = $this->adminUser();
        $medicine = $this->createMedicine();
        $order = $this->createOrderWithItem($medicine, 20, 'draft');

        $response = $this->actingAs($user)->postJson("/purchase-orders/{$order->id}/approve");

        $response->assertStatus(422)
            ->assertJsonFragment([
                'message' => 'Cannot approve order in draft status',
            ]);
    }

    public function test_can_complete_an_approved_purchase_order_and_stock_increases()
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

        // Verify completed_at was recorded
        $order->refresh();
        $this->assertNotNull($order->completed_at);
    }

    // ------------------------------------------------------------------
    // Reopen endpoint tests
    // ------------------------------------------------------------------

    public function test_admin_can_reopen_a_cancelled_purchase_order()
    {
        $user = $this->adminUser();
        $medicine = $this->createMedicine();
        $order = $this->createOrderWithItem($medicine, 20, 'cancelled');

        $response = $this->actingAs($user)->postJson("/purchase-orders/{$order->id}/reopen");

        $response->assertOk()
            ->assertJsonFragment([
                'status' => 'pending',
            ]);

        $this->assertDatabaseHas('purchase_orders', [
            'id' => $order->id,
            'status' => 'pending',
        ]);
    }

    public function test_cannot_reopen_non_cancelled_order()
    {
        $user = $this->adminUser();
        $medicine = $this->createMedicine();
        $order = $this->createOrderWithItem($medicine, 20, 'pending');

        $response = $this->actingAs($user)->postJson("/purchase-orders/{$order->id}/reopen");

        $response->assertStatus(422)
            ->assertJsonFragment([
                'message' => 'Cannot reopen order in pending status',
            ]);
    }

    public function test_can_resend_an_approved_purchase_order()
    {
        Mail::fake();

        $user = $this->adminUser();
        $medicine = $this->createMedicine();
        $order = $this->createOrderWithItem($medicine, 20, 'approved');

        $response = $this->actingAs($user)->postJson("/purchase-orders/{$order->id}/resend");

        $response->assertOk()
            ->assertJsonFragment([
                'status' => 'approved',
            ]);

        // Verify the email was sent
        Mail::assertSent(PurchaseOrderMail::class, function ($mail) use ($order) {
            return $mail->hasTo($order->supplier->email)
                && $mail->purchaseOrder->is($order);
        });
    }

    public function test_can_resend_a_completed_purchase_order()
    {
        Mail::fake();

        $user = $this->adminUser();
        $medicine = $this->createMedicine();
        $order = $this->createOrderWithItem($medicine, 20, 'completed');

        $response = $this->actingAs($user)->postJson("/purchase-orders/{$order->id}/resend");

        $response->assertOk()
            ->assertJsonFragment([
                'status' => 'completed',
            ]);

        // Verify the email was sent
        Mail::assertSent(PurchaseOrderMail::class, function ($mail) use ($order) {
            return $mail->hasTo($order->supplier->email)
                && $mail->purchaseOrder->is($order);
        });
    }
}
