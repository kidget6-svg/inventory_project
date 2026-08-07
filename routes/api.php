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
Route::post('/login', [AuthController::class, 'login']);
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
    Route::get('/dashboard', [DashboardController::class, 'index']);

    // --------------------------------------------------------------------
    // Admin Only
    // --------------------------------------------------------------------
    Route::middleware('role:admin')->group(function () {
        Route::get('/users', [UserController::class, 'index']);
        Route::get('/users/stats', [UserController::class, 'stats']);
        Route::post('/users', [UserController::class, 'store']);
        Route::put('/users/{user}', [UserController::class, 'update']);
        Route::delete('/users/{user}', [UserController::class, 'destroy']);
        Route::post('/users/{user}/approve', [UserController::class, 'approve']);
        Route::post('/users/{user}/reject', [UserController::class, 'reject']);

        // Admin-only operations for suppliers and purchase orders
        Route::apiResource('suppliers', SupplierController::class)->except(['index', 'show']);
        Route::apiResource('purchase-orders', PurchaseOrderController::class);
    });

    // --------------------------------------------------------------------
    // Read-Only Catalogue Access (Admin + Pharmacist + Cashier)
    // Allows cashiers to fetch medicines, categories, and suppliers
    // --------------------------------------------------------------------
    Route::middleware('role:admin,pharmacist,cashier')->group(function () {
        Route::get('/medicines', [MedicineController::class, 'index']);
        Route::get('/medicines/{medicine}', [MedicineController::class, 'show'])->where('medicine', '[0-9]+');

        Route::get('/categories', [CategoryController::class, 'index']);
        Route::get('/categories/{category}', [CategoryController::class, 'show']);

        Route::get('/suppliers', [SupplierController::class, 'index']);
        Route::get('/suppliers/{supplier}', [SupplierController::class, 'show']);
    });

    // --------------------------------------------------------------------
    // Write / Management Access (Admin + Pharmacist Only)
    // --------------------------------------------------------------------
    Route::middleware('role:admin,pharmacist')->group(function () {
        // Management for categories & medicines
        Route::post('/categories', [CategoryController::class, 'store']);
        Route::put('/categories/{category}', [CategoryController::class, 'update']);
        Route::delete('/categories/{category}', [CategoryController::class, 'destroy']);

        Route::post('/medicines', [MedicineController::class, 'store']);
        Route::put('/medicines/{medicine}', [MedicineController::class, 'update']);
        Route::delete('/medicines/{medicine}', [MedicineController::class, 'destroy']);
        Route::get('/medicines/low-stock', [MedicineController::class, 'getLowStock']);

        // Stock tracking & reports
        Route::get('/stock-movements', [StockMovementController::class, 'index']);
        Route::post('/stock-movements', [StockMovementController::class, 'store']);
        Route::get('/low-stock', [LowStockController::class, 'index']);
        Route::post('/low-stock/order-now/{medicine}', [LowStockController::class, 'orderNow']);
        Route::get('/reports', [ReportController::class, 'index']);
    });

    // --------------------------------------------------------------------
    // Read-Only Catalogue Access (Admin + Pharmacist + Cashier)
    // Allows cashiers to fetch retail products for POS
    // --------------------------------------------------------------------
    Route::middleware('role:admin,pharmacist,cashier')->group(function () {
        Route::get('/retail-products', [RetailProductController::class, 'index']);
        Route::get('/retail-products/{retail_product}', [RetailProductController::class, 'show'])->where('retail_product', '[0-9]+');
    });

    // --------------------------------------------------------------------
    // Admin-only: Retail Product Management
    // --------------------------------------------------------------------
    Route::middleware('role:admin')->group(function () {
        Route::post('/retail-products', [RetailProductController::class, 'store']);
        Route::put('/retail-products/{retail_product}', [RetailProductController::class, 'update']);
        Route::delete('/retail-products/{retail_product}', [RetailProductController::class, 'destroy']);
    });

    // --------------------------------------------------------------------
    // Cashier-only: Sales Queue & Retail Checkout
    // --------------------------------------------------------------------
    Route::middleware('role:cashier')->group(function () {
        Route::get('/sales', [SaleController::class, 'index']);
        Route::post('/sales/retail', [SaleController::class, 'storeRetail']);
        Route::patch('/sales/{id}/status', [SaleController::class, 'updateStatus']);
    });

    // --------------------------------------------------------------------
    // Pharmacist-only: Prescription Sales
    // --------------------------------------------------------------------
    Route::middleware('role:pharmacist')->group(function () {
        Route::post('/sales/prescription', [SaleController::class, 'storePrescription']);
        Route::post('/sales/retail-draft', [SaleController::class, 'storeRetailDraft']);
    });

    // --------------------------------------------------------------------
    // Shared read-only: Sales stats, today's sales, and receipts
    // --------------------------------------------------------------------
    Route::middleware('role:admin,cashier,pharmacist')->group(function () {
        Route::get('/sales/today', [SaleController::class, 'getTodaySales']);
        Route::get('/sales/stats', [SaleController::class, 'getStats']);

        // Receipt & PDF routes
        Route::get('/sales/{sale}/receipt', [SaleController::class, 'receipt']);
        Route::get('/sales/{sale}/receipt/pdf', [SaleController::class, 'download']);
        Route::get('/sales/{sale}/receipt/print', [SaleController::class, 'print']);
    });

    // Admin-only: Sales History & Export (read-only)
    Route::middleware('role:admin')->group(function () {
        Route::get('/sales/history', [SaleController::class, 'history']);
        Route::get('/sales/export', [SaleController::class, 'export']);
    });
});
