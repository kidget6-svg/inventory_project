<?php

/*
|--------------------------------------------------------------------------
| Pharmacy Management System — Centralized Permission Matrix
|--------------------------------------------------------------------------
|
| This file defines every role in the system and the set of permissions
| granted to that role.  Permissions are simple dot-notation strings
| (e.g. "medicines.manage") consumed by the CheckPermission middleware
| and surfaced to the React frontend via the /api/permissions endpoint.
|
| The Admin role always receives "*" (all permissions) and therefore
| bypasses every permission check automatically.
|
| Roles:
|   admin            – Full system access
|   pharmacist       – Medicines, inventory, batches, prescriptions, reports
|   cashier          – POS, retail sales, prescription sales, payments, receipts, sales history
|   purchasing_staff – Suppliers, purchase orders, receiving, purchasing history
|
*/

return [

    /*
    |--------------------------------------------------------------------------
    | Role Definitions
    |--------------------------------------------------------------------------
    | Human-readable labels used by the UI (sidebar badges, user forms).
    */
    'roles' => [
        'admin'            => 'Admin',
        'pharmacist'       => 'Pharmacist',
        'cashier'          => 'Cashier',
        'purchasing_staff' => 'Purchasing Staff',
    ],

    /*
    |--------------------------------------------------------------------------
    | Permission Matrix
    |--------------------------------------------------------------------------
    | Maps each role -> array of permission strings.  A role with '*'
    | means "every permission" (only Admin should have this).
    */
    'permissions' => [

        'admin' => [
            '*',  // Admin has full system access
        ],

        'pharmacist' => [
            // Medicines
            'medicines.view',
            'medicines.manage',
            'medicines.manage_status',
            'medicines.low_stock',
            // Batches
            'batches.view',
            'batches.manage',
            // Inventory / Stock movements
            'inventory.view',
            'stock_movements.view',
            'stock_movements.manage',
            'low_stock.view',
            'low_stock.order',
            // Categories
            'categories.view',
            'categories.manage',
            // Shelves
            'shelves.view',
            // Retail / OTC Products
            'retail_products.view',
            'retail_products.manage',
            // Prescription Sales (dispatch to cashier)
            'prescription_sales.dispatch',
            // Reports
            'reports.view',
            // Suppliers (read-only for assigning to medicines)
            'suppliers.view',
        ],

        'cashier' => [
            // Medicines (read-only for product lookup)
            'medicines.view',
            // Retail Products (read-only for POS catalog)
            'retail_products.view',
            // Retail Sales (cashier POS checkout)
            'retail_sales.manage',
            // Prescription Sales (cashier checkout)
            'prescription_sales.checkout',
            // Payments
            'payments.manage',
            // Receipts
            'receipts.view',
            // Sales History / Stats
            'sales.view',
            'sales.history',
            'sales.stats',
            'sales.today',
        ],

        'purchasing_staff' => [
            // Suppliers
            'suppliers.view',
            'suppliers.manage',
            // Purchase Orders
            'purchase_orders.view',
            'purchase_orders.manage',
            // Purchase Order Workflow
            'purchase_orders.receive',
            'purchase_orders.approve',
            'purchase_orders.complete',
            'purchase_orders.cancel',
            'purchase_orders.reopen',
            'purchase_orders.send',
            'purchase_orders.preview',
            'purchase_orders.download',
            // Purchasing History
            'purchasing_history.view',
            // Medicines (read-only for PO line items)
            'medicines.view',
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Permission Display Names (for UI / debugging)
    |--------------------------------------------------------------------------
    */
    'labels' => [
        'medicines.view'                => 'View Medicines',
        'medicines.manage'              => 'Manage Medicines',
        'medicines.manage_status'       => 'Manage Medicine Status',
        'medicines.low_stock'           => 'View Low Stock Medicines',
        'batches.view'                  => 'View Batches',
        'batches.manage'                => 'Manage Batches',
        'inventory.view'                => 'View Inventory',
        'stock_movements.view'          => 'View Stock Movements',
        'stock_movements.manage'        => 'Manage Stock Movements',
        'low_stock.view'                => 'View Low Stock Alerts',
        'low_stock.order'               => 'Order Low Stock Medicines',
        'categories.view'               => 'View Categories',
        'categories.manage'             => 'Manage Categories',
        'shelves.view'                  => 'View Shelves',
        'retail_products.view'          => 'View Retail Products',
        'retail_products.manage'        => 'Manage Retail Products',
        'prescription_sales.dispatch'   => 'Dispatch Prescription Sales',
        'prescription_sales.checkout'   => 'Checkout Prescription Sales',
        'retail_sales.manage'           => 'Manage Retail Sales',
        'payments.manage'               => 'Manage Payments',
        'receipts.view'                 => 'View Receipts',
        'sales.view'                    => 'View Sales',
        'sales.history'                 => 'View Sales History',
        'sales.stats'                   => 'View Sales Statistics',
        'sales.today'                   => 'View Today Sales',
        'reports.view'                  => 'View Reports',
        'suppliers.view'                => 'View Suppliers',
        'suppliers.manage'              => 'Manage Suppliers',
        'purchase_orders.view'          => 'View Purchase Orders',
        'purchase_orders.manage'        => 'Manage Purchase Orders',
        'purchase_orders.receive'       => 'Receive Orders',
        'purchase_orders.approve'       => 'Approve Purchase Orders',
        'purchase_orders.complete'      => 'Complete Purchase Orders',
        'purchase_orders.cancel'        => 'Cancel Purchase Orders',
        'purchase_orders.reopen'        => 'Reopen Purchase Orders',
        'purchase_orders.send'          => 'Send Purchase Orders',
        'purchase_orders.preview'       => 'Preview Purchase Orders',
        'purchase_orders.download'      => 'Download Purchase Orders',
        'purchasing_history.view'       => 'View Purchasing History',
        'users.manage'                  => 'Manage Users',
        'users.approve'                 => 'Approve Users',
        'users.reject'                  => 'Reject Users',
    ],

];
