<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Create Admin
        User::firstOrCreate(
            ['email' => 'admin@pharmacy.com'],
            [
                'name' => 'Admin',
                'password' => Hash::make('password'),
                'role' => 'admin',
            ]
        );

        // Create Pharmacist
        User::firstOrCreate(
            ['email' => 'pharmacist@pharmacy.com'],
            [
                'name' => 'Pharmacist',
                'password' => Hash::make('password'),
                'role' => 'pharmacist',
            ]
        );

        // Create Cashier
        User::firstOrCreate(
            ['email' => 'cashier@pharmacy.com'],
            [
                'name' => 'Cashier',
                'password' => Hash::make('password'),
                'role' => 'cashier',
            ]
        );
    }
}
