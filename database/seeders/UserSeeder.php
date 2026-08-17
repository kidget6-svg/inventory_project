<?php
// database/seeders/UserSeeder.php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Disable foreign key checks for clean truncation (database-agnostic)
        Schema::disableForeignKeyConstraints();
        User::truncate();
        Schema::enableForeignKeyConstraints();

        // All seeded demo accounts use the password "Admin@123".
        // These credentials match the login form shown to end users.
        $defaultPassword = 'Admin@123';

        $users = [
            [
                'name' => 'Admin User',
                'first_name' => 'Admin',
                'last_name' => 'User',
                'email' => 'admin@pharmacy.com',
                'password' => Hash::make($defaultPassword),
                'role' => 'admin',
                'status' => 'approved',
                'phone_number' => '+251 911 000 001',
                'gender' => 'male',
                'address' => 'Addis Ababa, Ethiopia',
            ],
            [
                'name' => 'Pharmacist User',
                'first_name' => 'Pharmacist',
                'last_name' => 'User',
                'email' => 'pharmacist@pharmacy.com',
                'password' => Hash::make($defaultPassword),
                'role' => 'pharmacist',
                'status' => 'approved',
                'phone_number' => '+251 911 000 002',
                'gender' => 'male',
                'address' => 'Addis Ababa, Ethiopia',
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
                'first_name' => 'Cashier',
                'last_name' => 'User',
                'email' => 'cashier@pharmacy.com',
                'password' => Hash::make($defaultPassword),
                'role' => 'cashier',
                'status' => 'approved',
                'phone_number' => '+251 911 000 003',
                'gender' => 'female',
                'address' => 'Addis Ababa, Ethiopia',
            ],
            [
                'name' => 'Test Pharmacist',
                'first_name' => 'Test',
                'last_name' => 'Pharmacist',
                'email' => 'test@pharmacy.com',
                'password' => Hash::make($defaultPassword),
                'role' => 'pharmacist',
                'status' => 'pending',
                'phone_number' => '+251 911 000 004',
                'gender' => 'male',
                'address' => 'Addis Ababa, Ethiopia',
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
            // Set role_id by looking up the Role model by slug,
            // so both the role string and role_id relationship are populated.
            $user['role_id'] = Role::where('slug', $user['role'])->value('id');
            User::create($user);
        }

        $this->command->info('✅ Users seeded successfully!');
    }
}
