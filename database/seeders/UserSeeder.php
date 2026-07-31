<?php
// database/seeders/UserSeeder.php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Disable foreign key checks
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        
        // Clear existing users
        User::truncate();
        
        // Re-enable foreign key checks
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        $users = [
            [
                'name' => 'Admin User',
                'email' => 'admin@pharmacy.com',
                'password' => Hash::make('password'),
                'role' => 'admin',
                'status' => 'approved',
            ],
            [
                'name' => 'Pharmacist User',
                'email' => 'pharmacist@pharmacy.com',
                'password' => Hash::make('password'),
                'role' => 'pharmacist',
                'status' => 'approved',
                'license_number' => 'PHAR-001-2026',
                'license_expiry_date' => '2027-12-31',
                'professional_registration_number' => 'REG-001-2026',
                'university' => 'University of Pharmacy',
                'degree' => 'Pharm.D',
                'years_of_experience' => 5,
                'national_id' => 'NID-001-2026',
            ],
            [
                'name' => 'Cashier User',
                'email' => 'cashier@pharmacy.com',
                'password' => Hash::make('password'),
                'role' => 'cashier',
                'status' => 'approved',
            ],
            [
                'name' => 'Test Pharmacist',
                'email' => 'test@pharmacy.com',
                'password' => Hash::make('password'),
                'role' => 'pharmacist',
                'status' => 'pending',
                'license_number' => 'PHAR-002-2026',
                'license_expiry_date' => '2027-12-31',
                'professional_registration_number' => 'REG-002-2026',
                'university' => 'Addis Ababa University',
                'degree' => 'B.Pharm',
                'years_of_experience' => 3,
                'national_id' => 'NID-002-2026',
            ],
        ];

        foreach ($users as $user) {
            User::create($user);
        }

        $this->command->info('✅ Users created: ' . count($users));
    }
}