<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\User;
use App\Models\Medicine;
use App\Models\Category;
use Illuminate\Foundation\Testing\RefreshDatabase;

class SaleTest extends TestCase
{
    use RefreshDatabase;

    private $admin;
    private $cashier;
    private $medicine;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->create(['role' => 'admin', 'status' => 'approved']);
        $this->cashier = User::factory()->create(['role' => 'cashier', 'status' => 'approved']);

        $category = Category::factory()->create();
        $this->medicine = Medicine::factory()->create([
            'category_id' => $category->id,
            'quantity' => 100,
            'selling_price' => 15.50,
        ]);
    }

    /** @test */
    public function it_can_fetch_sales_list()
    {
        Sale::factory()->count(3)->create(['status' => 'completed']);

        $response = $this->actingAs($this->admin)
            ->getJson('/api/sales');

        $response->assertOk();
        $this->assertIsArray($response->json());
        $this->assertCount(3, $response->json());
    }

    /** @test */
    public function it_can_create_prescription_sale()
    {
        $response = $this->actingAs($this->admin)
            ->postJson('/api/sales/prescription', [
                'items' => [
                    [
                        'medicine_id' => $this->medicine->id,
                        'quantity' => 2,
                    ],
                ],
            ]);

        $response->assertCreated()
            ->assertJsonStructure(['message', 'sale']);

        $this->assertDatabaseHas('sales', [
            'type' => 'prescription',
            'status' => 'pending_cashier',
        ]);
    }

    /** @test */
    public function it_can_complete_sale_with_payment_method()
    {
        $sale = Sale::factory()->create([
            'status' => 'pending_cashier',
            'total_amount' => 100.00,
            'user_id' => $this->admin->id,
        ]);

        $response = $this->actingAs($this->cashier)
            ->patchJson("/api/sales/{$sale->id}/status", [
                'status' => 'completed',
                'payment_method' => 'telebirr',
                'amount_paid' => 100.00,
                'change_amount' => 0,
            ]);

        $response->assertOk()
            ->assertJsonStructure(['message', 'sale']);

        $this->assertDatabaseHas('sales', [
            'id' => $sale->id,
            'status' => 'completed',
            'payment_method' => 'telebirr',
            'amount_paid' => 100.00,
            'change_amount' => 0,
            'payment_status' => 'paid',
        ]);

        $this->assertNotEmpty($sale->fresh()->receipt_number);
    }

    /** @test */
    public function it_generates_unique_receipt_number()
    {
        $receiptNumber = Sale::generateReceiptNumber();

        $this->assertStringStartsWith('RCPT-', $receiptNumber);
        $this->assertMatchesRegularExpression(
            '/^RCPT-\d{8}-\d{5}$/',
            $receiptNumber
        );
    }

    /** @test */
    public function it_can_get_receipt_data()
    {
        $sale = Sale::factory()->create([
            'status' => 'completed',
            'receipt_number' => 'RCPT-20260804-00001',
            'payment_method' => 'cash',
            'amount_paid' => 150.00,
            'change_amount' => 50.00,
            'user_id' => $this->admin->id,
        ]);

        $response = $this->actingAs($this->admin)
            ->getJson("/api/sales/{$sale->id}/receipt");

        $response->assertOk()
            ->assertJsonStructure(['id', 'receipt_number', 'payment_method', 'amount_paid', 'change_amount']);
    }

    /** @test */
    public function it_can_download_receipt_pdf()
    {
        $sale = Sale::factory()->create([
            'status' => 'completed',
            'receipt_number' => 'RCPT-20260804-00001',
            'payment_method' => 'cash',
            'amount_paid' => 150.00,
            'change_amount' => 50.00,
            'user_id' => $this->admin->id,
        ]);

        $response = $this->actingAs($this->admin)
            ->get("/api/sales/{$sale->id}/receipt/pdf");

        $response->assertOk()
            ->assertHeader('Content-Type', 'application/pdf');
    }

    /** @test */
    public function it_can_get_sales_history()
    {
        Sale::factory()->count(5)->create([
            'status' => 'completed',
            'user_id' => $this->admin->id,
        ]);

        $response = $this->actingAs($this->admin)
            ->getJson('/api/sales/history');

        $response->assertOk()
            ->assertJsonStructure([
                'data' => [['id', 'receipt_number', 'status']],
                'last_page',
                'current_page',
            ]);
    }

    /** @test */
    public function it_can_filter_sales_history_by_payment_method()
    {
        Sale::factory()->create([
            'status' => 'completed',
            'payment_method' => 'cash',
            'user_id' => $this->admin->id,
        ]);
        Sale::factory()->create([
            'status' => 'completed',
            'payment_method' => 'telebirr',
            'user_id' => $this->admin->id,
        ]);

        $response = $this->actingAs($this->admin)
            ->getJson('/api/sales/history?payment_method=cash');

        $response->assertOk();
        $data = $response->json('data');
        $this->assertCount(1, $data);
        $this->assertEquals('cash', $data[0]['payment_method']);
    }

    /** @test */
    public function it_can_get_sales_stats()
    {
        Sale::factory()->create([
            'status' => 'completed',
            'payment_method' => 'cash',
            'total_amount' => 100.00,
            'sale_date' => today(),
            'user_id' => $this->admin->id,
        ]);
        Sale::factory()->create([
            'status' => 'completed',
            'payment_method' => 'telebirr',
            'total_amount' => 200.00,
            'sale_date' => today(),
            'user_id' => $this->admin->id,
        ]);

        $response = $this->actingAs($this->admin)
            ->getJson('/api/sales/stats');

        $response->assertOk()
            ->assertJsonStructure([
                'today_sales_count',
                'today_revenue',
                'cash_payments',
                'telebirr_payments',
                'bank_payments',
                'total_transactions',
            ]);

        $this->assertEquals(100.00, $response->json('cash_payments'));
        $this->assertEquals(200.00, $response->json('telebirr_payments'));
    }

    /** @test */
    public function it_can_export_sales_report_csv()
    {
        Sale::factory()->create([
            'status' => 'completed',
            'receipt_number' => 'RCPT-20260804-00001',
            'user_id' => $this->admin->id,
        ]);

        $response = $this->actingAs($this->admin)
            ->get('/api/sales/export?type=sales&format=csv');

        $response->assertOk()
            ->assertHeader('Content-Type', 'text/csv; charset=utf-8');
    }

    /** @test */
    public function it_validates_payment_method_on_completion()
    {
        $sale = Sale::factory()->create([
            'status' => 'pending_cashier',
            'total_amount' => 100.00,
            'user_id' => $this->admin->id,
        ]);

        $response = $this->actingAs($this->cashier)
            ->patchJson("/api/sales/{$sale->id}/status", [
                'status' => 'completed',
                'payment_method' => 'invalid_method',
                'amount_paid' => 100.00,
            ]);

        $response->assertStatus(422);
    }

    /** @test */
    public function it_calculates_change_for_cash_payments()
    {
        $sale = Sale::factory()->create([
            'status' => 'pending_cashier',
            'total_amount' => 100.00,
            'user_id' => $this->admin->id,
        ]);

        $response = $this->actingAs($this->cashier)
            ->patchJson("/api/sales/{$sale->id}/status", [
                'status' => 'completed',
                'payment_method' => 'cash',
                'amount_paid' => 150.00,
                'change_amount' => 50.00,
            ]);

        $response->assertOk();

        $this->assertDatabaseHas('sales', [
            'id' => $sale->id,
            'payment_method' => 'cash',
            'amount_paid' => 150.00,
            'change_amount' => 50.00,
        ]);
    }

    /** @test */
    public function it_returns_zero_change_for_non_cash_payments()
    {
        $sale = Sale::factory()->create([
            'status' => 'pending_cashier',
            'total_amount' => 100.00,
            'user_id' => $this->admin->id,
        ]);

        $response = $this->actingAs($this->cashier)
            ->patchJson("/api/sales/{$sale->id}/status", [
                'status' => 'completed',
                'payment_method' => 'telebirr',
                'amount_paid' => 100.00,
                'change_amount' => 0,
            ]);

        $response->assertOk();

        $this->assertDatabaseHas('sales', [
            'id' => $sale->id,
            'payment_method' => 'telebirr',
            'amount_paid' => 100.00,
            'change_amount' => 0,
        ]);
    }
}
