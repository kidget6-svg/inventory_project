<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\MedicineController;
use App\Http\Controllers\StockMovementController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\SupplierController;
use App\Http\Controllers\PurchaseOrderController;
use App\Http\Controllers\SaleController;
use App\Http\Controllers\LowStockController;
use App\Http\Controllers\ReportController;

// Welcome Page
Route::get('/welcome', function () {
    return view('welcome');
})->name('welcome');

// Dashboard
Route::get('/', [DashboardController::class, 'index'])
    ->name('dashboard');

// ============================================
// TEMPORARY AUTHENTICATION ROUTES (For Testing)
// ============================================

// Medicines
Route::resource('medicines', MedicineController::class)
    ->only([
        'index',
        'create',
        'store',
        'edit',
        'update',
        'destroy'
    ]);


// Categories
Route::resource('categories', CategoryController::class);


// Suppliers
Route::resource('suppliers', SupplierController::class);


// Stock Movements
Route::get('/stock-movements', [StockMovementController::class, 'index'])
    ->name('stock-movements.index');

Route::post('/stock-movements', [StockMovementController::class, 'store'])
    ->name('stock-movements.store');


// Purchase Orders
Route::resource('purchase-orders', PurchaseOrderController::class);
Route::resource('sales', SaleController::class);
Route::get('/low-stock', [LowStockController::class, 'index'])
    ->name('low-stock.index');
    Route::get('/reports', [ReportController::class, 'index'])
    ->name('reports.index');
