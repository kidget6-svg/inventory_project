<?php

namespace Database\Factories;

use App\Models\PurchaseOrder;
use App\Models\Supplier;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<PurchaseOrder>
 */
class PurchaseOrderFactory extends Factory
{
    protected $model = PurchaseOrder::class;

    public function definition(): array
    {
        return [
            'supplier_id' => Supplier::factory(),
            'order_date' => fake()->date(),
            'total_amount' => fake()->randomFloat(2, 10, 5000),
            'status' => fake()->randomElement(['draft', 'pending', 'sent', 'delivered', 'completed', 'cancelled']),
        ];
    }
}
