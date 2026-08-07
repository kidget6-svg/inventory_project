<?php

namespace Database\Factories;

use App\Models\RetailProduct;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<RetailProduct>
 */
class RetailProductFactory extends Factory
{
    protected $model = RetailProduct::class;

    public function definition(): array
    {
        return [
            'name' => fake()->word() . ' ' . fake()->word(),
            'sku' => fake()->unique()->bothify('???-#####'),
            'category' => fake()->randomElement(['General', 'Cosmetics', 'OTC', 'Health & Wellness']),
            'price' => fake()->randomFloat(2, 5, 200),
            'quantity' => fake()->numberBetween(10, 500),
        ];
    }
}
