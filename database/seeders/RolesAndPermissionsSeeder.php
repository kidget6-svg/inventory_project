<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;

class RolesAndPermissionsSeeder extends Seeder
{
    /**
     * Permission catalog grouped by page (group => page name).
     * Each page has a "view" permission plus one permission per button/action.
     * Adding new permissions here makes them appear on the Roles page.
     */
    protected array $catalog = [
        // Page: Dashboard
        'dashboard.view' => ['Dashboard', 'View Dashboard'],

        // Page: Medicines
        'medicines.view' => ['Medicines', 'View medicines page'],
        'medicines.create' => ['Medicines', 'Add a medicine'],
        'medicines.edit' => ['Medicines', 'Edit a medicine'],
        'medicines.delete' => ['Medicines', 'Delete a medicine'],
        'medicines.toggle-status' => ['Medicines', 'Enable / disable a medicine'],

        // Page: Categories
        'categories.view' => ['Categories', 'View categories page'],
        'categories.create' => ['Categories', 'Add a category'],
        'categories.edit' => ['Categories', 'Edit a category'],
        'categories.delete' => ['Categories', 'Delete a category'],

        // Page: Suppliers
        'suppliers.view' => ['Suppliers', 'View suppliers page'],
        'suppliers.create' => ['Suppliers', 'Add a supplier'],
        'suppliers.edit' => ['Suppliers', 'Edit a supplier'],
        'suppliers.delete' => ['Suppliers', 'Delete a supplier'],

        // Page: Retail & OTC Products
        'retail-products.view' => ['Retail & OTC Products', 'View retail products page'],
        'retail-products.create' => ['Retail & OTC Products', 'Add a retail product'],
        'retail-products.edit' => ['Retail & OTC Products', 'Edit a retail product'],
        'retail-products.delete' => ['Retail & OTC Products', 'Delete a retail product'],

        // Page: Inventory
        'inventory.view' => ['Inventory', 'View inventory page'],
        'stock-movements.view' => ['Inventory', 'View stock movements'],
        'stock-movements.create' => ['Inventory', 'Record a stock movement'],
        'stock-movements.delete' => ['Inventory', 'Delete a stock movement'],

        // Page: Warehouse
        'warehouse.view' => ['Warehouse', 'View warehouse page'],
        'warehouse.receive' => ['Warehouse', 'Receive stock from suppliers'],
        'warehouse.transfer' => ['Warehouse', 'Transfer stock to branches'],
        'warehouse.manage' => ['Warehouse', 'Manage warehouse inventory'],

        // Page: Branches
        'branches.view' => ['Branches', 'View branches page'],
        'branches.create' => ['Branches', 'Add a branch'],
        'branches.edit' => ['Branches', 'Edit a branch'],
        'branches.delete' => ['Branches', 'Delete a branch'],

        // Page: Low Stock
        'lowstock.view' => ['Low Stock', 'View low stock alerts'],
        'lowstock.order-now' => ['Low Stock', 'Order from alert (create purchase order)'],

        // Page: Purchase Orders
        'purchase-orders.view' => ['Purchase Orders', 'View purchase orders page'],
        'purchase-orders.create' => ['Purchase Orders', 'Create a purchase order'],
        'purchase-orders.edit' => ['Purchase Orders', 'Edit a purchase order'],
        'purchase-orders.delete' => ['Purchase Orders', 'Delete a purchase order'],
        'purchase-orders.submit' => ['Purchase Orders', 'Submit order'],
        'purchase-orders.approve' => ['Purchase Orders', 'Approve order'],
        'purchase-orders.deliver' => ['Purchase Orders', 'Mark as delivered'],
        'purchase-orders.complete' => ['Purchase Orders', 'Mark as completed'],
        'purchase-orders.cancel' => ['Purchase Orders', 'Cancel order'],
        'purchase-orders.reopen' => ['Purchase Orders', 'Reopen order'],
        'purchase-orders.send' => ['Purchase Orders', 'Email PDF to supplier'],
        'purchase-orders.download' => ['Purchase Orders', 'Preview / download PDF'],

        // Page: Prescription Sales (pharmacist)
        'prescription-sales.view' => ['Prescription Sales', 'View prescription sales page'],
        'prescription-sales.dispense' => ['Prescription Sales', 'Dispense & send to cashier'],
        'create-prescription-sales' => ['Prescription Sales', 'Add a prescription medicine to an order'],

        // Page: Retail & OTC Sales (pharmacist)
        'retail-otc-sales.view' => ['Retail & OTC Sales', 'View retail & OTC sales page'],
        'retail-otc-sales.draft' => ['Retail & OTC Sales', 'Create a retail draft'],

        // Page: Retail POS (cashier)
        'retail-pos.view' => ['Retail POS', 'View retail point of sale'],
        'retail-pos.checkout' => ['Retail POS', 'Complete a retail sale'],

        // Page: Prescription Checkout (cashier)
        'prescription-checkout.view' => ['Prescription Checkout', 'View checkout queue'],
        'prescription-checkout.complete' => ['Prescription Checkout', 'Complete payment'],

        // Page: Sales History
        'sales-history.view' => ['Sales History', 'View sales history page'],
        'sales-history.receipt' => ['Sales History', 'View a sale / receipt'],
        'sales-history.download' => ['Sales History', 'Download receipt PDF'],
        'sales-history.print' => ['Sales History', 'Print receipt'],
        'sales-history.export' => ['Sales History', 'Export sales report'],

        // Page: Reports
        'reports.view' => ['Reports', 'View reports page'],

        // Page: Sales (Unified POS)
        'apply-sales-discount' => ['Sales', 'Apply a discount to a sale'],

        // Page: Audit Logs
        'audit.view' => ['Audit Logs', 'View audit logs page'],

        // Page: Users
        'users.view' => ['Users', 'View users page'],
        'users.create' => ['Users', 'Add a user'],
        'users.edit' => ['Users', 'Edit a user'],
        'users.delete' => ['Users', 'Delete a user'],
        'users.approve' => ['Users', 'Approve / reject a user'],

        // Page: Roles & Permissions
        'roles.view' => ['Roles & Permissions', 'View roles page'],
        'roles.create' => ['Roles & Permissions', 'Create a role'],
        'roles.edit' => ['Roles & Permissions', 'Edit a role'],
        'roles.delete' => ['Roles & Permissions', 'Delete a role'],
    ];

    /**
     * Default permission slugs per role.
     */
    protected array $defaults = [
        'pharmacist' => [
            'dashboard.view',

            'medicines.view',
            'medicines.create',
            'medicines.edit',
            'medicines.delete',
            'medicines.toggle-status',

            'categories.view',
            'categories.create',
            'categories.edit',
            'categories.delete',

            'suppliers.view',

            'retail-products.view',
            'retail-products.create',
            'retail-products.edit',
            'retail-products.delete',

            'inventory.view',
            'stock-movements.view',
            'stock-movements.create',
            'stock-movements.delete',

            'lowstock.view',
            'lowstock.order-now',

            'prescription-sales.view',
            'prescription-sales.dispense',
            'create-prescription-sales',
            'apply-sales-discount',

            'retail-otc-sales.view',
            'retail-otc-sales.draft',

            'sales-history.view',
            'sales-history.receipt',
            'sales-history.download',
            'sales-history.print',

            'reports.view',

            'warehouse.view',
            'branches.view',

            'audit.view',
        ],
        'cashier' => [
            'dashboard.view',

            'medicines.view',
            'categories.view',
            'suppliers.view',
            'retail-products.view',
            'inventory.view',
            'stock-movements.view',
            'lowstock.view',

            'retail-pos.view',
            'retail-pos.checkout',

            'prescription-checkout.view',
            'prescription-checkout.complete',

            'sales-history.view',
            'sales-history.receipt',
            'sales-history.download',
            'sales-history.print',
            'sales-history.export',

            'branches.view',
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

        // Remove any stale permissions that are no longer in the catalog.
        Permission::whereNotIn('slug', array_keys($this->catalog))->delete();

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

        // Admin role always holds every permission.
        $roleBySlug['admin']->permissions()->sync(Permission::pluck('id')->all());

        // Backfill role_id for existing users based on their role slug.
        foreach (User::all(['id', 'role']) as $user) {
            $role = $roleBySlug[$user->role] ?? null;
            if ($role) {
                $user->role_id = $role->id;
                $user->save();
            }
        }

        $this->command->info('Roles & permissions seeded.');
    }
}
