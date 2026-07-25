<?php

namespace Database\Factories;

use App\Models\Medicine;
use App\Models\Category;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Medicine>
 */
class MedicineFactory extends Factory
{
    protected $model = Medicine::class;

    public function definition(): array
    {
        return [
            'name' => fake()->word() . ' ' . fake()->word(),
            'generic_name' => fake()->word(),
            'batch_number' => 'BATCH' . fake()->numberBetween(1000, 9999),
            'category_id' => Category::factory(),
            'quantity' => fake()->numberBetween(0, 200),
            'unit_price' => fake()->randomFloat(2, 1, 500),
            'reorder_level' => fake()->numberBetween(5, 50),
            'expiry_date' => fake()->dateTimeBetween('+1 month', '+2 years'),
        ];
    }
}
