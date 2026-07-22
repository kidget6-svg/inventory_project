<?php

namespace Database\Seeders;

use App\Models\Role;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $roles = [
            [
                'name' => 'admin',
                'display_name' => 'Administrator',
                'description' => 'Full system access: manage users, system settings, suppliers, inventory, reports, and sales.',
            ],
            [
                'name' => 'pharmacist',
                'display_name' => 'Pharmacist',
                'description' => 'Manages medicines, categories, stock intake, suppliers, and purchase orders.',
            ],
            [
                'name' => 'cashier',
                'display_name' => 'Cashier',
                'description' => 'Handles sales transactions, customer checkouts, and views daily sales summaries.',
            ],
        ];

        foreach ($roles as $role) {
            Role::create($role);
        }
    }
}
