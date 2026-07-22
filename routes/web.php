<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\MedicineController;
use App\Http\Controllers\StockMovementController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\AdminDashboardController;
use App\Http\Controllers\WelcomeController;
use App\Http\Controllers\SupplierController;

// ============================================
// PUBLIC ROUTES (No Authentication Required)
// ============================================

// Welcome Page - Landing page for visitors
Route::get('/', [WelcomeController::class, 'index'])->name('welcome');

// ============================================
// TEMPORARY AUTHENTICATION ROUTES (For Testing)
// ============================================

// Show login form
Route::get('/login', function () {
    return view('auth.login');
})->name('login');

// Handle login (simple version - just for testing)
Route::post('/login', function () {
    return redirect('/dashboard');
});

// Show register form
Route::get('/register', function () {
    return view('auth.register');
})->name('register');

// Handle register (simple version)
Route::post('/register', function () {
    return redirect('/dashboard');
});

// Logout
Route::get('/logout', function () {
    return redirect('/');
})->name('logout');

// ============================================
// PROTECTED ROUTES (Requires Login)
// ============================================

Route::middleware(['auth'])->group(function () {
    
    // Admin Dashboard - Main dashboard after login
    Route::get('/dashboard', [AdminDashboardController::class, 'index'])->name('dashboard');
    
    // Medicine CRUD
    Route::resource('medicines', MedicineController::class)->only([
        'index', 'create', 'store', 'edit', 'update', 'destroy'
    ]);
    
    // Stock Movements
    Route::get('/stock-movements', [StockMovementController::class, 'index'])->name('stock-movements.index');
    Route::post('/stock-movements', [StockMovementController::class, 'store'])->name('stock-movements.store');
    
    // Categories
    Route::resource('categories', CategoryController::class);
    
    // Suppliers
    Route::resource('suppliers', SupplierController::class);
});