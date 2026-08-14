<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Seeder;

class RolesAndPermissionsSeeder extends Seeder
{
    /**
     * Core permission catalog (slug => [group, display name]).
     * Adding new permissions here makes them appear on the Roles page.
     */
    protected array $catalog = [
        // Dashboard
        'dashboard.view' => ['Dashboard', 'View Dashboard'],

        // Medicines
        'medicines.view' => ['Medicines', 'View Medicines'],
        'medicines.manage' => ['Medicines', 'Add & Edit Medicines'],

        // Categories
        'categories.view' => ['Categories', 'View Categories'],
        'categories.manage' => ['Categories', 'Add & Edit Categories'],

        // Suppliers
        'suppliers.view' => ['Suppliers', 'View Suppliers'],
        'suppliers.manage' => ['Suppliers', 'Add & Edit Suppliers'],

        // Retail / OTC products
        'retail-products.view' => ['Retail Products', 'View Retail & OTC Products'],
        'retail-products.manage' => ['Retail Products', 'Add & Edit Retail & OTC Products'],

        // Inventory & stock
        'inventory.view' => ['Inventory', 'View Inventory'],
        'stock.manage' => ['Inventory', 'Record Stock Movements'],

        // Low stock
        'lowstock.view' => ['Low Stock', 'View Low Stock Alerts'],
        'lowstock.order' => ['Low Stock', 'Create Purchase Order From Alert'],

        // Purchase orders
        'purchase-orders.view' => ['Purchase Orders', 'View Purchase Orders'],
        'purchase-orders.manage' => ['Purchase Orders', 'Create & Edit Purchase Orders'],
        'purchase-orders.workflow' => ['Purchase Orders', 'Submit, Approve, Deliver & Complete'],
        'purchase-orders.email' => ['Purchase Orders', 'Email & Download PDF'],

        // Sales
        'sales.view' => ['Sales', 'View Sales & History'],
        'sales.prescription' => ['Sales', 'Dispense Prescriptions'],
        'sales.retail' => ['Sales', 'Process Retail Sales'],
        'sales.checkout' => ['Sales', 'Complete Checkout'],
        'sales.receipt' => ['Sales', 'View Receipts'],

        // Reports
        'reports.view' => ['Reports', 'View Reports'],

        // Administration
        'users.view' => ['Administration', 'View Users'],
        'users.manage' => ['Administration', 'Add, Edit & Delete Users'],
        'users.approve' => ['Administration', 'Approve & Reject Users'],
        'roles.manage' => ['Administration', 'Manage Roles & Permissions'],
    ];

    /**
     * Default permission slugs per role.
     */
    protected array $defaults = [
        'pharmacist' => [
            'dashboard.view',
            'medicines.view', 'medicines.manage',
            'categories.view', 'categories.manage',
            'suppliers.view',
            'retail-products.view', 'retail-products.manage',
            'inventory.view', 'stock.manage',
            'lowstock.view', 'lowstock.order',
            'sales.view', 'sales.prescription', 'sales.retail', 'sales.receipt',
            'reports.view',
        ],
        'cashier' => [
            'dashboard.view',
            'medicines.view',
            'categories.view',
            'suppliers.view',
            'retail-products.view',
            'inventory.view',
            'lowstock.view',
            'sales.view', 'sales.retail', 'sales.checkout', 'sales.receipt',
        ],
    ];

    public function run(): void
    {
        $permissionBySlug = [];

        foreach ($this->catalog as $slug => [$group, $name]) {
            $permissionBySlug[$slug] = Permission::updateOrCreate(
                ['slug' => $slug],
                ['name' => $name, 'group' => $group],
            );
        }

        // Core roles. Admin is implicit (no mapping needed - sees everything).
        $roleDefs = [
            ['name' => 'Admin', 'slug' => 'admin', 'is_system' => true],
            ['name' => 'Pharmacist', 'slug' => 'pharmacist', 'is_system' => true],
            ['name' => 'Cashier', 'slug' => 'cashier', 'is_system' => true],
        ];

        $roleBySlug = [];
        foreach ($roleDefs as $def) {
            $roleBySlug[$def['slug']] = Role::updateOrCreate(['slug' => $def['slug']], $def);
        }

        // Attach defaults to non-admin roles (idempotent sync).
        foreach ($this->defaults as $slug => $permissionSlugs) {
            $role = $roleBySlug[$slug] ?? null;
            if (!$role) {
                continue;
            }
            $role->permissions()->sync(array_map(
                fn ($s) => $permissionBySlug[$s]->id,
                array_filter($permissionSlugs, fn ($s) => isset($permissionBySlug[$s])),
            ));
        }

        $this->command->info('Roles & permissions seeded.');
    }
}
