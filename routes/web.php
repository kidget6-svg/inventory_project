<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\MedicineController;
use App\Http\Controllers\StockMovementController;
use App\Http\Controllers\CategoryController;


Route::get('/', [DashboardController::class, 'index'])
    ->name('dashboard');


Route::resource('medicines', MedicineController::class)
    ->only([
        'index',
        'create',
        'store',
        'edit',
        'update',
        'destroy'
    ]);


Route::get('/stock-movements', [StockMovementController::class, 'index'])
    ->name('stock-movements.index');


Route::post('/stock-movements', [StockMovementController::class, 'store'])
    ->name('stock-movements.store');


Route::resource('categories', CategoryController::class);