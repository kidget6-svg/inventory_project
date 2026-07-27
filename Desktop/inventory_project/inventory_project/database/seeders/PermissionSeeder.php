<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class PermissionSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $permissions = [
            // Admin permissions
            ['name' => 'manage_users', 'display_name' => 'Manage Users', 'description' => 'Create, edit, and delete user accounts'],
            ['name' => 'manage_roles', 'display_name' => 'Manage Roles', 'description' => 'Assign and manage roles and permissions'],
            ['name' => 'manage_system_settings', 'display_name' => 'Manage System Settings', 'description' => 'Configure system-wide settings'],

            // Pharmacist permissions
            ['name' => 'manage_inventory', 'display_name' => 'Manage Inventory', 'description' => 'Add, edit, and remove inventory items'],
            ['name' => 'manage_categories', 'display_name' => 'Manage Categories', 'description' => 'Create and manage medicine categories'],
            ['name' => 'manage_stock_intake', 'display_name' => 'Manage Stock Intake', 'description' => 'Record and manage stock intake from suppliers'],
            ['name' => 'manage_suppliers', 'display_name' => 'Manage Suppliers', 'description' => 'Add and manage supplier information'],
            ['name' => 'manage_purchase_orders', 'display_name' => 'Manage Purchase Orders', 'description' => 'Create and manage purchase orders'],

            // Cashier permissions
            ['name' => 'create_sale', 'display_name' => 'Create Sale', 'description' => 'Process new sales transactions'],
            ['name' => 'view_sales', 'display_name' => 'View Sales', 'description' => 'View sales history and transactions'],
            ['name' => 'view_daily_sales', 'display_name' => 'View Daily Sales', 'description' => 'View daily sales summary'],

            // Shared permissions
            ['name' => 'view_reports', 'display_name' => 'View Reports', 'description' => 'Access reports and analytics'],
        ];

        // Create all permissions
        foreach ($permissions as $permission) {
            Permission::create($permission);
        }

        // Get roles
        $adminRole = Role::where('name', 'admin')->first();
        $pharmacistRole = Role::where('name', 'pharmacist')->first();
        $cashierRole = Role::where('name', 'cashier')->first();

        // Admin gets all permissions
        $adminPermissions = Permission::all();
        $adminRole->permissions()->sync($adminPermissions->pluck('id')->toArray());

        // Pharmacist gets inventory-related permissions
        $pharmacistPermissions = Permission::whereIn('name', [
            'manage_inventory',
            'manage_categories',
            'manage_stock_intake',
            'manage_suppliers',
            'manage_purchase_orders',
            'view_reports',
        ])->get();
        $pharmacistRole->permissions()->sync($pharmacistPermissions->pluck('id')->toArray());

        // Cashier gets sales-related permissions
        $cashierPermissions = Permission::whereIn('name', [
            'create_sale',
            'view_sales',
            'view_daily_sales',
        ])->get();
        $cashierRole->permissions()->sync($cashierPermissions->pluck('id')->toArray());
    }
}
