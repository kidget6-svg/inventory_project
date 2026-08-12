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

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/
Route::get('/csrf-token', function () {
    return response()->json(['token' => csrf_token()]);
});

Route::post('/login', [AuthController::class, 'login'])->name('login');
Route::post('/register', [AuthController::class, 'register']);

/*
|--------------------------------------------------------------------------
| Protected Routes (Authenticated & Approved)
|--------------------------------------------------------------------------
*/
Route::middleware(['auth:sanctum', 'approved'])->group(function () {

    // Account & Dashboard
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
    Route::put('/settings/password', [AuthController::class, 'updatePassword']);
    Route::get('/dashboard', [DashboardController::class, 'index']);

    // --------------------------------------------------------------------
    // Shared Read-Only Access (Admin, Pharmacist, Cashier)
    // --------------------------------------------------------------------
    Route::middleware('role:admin,pharmacist,cashier')->group(function () {
        // Medicines Read
        Route::get('/medicines', [MedicineController::class, 'index']);
        Route::get('/medicines/low-stock', [MedicineController::class, 'getLowStock']);
        Route::get('/medicines/{medicine}', [MedicineController::class, 'show']);

        // Stock Movements Read
        Route::get('/stock-movements', [StockMovementController::class, 'index']);
        Route::get('/stock-movements/{stockMovement}', [StockMovementController::class, 'show']);
        Route::get('/stock-movements/types', [StockMovementController::class, 'getTypes']);
        Route::get('/stock-movements/summary', [StockMovementController::class, 'getSummary']);
        Route::get('/stock-movements/export-pdf', [StockMovementController::class, 'exportPdf']);

        // Categories Read
        Route::get('/categories', [CategoryController::class, 'index']);
        Route::get('/categories/{category}', [CategoryController::class, 'show']);

        // Suppliers Read
        Route::get('/suppliers', [SupplierController::class, 'index']);
        Route::get('/suppliers/{supplier}', [SupplierController::class, 'show']);

        // Retail Products Read (pharmacist needs this for Retail & OTC Sales page)
        Route::get('/retail-products', [RetailProductController::class, 'index']);
        Route::get('/retail-products/{retailProduct}', [RetailProductController::class, 'show']);
    });

    // --------------------------------------------------------------------
    // Medicines - Read-Only (Admin & Pharmacist only, Cashier excluded)
    // --------------------------------------------------------------------
    Route::middleware('role:admin,pharmacist')->group(function () {
        Route::get('/medicines', [MedicineController::class, 'index']);
        Route::get('/medicines/low-stock', [MedicineController::class, 'getLowStock']);
        Route::get('/medicines/{medicine}', [MedicineController::class, 'show']);
    });

    // --------------------------------------------------------------------
    // Write Operations - Admin & Pharmacist (Create, Update, Delete)
    // --------------------------------------------------------------------
    Route::middleware('role:admin,pharmacist')->group(function () {
        // Categories - Create, Update, Delete
        Route::post('/categories', [CategoryController::class, 'store']);
        Route::put('/categories/{category}', [CategoryController::class, 'update']);
        Route::delete('/categories/{category}', [CategoryController::class, 'destroy']);

        // Medicines - Create, Update, Delete
        Route::post('/medicines', [MedicineController::class, 'store']);
        Route::post('/medicines/{medicine}', [MedicineController::class, 'update']);
        Route::put('/medicines/{medicine}', [MedicineController::class, 'update']);
        Route::patch('/medicines/{medicine}/status', [MedicineController::class, 'updateStatus']);
        Route::delete('/medicines/{medicine}', [MedicineController::class, 'destroy']);

        // Stock Movements - Create, Delete
        Route::post('/stock-movements', [StockMovementController::class, 'store']);
        Route::delete('/stock-movements/{stockMovement}', [StockMovementController::class, 'destroy']);

        // Low Stock & Reports
        Route::get('/low-stock', [LowStockController::class, 'index']);
        Route::get('/low-stock/export-pdf', [LowStockController::class, 'exportPdf']);
        Route::get('/reports', [ReportController::class, 'index']);
    });

    // --------------------------------------------------------------------
    // Admin Only — Management
    // --------------------------------------------------------------------
    Route::middleware('role:admin')->group(function () {
        // User Management
        Route::get('/users', [UserController::class, 'index']);
        Route::get('/users/stats', [UserController::class, 'stats']);
        Route::post('/users', [UserController::class, 'store']);
        Route::put('/users/{user}', [UserController::class, 'update']);
        Route::delete('/users/{user}', [UserController::class, 'destroy']);
        Route::post('/users/{user}/approve', [UserController::class, 'approve']);
        Route::post('/users/{user}/reject', [UserController::class, 'reject']);

        // Suppliers Write
        Route::apiResource('suppliers', SupplierController::class)->except(['index', 'show']);

        // Purchase Orders
        Route::post('/purchase-orders/{purchaseOrder}/submit', [PurchaseOrderController::class, 'submit']);
        Route::post('/purchase-orders/{purchaseOrder}/send', [PurchaseOrderController::class, 'send']);
        Route::post('/purchase-orders/{purchaseOrder}/resend', [PurchaseOrderController::class, 'resend']);
        Route::post('/purchase-orders/{purchaseOrder}/send-email', [PurchaseOrderController::class, 'sendPdfToSupplier']);
        Route::post('/purchase-orders/{purchaseOrder}/deliver', [PurchaseOrderController::class, 'deliver']);
        Route::post('/purchase-orders/{purchaseOrder}/approve', [PurchaseOrderController::class, 'approve']);
        Route::post('/purchase-orders/{purchaseOrder}/complete', [PurchaseOrderController::class, 'complete']);
        Route::post('/purchase-orders/{purchaseOrder}/cancel', [PurchaseOrderController::class, 'cancel']);
        Route::post('/purchase-orders/{purchaseOrder}/reopen', [PurchaseOrderController::class, 'reopen']);
        Route::get('/purchase-orders/{purchaseOrder}/preview', [PurchaseOrderController::class, 'preview']);
        Route::get('/purchase-orders/{purchaseOrder}/download', [PurchaseOrderController::class, 'download']);
        Route::apiResource('purchase-orders', PurchaseOrderController::class);
    });

    // --------------------------------------------------------------------
    // Sales — Read-Only (Admin, Pharmacist, Cashier)
    // Admin can view sales data for reports/history but MUST NOT perform sales.
    // --------------------------------------------------------------------
    Route::middleware('role:admin,pharmacist,cashier')->group(function () {
        Route::get('/sales', [SaleController::class, 'index']);
        Route::get('/sales/today', [SaleController::class, 'getTodaySales']);
        Route::get('/sales/stats', [SaleController::class, 'getStats']);
        Route::get('/sales/{sale}/receipt', [SaleController::class, 'receipt']);
        Route::get('/sales/{sale}/receipt/pdf', [SaleController::class, 'download']);
        Route::get('/sales/{sale}/receipt/print', [SaleController::class, 'print']);
    });

    // --------------------------------------------------------------------
    // Sales History & Export — Admin & Cashier
    // --------------------------------------------------------------------
    Route::middleware('role:admin,cashier')->group(function () {
        Route::get('/sales/history', [SaleController::class, 'history']);
        Route::post('/sales/export', [SaleController::class, 'export']);
        Route::get('/sales/export', [SaleController::class, 'export']);
    });

    // --------------------------------------------------------------------
    // Sales Operations (Admin, Cashier, Pharmacist)
    // --------------------------------------------------------------------
    Route::middleware('role:pharmacist')->group(function () {
        Route::post('/sales/prescription', [SaleController::class, 'storePrescription']);
        Route::post('/sales/retail-draft', [SaleController::class, 'storeRetailDraft']);
    });

    // --------------------------------------------------------------------
    // Sales — Cashier Only (complete payment & finalize sales)
    // --------------------------------------------------------------------
    Route::middleware('role:cashier')->group(function () {
        Route::post('/sales/retail', [SaleController::class, 'storeRetail']);
        Route::patch('/sales/{id}/status', [SaleController::class, 'updateStatus']);
    });

    // --------------------------------------------------------------------
    // Retail Products — Write (Admin only)
    // Read routes are already in the shared read-only group above.
    // --------------------------------------------------------------------
    Route::middleware('role:admin')->group(function () {
        Route::post('/retail-products', [RetailProductController::class, 'store']);
        Route::put('/retail-products/{retailProduct}', [RetailProductController::class, 'update']);
        Route::delete('/retail-products/{retailProduct}', [RetailProductController::class, 'destroy']);
    });
});
