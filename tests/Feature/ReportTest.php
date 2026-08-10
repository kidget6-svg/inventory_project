<?php

namespace Tests\Feature;

use App\Models\Medicine;
use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\PurchaseOrder;
use App\Models\PurchaseOrderItem;
use App\Models\Supplier;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ReportTest extends TestCase
{
    use RefreshDatabase;

    private function adminUser(): User
    {
        return User::factory()->create(['role' => 'admin', 'status' => User::STATUS_APPROVED]);
    }

    private function pharmacistUser(): User
    {
        return User::factory()->create(['role' => 'pharmacist', 'status' => User::STATUS_APPROVED]);
    }

    private function cashierUser(): User
    {
        return User::factory()->create(['role' => 'cashier']);
    }

    public function test_reports_endpoint_returns_all_five_datasets()
    {
        $user = $this->adminUser();

        $response = $this->actingAs($user)->getJson('/reports');

        $response->assertOk()
            ->assertJsonStructure([
                'medicines',
                'sales',
                'purchases',
                'lowStock',
                'expiring',
            ]);
    }

    public function test_inventory_tab_shows_all_medicines()
    {
        $user = $this->adminUser();
        Medicine::factory()->count(5)->create();

        $response = $this->actingAs($user)->getJson('/reports');

        $response->assertOk()
            ->assertJsonCount(5, 'medicines');
    }

    public function test_sales_tab_shows_all_sales()
    {
        $user = $this->adminUser();
        Sale::factory()->count(4)->create();

        $response = $this->actingAs($user)->getJson('/reports');

        $response->assertOk()
            ->assertJsonCount(4, 'sales');
    }

    public function test_purchases_tab_shows_all_orders()
    {
        $user = $this->adminUser();
        $supplier = Supplier::factory()->create();
        PurchaseOrder::factory()->count(3)->create([
            'supplier_id' => $supplier->id,
        ]);

        $response = $this->actingAs($user)->getJson('/reports');

        $response->assertOk()
            ->assertJsonCount(3, 'purchases');
    }

    public function test_low_stock_tab_shows_items_below_reorder_level()
    {
        $user = $this->adminUser();

        // Create a medicine with quantity below reorder level
        Medicine::factory()->create([
            'name' => 'Low Stock Medicine',
            'quantity' => 5,
            'reorder_level' => 10,
        ]);

        // Create a medicine with quantity above reorder level
        Medicine::factory()->create([
            'name' => 'Adequate Stock Medicine',
            'quantity' => 50,
            'reorder_level' => 10,
        ]);

        $response = $this->actingAs($user)->getJson('/reports');

        $response->assertOk()
            ->assertJsonCount(1, 'lowStock')
            ->assertJsonFragment(['name' => 'Low Stock Medicine']);
    }

    public function test_low_stock_tab_shows_items_at_reorder_level()
    {
        $user = $this->adminUser();

        // quantity equals reorder_level should be included
        Medicine::factory()->create([
            'name' => 'At Reorder Level',
            'quantity' => 10,
            'reorder_level' => 10,
        ]);

        $response = $this->actingAs($user)->getJson('/reports');

        $response->assertOk()
            ->assertJsonCount(1, 'lowStock')
            ->assertJsonFragment(['name' => 'At Reorder Level']);
    }

    public function test_expiring_tab_shows_medicines_expiring_within_90_days()
    {
        $user = $this->adminUser();

        // Medicine expiring in 30 days (within 90 days)
        Medicine::factory()->create([
            'name' => 'Expiring Soon',
            'expiry_date' => now()->addDays(30),
        ]);

        // Medicine expiring in 100 days (outside 90 days)
        Medicine::factory()->create([
            'name' => 'Not Expiring Soon',
            'expiry_date' => now()->addDays(100),
        ]);

        $response = $this->actingAs($user)->getJson('/reports');

        $response->assertOk()
            ->assertJsonCount(1, 'expiring')
            ->assertJsonFragment(['name' => 'Expiring Soon']);
    }

    public function test_expiring_tab_excludes_already_expired_medicines()
    {
        $user = $this->adminUser();

        // Medicine that already expired
        Medicine::factory()->create([
            'name' => 'Already Expired',
            'expiry_date' => now()->subDays(10),
        ]);

        $response = $this->actingAs($user)->getJson('/reports');

        $response->assertOk()
            ->assertJsonCount(0, 'expiring');
    }

    public function test_reports_accessible_by_pharmacist()
    {
        $user = $this->pharmacistUser();

        $response = $this->actingAs($user)->getJson('/reports');
        $response = $this->actingAs($user)->getJson('/reports');
        $response->assertOk();
    }

    public function test_reports_not_accessible_by_cashier()
    {
        $cashier = $this->cashierUser();

        $response = $this->actingAs($cashier)->getJson('/reports');

        $response->assertStatus(403);
    }

    public function test_reports_not_accessible_without_auth()
    {
        $response = $this->getJson('/reports');

        $response->assertStatus(401);
    }
}
