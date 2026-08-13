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
            'name'           => fake()->word() . ' ' . fake()->word(),
            'generic_name'   => fake()->word(),
            'batch_number'   => 'BATCH' . fake()->numberBetween(1000, 9999),
            'barcode'        => fake()->unique()->ean13(),
            'category_id'    => Category::factory(),
            'supplier_id'    => null,
            'shelf_id'       => null,
            'prescription'   => fake()->boolean(30),
            'dosage_form'    => fake()->randomElement(['tablet', 'capsule', 'syrup', 'injection', 'cream', 'ointment']),
            'strength'       => fake()->randomElement(['500 mg', '10 mg/5 ml', '1%', '250 mg', '20 mg', '100 mg']),
            'unit'           => fake()->randomElement(['box', 'bottle', 'tablet', 'capsule', 'tube', 'vial']),
            'image'          => null,
            'manufacturer'   => fake()->company(),
            'shelf_location' => fake()->bothify('??-#'),
        ];
    }
}
