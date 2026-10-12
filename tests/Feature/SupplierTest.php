<?php

namespace Tests\Feature;

use App\Models\Supplier;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SupplierTest extends TestCase
{
    use RefreshDatabase;

    private function adminUser()
    {
        return User::factory()->create(['role' => 'admin']);
    }

    public function test_admin_can_view_all_suppliers()
    {
        $user = $this->adminUser();
        Supplier::factory()->count(3)->create();

        $response = $this->actingAs($user)->getJson('/suppliers');

        $response->assertOk()
            ->assertJsonCount(3);
    }

    public function test_admin_can_create_a_supplier()
    {
        $user = $this->adminUser();

        $response = $this->actingAs($user)->postJson('/suppliers', [
            'name' => 'PharmaCorp Ltd',
            'contact_person' => 'John Doe',
            'phone' => '+251712345678',
            'email' => 'john@pharmacorp.com',
            'address' => '123 Nairobi Street',
        ]);

        $response->assertCreated()
            ->assertJsonFragment([
                'name' => 'PharmaCorp Ltd',
                'contact_person' => 'John Doe',
                'phone' => '+251712345678',
                'email' => 'john@pharmacorp.com',
            ]);

        $this->assertDatabaseHas('suppliers', [
            'name' => 'PharmaCorp Ltd',
            'email' => 'john@pharmacorp.com',
        ]);
    }

    public function test_create_supplier_requires_name()
    {
        $user = $this->adminUser();

        $response = $this->actingAs($user)->postJson('/suppliers', [
            'name' => '',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors('name');
    }

    public function test_admin_can_edit_a_supplier()
    {
        $user = $this->adminUser();
        $supplier = Supplier::factory()->create([
            'name' => 'Old Name',
            'phone' => '+251700000000',
        ]);

        $response = $this->actingAs($user)->putJson("/suppliers/{$supplier->id}", [
            'name' => 'New Name',
            'contact_person' => 'Jane Smith',
            'phone' => '+251799999999',
            'email' => 'jane@example.com',
            'address' => '456 Mombasa Road',
        ]);

        $response->assertOk()
            ->assertJsonFragment([
                'name' => 'New Name',
                'phone' => '+251799999999',
            ]);

        $this->assertDatabaseHas('suppliers', [
            'id' => $supplier->id,
            'name' => 'New Name',
            'phone' => '+251799999999',
        ]);
    }

    public function test_admin_can_delete_a_supplier()
    {
        $user = $this->adminUser();
        $supplier = Supplier::factory()->create();

        $response = $this->actingAs($user)->deleteJson("/suppliers/{$supplier->id}");

        $response->assertOk()
            ->assertJson(['message' => 'Supplier deleted']);

        $this->assertDatabaseMissing('suppliers', ['id' => $supplier->id]);
    }

    public function test_non_admin_cannot_access_suppliers()
    {
        $cashier = User::factory()->create(['role' => 'cashier']);

        $response = $this->actingAs($cashier)->getJson('/suppliers');

        $response->assertStatus(403);
    }
}
