<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Seed roles first
        $this->call([
            RoleSeeder::class,
            PermissionSeeder::class,
        ]);

        // Create default admin user
        $adminRole = Role::where('name', 'admin')->first();

        User::create([
            'role_id' => $adminRole->id,
            'name' => 'Admin User',
            'email' => 'admin@pharmacy.com',
            'password' => Hash::make('password'),
            'email_verified_at' => now(),
            'is_active' => true,
        ]);

        // Create default pharmacist user
        $pharmacistRole = Role::where('name', 'pharmacist')->first();

        User::create([
            'role_id' => $pharmacistRole->id,
            'name' => 'Pharmacist User',
            'email' => 'pharmacist@pharmacy.com',
            'password' => Hash::make('password'),
            'email_verified_at' => now(),
            'is_active' => true,
        ]);

        // Create default cashier user
        $cashierRole = Role::where('name', 'cashier')->first();

        User::create([
            'role_id' => $cashierRole->id,
            'name' => 'Cashier User',
            'email' => 'cashier@pharmacy.com',
            'password' => Hash::make('password'),
            'email_verified_at' => now(),
            'is_active' => true,
        ]);

        // Seed inventory and sales data
        $this->call([
            SupplierSeeder::class,
            ProductSeeder::class,
            BatchSeeder::class,
            SaleSeeder::class,
        ]);
    }
}
