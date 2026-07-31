<?php
// routes/api.php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\MedicineController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\StockMovementController;
use App\Http\Controllers\Api\LowStockController;
use App\Http\Controllers\Api\SupplierController;
use App\Http\Controllers\Api\SaleController;

Route::apiResource('medicines', MedicineController::class);
Route::apiResource('categories', CategoryController::class);
Route::apiResource('stock-movements', StockMovementController::class);
Route::apiResource('suppliers', SupplierController::class);
Route::apiResource('sales', SaleController::class);

// Custom routes for medicines
Route::get('medicines/low-stock', [MedicineController::class, 'getLowStock']);
Route::get('medicines/expiring/{days?}', [MedicineController::class, 'getExpiringSoon']);

// Low stock routes
Route::get('low-stock', [LowStockController::class, 'index']);
Route::post('low-stock/order-now/{medicine}', [LowStockController::class, 'orderNow']);
Route::get('low-stock/stats', [LowStockController::class, 'getStats']);