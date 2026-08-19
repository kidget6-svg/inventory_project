<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\MedicineController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\SupplierController;
use App\Http\Controllers\Api\PurchaseOrderController;
use App\Http\Controllers\Api\SaleController;
use App\Http\Controllers\Api\RetailProductController;
use App\Http\Controllers\Api\StockMovementController;
use App\Http\Controllers\Api\LowStockController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\RoleController;

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);
Route::post('/password/forgot', [AuthController::class, 'forgotPassword']);
Route::post('/password/reset', [AuthController::class, 'resetPassword']);

/*
|--------------------------------------------------------------------------
| Protected Routes (Authenticated & Approved)
|--------------------------------------------------------------------------
*/
Route::middleware(['auth:sanctum', 'approved'])->group(function () {

    // Account & Dashboard
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);

    Route::middleware('permission:dashboard.view')->group(function () {
        Route::get('/dashboard', [DashboardController::class, 'index']);
    });

    // --------------------------------------------------------------------
    // Page: Users
    // --------------------------------------------------------------------
    Route::middleware('permission:users.view')->group(function () {
        Route::get('/users', [UserController::class, 'index']);
        Route::get('/users/stats', [UserController::class, 'stats']);
    });

    Route::middleware('permission:users.create')->group(function () {
        Route::post('/users', [UserController::class, 'store']);
    });

    Route::middleware('permission:users.edit')->group(function () {
        Route::put('/users/{user}', [UserController::class, 'update']);
    });

    Route::middleware('permission:users.delete')->group(function () {
        Route::delete('/users/{user}', [UserController::class, 'destroy']);
    });

    Route::middleware('permission:users.approve')->group(function () {
        Route::post('/users/{user}/approve', [UserController::class, 'approve']);
        Route::post('/users/{user}/reject', [UserController::class, 'reject']);
    });

    // --------------------------------------------------------------------
    // Page: Roles & Permissions
    // --------------------------------------------------------------------
    Route::middleware('permission:roles.view')->group(function () {
        Route::get('/roles', [RoleController::class, 'index']);
    });

    Route::middleware('permission:roles.create')->group(function () {
        Route::post('/roles', [RoleController::class, 'store']);
    });

    Route::middleware('permission:roles.edit')->group(function () {
        Route::put('/roles/{role}', [RoleController::class, 'update']);
    });

    Route::middleware('permission:roles.delete')->group(function () {
        Route::delete('/roles/{role}', [RoleController::class, 'destroy']);
    });

    // --------------------------------------------------------------------
    // Page: Medicines
    // --------------------------------------------------------------------
    Route::middleware('permission:medicines.view')->group(function () {
        Route::get('/medicines', [MedicineController::class, 'index']);
        Route::get('/medicines/{medicine}', [MedicineController::class, 'show']);
    });

    Route::middleware('permission:medicines.create')->group(function () {
        Route::post('/medicines', [MedicineController::class, 'store']);
    });

    Route::middleware('permission:medicines.edit')->group(function () {
        Route::put('/medicines/{medicine}', [MedicineController::class, 'update']);
    });

    Route::middleware('permission:medicines.toggle-status')->group(function () {
        Route::patch('/medicines/{medicine}/status', [MedicineController::class, 'updateStatus']);
    });

    Route::middleware('permission:medicines.delete')->group(function () {
        Route::delete('/medicines/{medicine}', [MedicineController::class, 'destroy']);
    });

    // --------------------------------------------------------------------
    // Page: Categories
    // --------------------------------------------------------------------
    Route::middleware('permission:categories.view')->group(function () {
        Route::get('/categories', [CategoryController::class, 'index']);
        Route::get('/categories/{category}', [CategoryController::class, 'show']);
    });

    Route::middleware('permission:categories.create')->group(function () {
        Route::post('/categories', [CategoryController::class, 'store']);
    });

    Route::middleware('permission:categories.edit')->group(function () {
        Route::put('/categories/{category}', [CategoryController::class, 'update']);
    });

    Route::middleware('permission:categories.delete')->group(function () {
        Route::delete('/categories/{category}', [CategoryController::class, 'destroy']);
    });

    // --------------------------------------------------------------------
    // Page: Suppliers
    // --------------------------------------------------------------------
    Route::middleware('permission:suppliers.view')->group(function () {
        Route::get('/suppliers', [SupplierController::class, 'index']);
        Route::get('/suppliers/{supplier}', [SupplierController::class, 'show']);
    });

    Route::middleware('permission:suppliers.create')->group(function () {
        Route::post('/suppliers', [SupplierController::class, 'store']);
    });

    Route::middleware('permission:suppliers.edit')->group(function () {
        Route::put('/suppliers/{supplier}', [SupplierController::class, 'update']);
    });

    Route::middleware('permission:suppliers.delete')->group(function () {
        Route::delete('/suppliers/{supplier}', [SupplierController::class, 'destroy']);
    });

    // --------------------------------------------------------------------
    // Page: Retail & OTC Products
    // --------------------------------------------------------------------
    Route::middleware('permission:retail-products.view')->group(function () {
        Route::get('/retail-products', [RetailProductController::class, 'index']);
        Route::get('/retail-products/{retailProduct}', [RetailProductController::class, 'show']);
    });

    Route::middleware('permission:retail-products.create')->group(function () {
        Route::post('/retail-products', [RetailProductController::class, 'store']);
    });

    Route::middleware('permission:retail-products.edit')->group(function () {
        Route::put('/retail-products/{retailProduct}', [RetailProductController::class, 'update']);
    });

    Route::middleware('permission:retail-products.delete')->group(function () {
        Route::delete('/retail-products/{retailProduct}', [RetailProductController::class, 'destroy']);
    });

    // --------------------------------------------------------------------
    // Page: Inventory & Stock Movements
    // --------------------------------------------------------------------
    Route::middleware('permission:stock-movements.view')->group(function () {
        Route::get('/stock-movements', [StockMovementController::class, 'index']);
        Route::get('/stock-movements/types', [StockMovementController::class, 'getTypes']);
        Route::get('/stock-movements/summary', [StockMovementController::class, 'getSummary']);
        Route::get('/stock-movements/{id}', [StockMovementController::class, 'show']);
    });

    Route::middleware('permission:stock-movements.create')->group(function () {
        Route::post('/stock-movements', [StockMovementController::class, 'store']);
    });

    Route::middleware('permission:stock-movements.delete')->group(function () {
        Route::delete('/stock-movements/{id}', [StockMovementController::class, 'destroy']);
    });

    // --------------------------------------------------------------------
    // Page: Low Stock
    // --------------------------------------------------------------------
    Route::middleware('permission:lowstock.view')->group(function () {
        Route::get('/low-stock', [LowStockController::class, 'index']);
        Route::get('/medicines/low-stock', [MedicineController::class, 'getLowStock']);
    });

    Route::middleware('permission:lowstock.order-now')->group(function () {
        Route::post('/low-stock/order-now/{medicine}', [LowStockController::class, 'orderNow']);
    });

    // --------------------------------------------------------------------
    // Page: Purchase Orders
    // --------------------------------------------------------------------
    Route::middleware('permission:purchase-orders.view')->group(function () {
        Route::get('/purchase-orders', [PurchaseOrderController::class, 'index']);
        Route::get('/purchase-orders/{purchaseOrder}', [PurchaseOrderController::class, 'show']);
    });

    Route::middleware('permission:purchase-orders.create')->group(function () {
        Route::post('/purchase-orders', [PurchaseOrderController::class, 'store']);
    });

    Route::middleware('permission:purchase-orders.edit')->group(function () {
        Route::put('/purchase-orders/{purchaseOrder}', [PurchaseOrderController::class, 'update']);
    });

    Route::middleware('permission:purchase-orders.delete')->group(function () {
        Route::delete('/purchase-orders/{purchaseOrder}', [PurchaseOrderController::class, 'destroy']);
    });

    Route::middleware('permission:purchase-orders.submit')->group(function () {
        Route::post('/purchase-orders/{purchaseOrder}/submit', [PurchaseOrderController::class, 'submit']);
    });

    Route::middleware('permission:purchase-orders.approve')->group(function () {
        Route::post('/purchase-orders/{purchaseOrder}/approve', [PurchaseOrderController::class, 'approve']);
    });

    Route::middleware('permission:purchase-orders.deliver')->group(function () {
        Route::post('/purchase-orders/{purchaseOrder}/deliver', [PurchaseOrderController::class, 'deliver']);
    });

    Route::middleware('permission:purchase-orders.complete')->group(function () {
        Route::post('/purchase-orders/{purchaseOrder}/complete', [PurchaseOrderController::class, 'complete']);
    });

    Route::middleware('permission:purchase-orders.cancel')->group(function () {
        Route::post('/purchase-orders/{purchaseOrder}/cancel', [PurchaseOrderController::class, 'cancel']);
    });

    Route::middleware('permission:purchase-orders.reopen')->group(function () {
        Route::post('/purchase-orders/{purchaseOrder}/reopen', [PurchaseOrderController::class, 'reopen']);
    });

    Route::middleware('permission:purchase-orders.send')->group(function () {
        Route::post('/purchase-orders/{purchaseOrder}/send', [PurchaseOrderController::class, 'send']);
        Route::post('/purchase-orders/{purchaseOrder}/resend', [PurchaseOrderController::class, 'resend']);
        Route::post('/purchase-orders/{purchaseOrder}/send-email', [PurchaseOrderController::class, 'sendPdfToSupplier']);
        Route::post('/purchase-orders/{purchaseOrder}/send-pdf', [PurchaseOrderController::class, 'sendPdfToSupplier']);
    });

    Route::middleware('permission:purchase-orders.download')->group(function () {
        Route::get('/purchase-orders/{purchaseOrder}/preview', [PurchaseOrderController::class, 'preview']);
        Route::get('/purchase-orders/{purchaseOrder}/download', [PurchaseOrderController::class, 'download']);
    });

    // --------------------------------------------------------------------
    // Page: Prescription Sales (pharmacist)
    // --------------------------------------------------------------------
    Route::middleware('permission:prescription-sales.dispense')->group(function () {
        Route::post('/sales/prescription', [SaleController::class, 'storePrescription']);
    });

    // --------------------------------------------------------------------
    // Page: Retail & OTC Sales (pharmacist)
    // --------------------------------------------------------------------
    Route::middleware('permission:retail-otc-sales.draft')->group(function () {
        Route::post('/sales/retail-draft', [SaleController::class, 'storeRetailDraft']);
    });

    // --------------------------------------------------------------------
    // Page: Retail POS (cashier)
    // --------------------------------------------------------------------
    Route::middleware('permission:retail-pos.checkout')->group(function () {
        Route::post('/sales/retail', [SaleController::class, 'storeRetail']);
    });

    // --------------------------------------------------------------------
    // Page: Prescription Checkout (cashier)
    // --------------------------------------------------------------------
    Route::middleware('permission:prescription-checkout.complete')->group(function () {
        Route::patch('/sales/{id}/status', [SaleController::class, 'updateStatus']);
    });

    // --------------------------------------------------------------------
    // Page: Sales History
    // --------------------------------------------------------------------
    Route::middleware('permission:sales-history.view')->group(function () {
        Route::get('/sales', [SaleController::class, 'index']);
        Route::get('/sales/history', [SaleController::class, 'history']);
        Route::get('/sales/today', [SaleController::class, 'getTodaySales']);
        Route::get('/sales/stats', [SaleController::class, 'getStats']);
    });

    Route::middleware('permission:sales-history.receipt')->group(function () {
        Route::get('/sales/{sale}/receipt', [SaleController::class, 'receipt']);
    });

    Route::middleware('permission:sales-history.download')->group(function () {
        Route::get('/sales/{sale}/receipt/pdf', [SaleController::class, 'download']);
    });

    Route::middleware('permission:sales-history.print')->group(function () {
        Route::get('/sales/{sale}/receipt/print', [SaleController::class, 'print']);
    });

    Route::middleware('permission:sales-history.export')->group(function () {
        Route::get('/sales/export', [SaleController::class, 'export']);
    });

    // --------------------------------------------------------------------
    // Page: Reports
    // --------------------------------------------------------------------
    Route::middleware('permission:reports.view')->group(function () {
        Route::get('/reports', [ReportController::class, 'index']);
    });
});
