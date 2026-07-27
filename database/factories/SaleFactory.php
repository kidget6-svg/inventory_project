<?php

namespace Database\Factories;

use App\Models\Sale;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Sale>
 */
class SaleFactory extends Factory
{
    protected $model = Sale::class;

    public function definition(): array
    {
        return [
            'sale_date' => fake()->date(),
            'total_amount' => fake()->randomFloat(2, 10, 5000),
        ];
    }
}
