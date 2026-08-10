<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\RetailProduct;
use Illuminate\Foundation\Testing\RefreshDatabase;

class RetailProductImageTest extends TestCase
{
    use RefreshDatabase;

    private $pharmacist;
    private $cashier;

    protected function setUp(): void
    {
        parent::setUp();

        $this->pharmacist = User::factory()->create(['role' => 'pharmacist', 'status' => 'approved']);
        $this->cashier = User::factory()->create(['role' => 'cashier', 'status' => 'approved']);
    }

    /** @test */
    public function it_returns_image_url_for_retail_products_as_pharmacist()
    {
        RetailProduct::create([
            'name' => 'Lipstick - Ruby Red',
            'sku' => 'COS-001',
            'category' => 'Cosmetics',
            'price' => 12.50,
            'quantity' => 150,
            'image' => 'images/retail-products/lipstick-ruby-red.svg',
        ]);

        $response = $this->actingAs($this->pharmacist)
            ->getJson('/api/retail-products');

        $response->assertOk();

        $data = $response->json('data');
        $this->assertNotEmpty($data);
        $this->assertEquals('images/retail-products/lipstick-ruby-red.svg', $data[0]['image']);
        $this->assertStringEndsWith('images/retail-products/lipstick-ruby-red.svg', $data[0]['image_url']);
    }

    /** @test */
    public function it_returns_image_url_for_retail_products_as_cashier()
    {
        RetailProduct::create([
            'name' => 'Vitamin C Tablets',
            'sku' => 'OTC-001',
            'category' => 'OTC',
            'price' => 15.99,
            'quantity' => 250,
            'image' => 'images/retail-products/vitamin-c-tablets-100ct.svg',
        ]);

        $response = $this->actingAs($this->cashier)
            ->getJson('/api/retail-products');

        $response->assertOk();

        $data = $response->json('data');
        $this->assertNotEmpty($data);
        $this->assertStringEndsWith('vitamin-c-tablets-100ct.svg', $data[0]['image_url']);
    }

    /** @test */
    public function it_falls_back_to_placeholder_when_no_image()
    {
        RetailProduct::create([
            'name' => 'Generic Product',
            'sku' => 'GEN-001',
            'category' => 'General',
            'price' => 5.00,
            'quantity' => 100,
        ]);

        $response = $this->actingAs($this->pharmacist)
            ->getJson('/api/retail-products');

        $response->assertOk();

        $data = $response->json('data');
        $this->assertNotEmpty($data);
        $this->assertStringEndsWith('medicine-placeholder.svg', $data[0]['image_url']);
    }

    /** @test */
    public function it_handles_external_http_image_urls()
    {
        RetailProduct::create([
            'name' => 'Imported Cream',
            'sku' => 'IMP-001',
            'category' => 'Cosmetics',
            'price' => 22.00,
            'quantity' => 50,
            'image' => 'https://example.com/images/cream.svg',
        ]);

        $response = $this->actingAs($this->pharmacist)
            ->getJson('/api/retail-products');

        $response->assertOk();

        $data = $response->json('data');
        $this->assertNotEmpty($data);
        $this->assertEquals('https://example.com/images/cream.svg', $data[0]['image_url']);
    }
}
