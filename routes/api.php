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
        Route::delete('/medicines/{medicine}', [MedicineController::class, 'destroy']);

        // Stock Movements - Create, Delete
        Route::post('/stock-movements', [StockMovementController::class, 'store']);
        Route::delete('/stock-movements/{stockMovement}', [StockMovementController::class, 'destroy']);
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
        Route::apiResource('purchase-orders', PurchaseOrderController::class);
    });

    // --------------------------------------------------------------------
    // Inventory Operations (Admin & Pharmacist)
    // --------------------------------------------------------------------
    Route::middleware('role:admin,pharmacist')->group(function () {
        Route::get('/stock-movements', [StockMovementController::class, 'index']);
        Route::get('/stock-movements/{stockMovement}', [StockMovementController::class, 'show']);
        Route::post('/stock-movements', [StockMovementController::class, 'store']);
        Route::delete('/stock-movements/{stockMovement}', [StockMovementController::class, 'destroy']);
        Route::get('/stock-movements/types', [StockMovementController::class, 'getTypes']);
        Route::get('/stock-movements/summary', [StockMovementController::class, 'getSummary']);
        Route::get('/stock-movements/export-pdf', [StockMovementController::class, 'exportPdf']);
        Route::get('/low-stock', [LowStockController::class, 'index']);
        Route::get('/low-stock/export-pdf', [LowStockController::class, 'exportPdf']);
        Route::get('/reports', [ReportController::class, 'index']);
    });

    // --------------------------------------------------------------------
    // Sales Operations (Admin, Cashier, Pharmacist)
    // --------------------------------------------------------------------
    Route::middleware('role:admin,cashier,pharmacist')->group(function () {
        Route::get('/sales', [SaleController::class, 'index']);
        Route::post('/sales/retail', [SaleController::class, 'storeRetail']);
        Route::post('/sales/prescription', [SaleController::class, 'storePrescription']);
        Route::patch('/sales/{id}/status', [SaleController::class, 'updateStatus']);
        Route::get('/sales/today', [SaleController::class, 'getTodaySales']);
        Route::get('/sales/stats', [SaleController::class, 'getStats']);

        Route::apiResource('retail-products', RetailProductController::class);
    });
});