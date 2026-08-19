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
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\ShelfController;
use App\Http\Controllers\Api\StockManagementController;
use App\Http\Controllers\Api\WarehouseController;
use App\Http\Controllers\Api\BranchController;
use App\Http\Controllers\Api\RoleController;

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

        // Shelves Read
        Route::get('/shelves', [ShelfController::class, 'index']);
        Route::get('/shelves/{shelf}', [ShelfController::class, 'show']);

        // Suppliers Read
        Route::get('/suppliers', [SupplierController::class, 'index']);
        Route::get('/suppliers/{supplier}', [SupplierController::class, 'show']);

        // Retail Products Read
        Route::get('/retail-products', [RetailProductController::class, 'index']);
        Route::get('/retail-products/{retailProduct}', [RetailProductController::class, 'show']);

        // Warehouse Read
        Route::get('/warehouse/stats', [WarehouseController::class, 'stats']);
        Route::get('/warehouse/shelves', [WarehouseController::class, 'shelves']);
        Route::get('/warehouse/stock', [WarehouseController::class, 'stock']);
        Route::get('/warehouse/receiving-history', [WarehouseController::class, 'receivingHistory']);
        Route::get('/warehouse/transfer-requests', [WarehouseController::class, 'transferRequests']);
        Route::get('/warehouse/shelves/{id}/items', [WarehouseController::class, 'shelfItems']);

        // Branches Read
        Route::get('/branches', [BranchController::class, 'index']);
        Route::get('/branches/stats', [BranchController::class, 'stats']);
    });

    // --------------------------------------------------------------------
    // Write Operations - Admin & Pharmacist (Create, Update, Delete)
    // --------------------------------------------------------------------
    Route::middleware('role:admin,pharmacist')->group(function () {
        // Categories - Create, Update, Delete
        Route::post('/categories', [CategoryController::class, 'store']);
        Route::put('/categories/{category}', [CategoryController::class, 'update']);
        Route::delete('/categories/{category}', [CategoryController::class, 'destroy']);

        // Shelves - Create, Update, Delete
        Route::post('/shelves', [ShelfController::class, 'store']);
        Route::put('/shelves/{shelf}', [ShelfController::class, 'update']);
        Route::delete('/shelves/{shelf}', [ShelfController::class, 'destroy']);

        // Medicines - Create, Update, Delete
        Route::post('/medicines', [MedicineController::class, 'store']);
        Route::post('/medicines/{medicine}', [MedicineController::class, 'update']);
        Route::put('/medicines/{medicine}', [MedicineController::class, 'update']);
        Route::patch('/medicines/{medicine}/status', [MedicineController::class, 'updateStatus']);
        Route::delete('/medicines/{medicine}', [MedicineController::class, 'destroy']);

        // Stock Movements - Create, Delete
    Route::post('/stock-movements', [StockMovementController::class, 'store']);
    Route::delete('/stock-movements/{stockMovement}', [StockMovementController::class, 'destroy']);

        // Stock Management
        Route::get('/stock-management/summary', [StockManagementController::class, 'summary']);
        Route::get('/stock-management/current', [StockManagementController::class, 'currentStock']);
        Route::get('/stock-management/low-stock', [StockManagementController::class, 'lowStock']);
        Route::get('/stock-management/expiry', [StockManagementController::class, 'expiry']);
        Route::get('/stock-management/damaged', [StockManagementController::class, 'damaged']);

        // Reports
        Route::get('/reports', [ReportController::class, 'index']);

        // Warehouse Write
        Route::post('/warehouse/receive', [WarehouseController::class, 'receive']);
        Route::post('/warehouse/transfers', [WarehouseController::class, 'store']);
        Route::post('/warehouse/transfer/{id}/approve', [WarehouseController::class, 'approveTransfer']);
        Route::post('/warehouse/transfer/{id}/complete', [WarehouseController::class, 'completeTransfer']);
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

        // Roles & Permissions
        Route::get('/roles', [RoleController::class, 'index']);
        Route::post('/roles', [RoleController::class, 'store']);
        Route::put('/roles/{role}', [RoleController::class, 'update']);
        Route::delete('/roles/{role}', [RoleController::class, 'destroy']);

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
    // Sales Operations (Pharmacist Only)
    // --------------------------------------------------------------------
    Route::middleware('role:pharmacist')->group(function () {
        Route::post('/sales/prescription', [SaleController::class, 'storePrescription']);
        Route::post('/sales/retail-draft', [SaleController::class, 'storeRetailDraft']);
    });

    // --------------------------------------------------------------------
    // Unified POS Dispatch (Pharmacist + Cashier) — sends order to checkout
    // --------------------------------------------------------------------
    Route::middleware('role:pharmacist,cashier')->group(function () {
        Route::post('/sales/dispatch', [SaleController::class, 'storeDispatch']);
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
    // --------------------------------------------------------------------
    Route::middleware('role:admin')->group(function () {
        // Branches Write (Admin only)
        Route::post('/branches', [BranchController::class, 'store']);
        Route::put('/branches/{branch}', [BranchController::class, 'update']);
        Route::delete('/branches/{branch}', [BranchController::class, 'destroy']);

        Route::post('/retail-products', [RetailProductController::class, 'store']);
        Route::put('/retail-products/{retailProduct}', [RetailProductController::class, 'update']);
        Route::delete('/retail-products/{retailProduct}', [RetailProductController::class, 'destroy']);
    });
});