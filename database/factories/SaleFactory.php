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
        $totalAmount = fake()->randomFloat(2, 10, 5000);
        $paymentMethod = fake()->randomElement(array_keys(Sale::paymentMethods()));
        $amountPaid = $paymentMethod === Sale::PAYMENT_CASH
            ? $totalAmount + fake()->randomElement([0, 5, 10, 20, 50])
            : $totalAmount;
        $changeAmount = $paymentMethod === Sale::PAYMENT_CASH
            ? $amountPaid - $totalAmount
            : 0;

        return [
            'sale_date' => fake()->dateTimeBetween('-30 days', 'now'),
            'total_amount' => $totalAmount,
            'discount' => fake()->randomFloat(2, 0, 100),
            'tax' => fake()->randomFloat(2, 0, 100),
            'net_amount' => $totalAmount - fake()->randomFloat(2, 0, 100) + fake()->randomFloat(2, 0, 50),
            'customer_name' => fake()->optional(0.7)->name(),
            'customer_phone' => fake()->optional(0.5)->phoneNumber(),
            'customer_email' => fake()->optional(0.3)->email(),
            'payment_method' => $paymentMethod,
            'payment_status' => 'paid',
            'amount_paid' => $amountPaid,
            'change_amount' => $changeAmount,
            'notes' => fake()->optional(0.3)->sentence(),
            'receipt_number' => 'RCPT-' . now()->format('Ymd') . '-' . str_pad(fake()->unique()->randomNumber(5), 5, '0', STR_PAD_LEFT),
            'user_id' => User::factory(),
            'type' => fake()->randomElement(['prescription', 'retail']),
            'status' => 'completed',
        ];
    }
}
