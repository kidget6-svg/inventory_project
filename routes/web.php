<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\MedicineController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\SupplierController;
use App\Http\Controllers\Api\PurchaseOrderController;
use App\Http\Controllers\Api\SaleController;
use App\Http\Controllers\Api\StockMovementController;
use App\Http\Controllers\Api\LowStockController;
use App\Http\Controllers\Api\ReportController;

// ============================================
// PUBLIC AUTH ROUTES
// ============================================

Route::get('/csrf-token', function () {
    return response()->json(['token' => csrf_token()]);
});

Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);

// ============================================
// PROTECTED ROUTES
// ============================================

Route::middleware('auth')->group(function () {

    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);

    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index']);

    // Categories (admin only)
    Route::middleware('role:admin')->group(function () {
        Route::apiResource('categories', CategoryController::class);
    });

    // Suppliers (admin only)
    Route::middleware('role:admin')->group(function () {
        Route::apiResource('suppliers', SupplierController::class);
    });

    // Purchase Orders (admin only)
    Route::middleware('role:admin')->group(function () {
        Route::apiResource('purchase-orders', PurchaseOrderController::class);
    });

    // Reports (admin + pharmacist)
    Route::middleware('role:admin,pharmacist')->group(function () {
        Route::get('/reports', [ReportController::class, 'index']);
    });

    // Medicines (admin + pharmacist)
    Route::middleware('role:admin,pharmacist')->group(function () {
        Route::apiResource('medicines', MedicineController::class);
    });

    // Stock Movements (admin + pharmacist)
    Route::middleware('role:admin,pharmacist')->group(function () {
        Route::get('/stock-movements', [StockMovementController::class, 'index']);
        Route::post('/stock-movements', [StockMovementController::class, 'store']);
    });

    // Low Stock (admin + pharmacist)
    Route::middleware('role:admin,pharmacist')->group(function () {
        Route::get('/low-stock', [LowStockController::class, 'index']);
    });

    // Sales (admin + cashier)
    Route::middleware('role:admin,cashier')->group(function () {
        Route::apiResource('sales', SaleController::class);
    });
});

// ============================================
// CATCH-ALL: Serve React App (must be last)
// ============================================

Route::get('/{any}', function () {
    return view('app');
})->where('any', '.*');
