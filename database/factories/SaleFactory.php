<?php

namespace Database\Factories;

use App\Models\Sale;
use App\Models\User;
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
            'user_id' => User::factory(),
            'sale_date' => fake()->date(),
            'total_amount' => fake()->randomFloat(2, 10, 5000),
            'customer_tin' => fake()->numerify('##########'),
        ];
    }
}
