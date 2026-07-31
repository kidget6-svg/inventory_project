<?php
// database/seeders/SaleSeeder.php

namespace Database\Seeders;

use App\Models\Sale;
use App\Models\User;
use Illuminate\Database\Seeder;

class SaleSeeder extends Seeder
{
    public function run(): void
    {
        // Clear existing sales
        Sale::truncate();

        $cashier = User::where('role', 'cashier')->first();

        if (!$cashier) {
            $this->command->warn('⚠️ No cashier found! Creating a default one.');
            $cashier = User::create([
                'name' => 'Default Cashier',
                'email' => 'cashier2@pharmacy.com',
                'password' => bcrypt('password'),
                'role' => 'cashier',
                'status' => 'approved',
            ]);
        }

        $paymentMethods = ['cash', 'card', 'mobile'];
        $customers = [
            'Abebe Kebede',
            'Tigist Hailu',
            'Dawit Solomon',
            'Meron Tekle',
            'Henok Desta',
            'Selam Tesfaye',
            'Yonas Girma',
            'Eden Alemu',
        ];

        for ($i = 0; $i < 20; $i++) {
            $customerName = $customers[array_rand($customers)];
            
            Sale::create([
                'sale_date' => now()->subDays(rand(0, 30)),
                'customer_name' => $customerName,
                'customer_phone' => '+251 9' . rand(10000000, 99999999),
                'total_amount' => rand(100, 5000),
                'discount' => rand(0, 200),
                'tax' => rand(0, 500),
                'net_amount' => rand(100, 4800),
                'payment_method' => $paymentMethods[array_rand($paymentMethods)],
                'payment_status' => 'paid',
                'status' => 'completed',
                'user_id' => $cashier->id,
                'notes' => 'Test sale #' . ($i + 1),
                'receipt_number' => 'REC-' . date('Ymd') . '-' . str_pad($i + 1, 4, '0', STR_PAD_LEFT),
            ]);
        }

        $this->command->info('✅ Sales created: 20');
    }
}