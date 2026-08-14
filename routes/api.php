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
use App\Http\Controllers\Api\ShelfController;
use App\Http\Controllers\Api\BranchController;
use App\Http\Controllers\Api\WarehouseController;
use App\Http\Controllers\Api\AuditLogController;
use App\Http\Controllers\Api\StockManagementController;

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
    // USERS
    // --------------------------------------------------------------------
    Route::get('/users', [UserController::class, 'index']);
    Route::get('/users/stats', [UserController::class, 'stats']);
    Route::post('/users', [UserController::class, 'store']);
    Route::put('/users/{user}', [UserController::class, 'update']);
    Route::delete('/users/{user}', [UserController::class, 'destroy']);
    Route::post('/users/{user}/approve', [UserController::class, 'approve']);
    Route::post('/users/{user}/reject', [UserController::class, 'reject']);

    // --------------------------------------------------------------------
    // ROLES
    // --------------------------------------------------------------------
    Route::get('/roles', [RoleController::class, 'index']);
    Route::post('/roles', [RoleController::class, 'store']);
    Route::put('/roles/{role}', [RoleController::class, 'update']);
    Route::delete('/roles/{role}', [RoleController::class, 'destroy']);

    // --------------------------------------------------------------------
    // CATEGORIES
    // --------------------------------------------------------------------
    Route::get('/categories', [CategoryController::class, 'index']);
    Route::get('/categories/{category}', [CategoryController::class, 'show']);
    Route::post('/categories', [CategoryController::class, 'store']);
    Route::put('/categories/{category}', [CategoryController::class, 'update']);
    Route::delete('/categories/{category}', [CategoryController::class, 'destroy']);

    // --------------------------------------------------------------------
    // SHELVES
    // --------------------------------------------------------------------
    Route::get('/shelves', [ShelfController::class, 'index']);
    Route::get('/shelves/{shelf}', [ShelfController::class, 'show']);
    Route::post('/shelves', [ShelfController::class, 'store']);
    Route::put('/shelves/{shelf}', [ShelfController::class, 'update']);
    Route::delete('/shelves/{shelf}', [ShelfController::class, 'destroy']);

    // --------------------------------------------------------------------
    // SUPPLIERS
    // --------------------------------------------------------------------
    Route::get('/suppliers', [SupplierController::class, 'index']);
    Route::get('/suppliers/{supplier}', [SupplierController::class, 'show']);
    Route::post('/suppliers', [SupplierController::class, 'store']);
    Route::put('/suppliers/{supplier}', [SupplierController::class, 'update']);
    Route::delete('/suppliers/{supplier}', [SupplierController::class, 'destroy']);

    // --------------------------------------------------------------------
    // MEDICINES
    // --------------------------------------------------------------------
    Route::get('/medicines', [MedicineController::class, 'index']);
    Route::get('/medicines/{medicine}', [MedicineController::class, 'show']);
    Route::post('/medicines', [MedicineController::class, 'store']);
    Route::put('/medicines/{medicine}', [MedicineController::class, 'update']);
    Route::delete('/medicines/{medicine}', [MedicineController::class, 'destroy']);
    Route::patch('/medicines/{medicine}/status', [MedicineController::class, 'updateStatus']);

    // --------------------------------------------------------------------
    // RETAIL PRODUCTS
    // --------------------------------------------------------------------
    Route::get('/retail-products', [RetailProductController::class, 'index']);
    Route::get('/retail-products/{retailProduct}', [RetailProductController::class, 'show']);
    Route::post('/retail-products', [RetailProductController::class, 'store']);
    Route::put('/retail-products/{retailProduct}', [RetailProductController::class, 'update']);
    Route::delete('/retail-products/{retailProduct}', [RetailProductController::class, 'destroy']);

    // --------------------------------------------------------------------
    // STOCK MOVEMENTS
    // --------------------------------------------------------------------
    Route::get('/stock-movements', [StockMovementController::class, 'index']);
    Route::get('/stock-movements/types', [StockMovementController::class, 'getTypes']);
    Route::get('/stock-movements/summary', [StockMovementController::class, 'getSummary']);
    Route::get('/stock-movements/{id}', [StockMovementController::class, 'show']);
    Route::post('/stock-movements', [StockMovementController::class, 'store']);
    Route::delete('/stock-movements/{id}', [StockMovementController::class, 'destroy']);

    // --------------------------------------------------------------------
    // STOCK MANAGEMENT
    // --------------------------------------------------------------------
    Route::get('/stock-management/summary', [StockManagementController::class, 'summary']);
    Route::get('/stock-management/current', [StockManagementController::class, 'currentStock']);
    Route::get('/stock-management/low-stock', [StockManagementController::class, 'lowStock']);
    Route::get('/stock-management/expiry', [StockManagementController::class, 'expiry']);
    Route::get('/stock-management/damaged', [StockManagementController::class, 'damaged']);

    // --------------------------------------------------------------------
    // LOW STOCK
    // --------------------------------------------------------------------
    Route::get('/low-stock', [LowStockController::class, 'index']);
    Route::post('/low-stock/order-now/{medicine}', [LowStockController::class, 'orderNow']);

    // --------------------------------------------------------------------
    // PURCHASE ORDERS
    // --------------------------------------------------------------------
    Route::get('/purchase-orders', [PurchaseOrderController::class, 'index']);
    Route::get('/purchase-orders/{purchaseOrder}', [PurchaseOrderController::class, 'show']);
    Route::post('/purchase-orders', [PurchaseOrderController::class, 'store']);
    Route::put('/purchase-orders/{purchaseOrder}', [PurchaseOrderController::class, 'update']);
    Route::delete('/purchase-orders/{purchaseOrder}', [PurchaseOrderController::class, 'destroy']);
    Route::post('/purchase-orders/{purchaseOrder}/submit', [PurchaseOrderController::class, 'submit']);
    Route::post('/purchase-orders/{purchaseOrder}/approve', [PurchaseOrderController::class, 'approve']);
    Route::post('/purchase-orders/{purchaseOrder}/deliver', [PurchaseOrderController::class, 'deliver']);
    Route::post('/purchase-orders/{purchaseOrder}/complete', [PurchaseOrderController::class, 'complete']);
    Route::post('/purchase-orders/{purchaseOrder}/cancel', [PurchaseOrderController::class, 'cancel']);
    Route::post('/purchase-orders/{purchaseOrder}/reopen', [PurchaseOrderController::class, 'reopen']);
    Route::post('/purchase-orders/{purchaseOrder}/send', [PurchaseOrderController::class, 'send']);
    Route::get('/purchase-orders/{purchaseOrder}/preview', [PurchaseOrderController::class, 'preview']);
    Route::get('/purchase-orders/{purchaseOrder}/download', [PurchaseOrderController::class, 'download']);

    // --------------------------------------------------------------------
    // SALES
    // --------------------------------------------------------------------
    Route::post('/sales/prescription', [SaleController::class, 'storePrescription']);
    Route::post('/sales/retail-draft', [SaleController::class, 'storeRetailDraft']);
    Route::post('/sales/retail', [SaleController::class, 'storeRetail']);
    Route::patch('/sales/{id}/status', [SaleController::class, 'updateStatus']);
    Route::get('/sales', [SaleController::class, 'index']);
    Route::get('/sales/history', [SaleController::class, 'history']);
    Route::get('/sales/today', [SaleController::class, 'getTodaySales']);
    Route::get('/sales/stats', [SaleController::class, 'getStats']);
    Route::get('/sales/{sale}/receipt', [SaleController::class, 'receipt']);
    Route::get('/sales/{sale}/receipt/pdf', [SaleController::class, 'download']);
    Route::get('/sales/{sale}/receipt/print', [SaleController::class, 'print']);
    Route::get('/sales/export', [SaleController::class, 'export']);

    // --------------------------------------------------------------------
    // BRANCHES
    // --------------------------------------------------------------------
    Route::get('/branches', [BranchController::class, 'index']);
    Route::get('/branches/stats', [BranchController::class, 'stats']);
    Route::get('/branches/{branch}', [BranchController::class, 'show']);
    Route::post('/branches', [BranchController::class, 'store']);
    Route::put('/branches/{branch}', [BranchController::class, 'update']);
    Route::delete('/branches/{branch}', [BranchController::class, 'destroy']);
    Route::get('/branches/{branch}/inventory', [BranchController::class, 'inventory']);
    Route::get('/branches/{branch}/sales', [BranchController::class, 'sales']);

    // --------------------------------------------------------------------
    // WAREHOUSE
    // --------------------------------------------------------------------
    Route::get('/warehouse/stats', [WarehouseController::class, 'stats']);
    Route::get('/warehouse/shelves', [WarehouseController::class, 'shelves']);
    Route::get('/warehouse/stock', [WarehouseController::class, 'stock']);
    Route::get('/warehouse/receiving-history', [WarehouseController::class, 'receivingHistory']);
    Route::get('/warehouse/transfer-requests', [WarehouseController::class, 'transferRequests']);
    Route::post('/warehouse/receive', [WarehouseController::class, 'receive']);
    Route::post('/warehouse/transfer/{transfer}/approve', [WarehouseController::class, 'approveTransfer']);
    Route::post('/warehouse/transfer/{transfer}/complete', [WarehouseController::class, 'completeTransfer']);

    // --------------------------------------------------------------------
    // REPORTS
    // --------------------------------------------------------------------
    Route::get('/reports', [ReportController::class, 'index']);

    // --------------------------------------------------------------------
    // AUDIT LOGS
    // --------------------------------------------------------------------
    Route::get('/audit-logs', [AuditLogController::class, 'index']);
    Route::get('/audit-logs/stats', [AuditLogController::class, 'stats']);
    Route::get('/audit-logs/modules', [AuditLogController::class, 'modules']);
    Route::get('/audit-logs/export', [AuditLogController::class, 'export']);
});