<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Create Admin (approved so they can log in)
        User::firstOrCreate(
            ['email' => 'admin@pharmacy.com'],
            [
                'name'          => 'Admin User',
                'first_name'    => 'Admin',
                'last_name'     => 'User',
                'password'      => Hash::make('password'),
                'role'          => 'admin',
                'status'        => User::STATUS_APPROVED,
            ]
        );

        // Create Pharmacist (approved so they can log in)
        User::firstOrCreate(
            ['email' => 'pharmacist@pharmacy.com'],
            [
                'name'          => 'Pharmacist User',
                'first_name'    => 'Pharmacist',
                'last_name'     => 'User',
                'password'      => Hash::make('password'),
                'role'          => 'pharmacist',
                'status'        => User::STATUS_APPROVED,
            ]
        );

        // Create Cashier (approved so they can log in)
        User::firstOrCreate(
            ['email' => 'cashier@pharmacy.com'],
            [
                'name'          => 'Cashier User',
                'first_name'    => 'Cashier',
                'last_name'     => 'User',
                'password'      => Hash::make('password'),
                'role'          => 'cashier',
                'status'        => User::STATUS_APPROVED,
            ]
        );
    }
}
