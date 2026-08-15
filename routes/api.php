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
    Route::put('/settings/password', [AuthController::class, 'updatePassword']);
    Route::get('/dashboard', [DashboardController::class, 'index']);

    // ============================================================
    // SHARED READ-ONLY ACCESS (Admin, Pharmacist, Cashier)
    // ============================================================
    Route::middleware('role:admin,pharmacist,cashier,purchasing_staff')->group(function () {

        // ---- Medicines ----
        Route::get('/medicines', [MedicineController::class, 'index']);
        Route::get('/medicines/low-stock', [MedicineController::class, 'getLowStock']);
        Route::get('/medicines/{medicine}', [MedicineController::class, 'show']);

        // ---- Stock Movements ----
        Route::get('/stock-movements', [StockMovementController::class, 'index']);
        Route::get('/stock-movements/{stockMovement}', [StockMovementController::class, 'show']);
        Route::get('/stock-movements/types', [StockMovementController::class, 'getTypes']);
        Route::get('/stock-movements/summary', [StockMovementController::class, 'getSummary']);
        Route::get('/stock-movements/export-pdf', [StockMovementController::class, 'exportPdf']);

        // ---- Stock Management (NEW) ----
        Route::get('/stock-management/summary', [StockManagementController::class, 'summary']);
        Route::get('/stock-management/current', [StockManagementController::class, 'currentStock']);
        Route::get('/stock-management/low-stock', [StockManagementController::class, 'lowStock']);
        Route::get('/stock-management/expiry', [StockManagementController::class, 'expiry']);
        Route::get('/stock-management/damaged', [StockManagementController::class, 'damaged']);

        // ---- Categories ----
        Route::get('/categories', [CategoryController::class, 'index']);
        Route::get('/categories/{category}', [CategoryController::class, 'show']);

        // ---- Shelves ----
        Route::get('/shelves', [ShelfController::class, 'index']);
        Route::get('/shelves/{shelf}', [ShelfController::class, 'show']);

        // ---- Suppliers ----
        Route::get('/suppliers', [SupplierController::class, 'index']);
        Route::get('/suppliers/{supplier}', [SupplierController::class, 'show']);

        // ---- Purchase Orders (Read) ----
        Route::get('/purchase-orders', [PurchaseOrderController::class, 'index']);
        Route::get('/purchase-orders/{purchaseOrder}', [PurchaseOrderController::class, 'show']);

        // ---- Retail Products ----
        Route::get('/retail-products', [RetailProductController::class, 'index']);
        Route::get('/retail-products/{retailProduct}', [RetailProductController::class, 'show']);

        // ---- Branches (Read-Only) ----
        Route::get('/branches', [BranchController::class, 'index']);
        Route::get('/branches/{branch}', [BranchController::class, 'show']);
        Route::get('/branches/{branch}/inventory', [BranchController::class, 'inventory']);
        Route::get('/branches/{branch}/sales', [BranchController::class, 'sales']);

        // ---- Warehouse (Read-Only) ----
        Route::get('/warehouse/stats', [WarehouseController::class, 'stats']);
        Route::get('/warehouse/shelves', [WarehouseController::class, 'shelves']);
        Route::get('/warehouse/stock', [WarehouseController::class, 'stock']);
        Route::get('/warehouse/receiving-history', [WarehouseController::class, 'receivingHistory']);

        // ---- Audit Logs (Read-Only) ----
        Route::get('/audit-logs', [AuditLogController::class, 'index']);
        Route::get('/audit-logs/stats', [AuditLogController::class, 'stats']);
        Route::get('/audit-logs/modules', [AuditLogController::class, 'modules']);
    });

    // ============================================================
    // WRITE OPERATIONS - Admin & Pharmacist
    // ============================================================
    Route::middleware('role:admin,pharmacist')->group(function () {

        // ---- Categories ----
        Route::post('/categories', [CategoryController::class, 'store']);
        Route::put('/categories/{category}', [CategoryController::class, 'update']);
        Route::delete('/categories/{category}', [CategoryController::class, 'destroy']);

        // ---- Shelves ----
        Route::post('/shelves', [ShelfController::class, 'store']);
        Route::put('/shelves/{shelf}', [ShelfController::class, 'update']);
        Route::delete('/shelves/{shelf}', [ShelfController::class, 'destroy']);

        // ---- Medicines ----
        Route::post('/medicines', [MedicineController::class, 'store']);
        Route::post('/medicines/{medicine}', [MedicineController::class, 'update']);
        Route::put('/medicines/{medicine}', [MedicineController::class, 'update']);
        Route::patch('/medicines/{medicine}/status', [MedicineController::class, 'updateStatus']);
        Route::delete('/medicines/{medicine}', [MedicineController::class, 'destroy']);

        // ---- Stock Movements ----
        Route::post('/stock-movements', [StockMovementController::class, 'store']);
        Route::delete('/stock-movements/{stockMovement}', [StockMovementController::class, 'destroy']);

        // ---- Stock Management ----
        Route::post('/stock-management/adjust', [StockManagementController::class, 'adjust']);
        Route::post('/stock-management/restock', [StockManagementController::class, 'restock']);
        Route::post('/stock-management/quarantine', [StockManagementController::class, 'quarantine']);

        // ---- Low Stock & Reports ----
        Route::get('/low-stock', [LowStockController::class, 'index']);
        Route::get('/low-stock/export-pdf', [LowStockController::class, 'exportPdf']);
        Route::get('/reports', [ReportController::class, 'index']);

        // ---- Warehouse Operations ----
        Route::post('/warehouse/receive', [WarehouseController::class, 'receive']);
        Route::post('/warehouse/transfer/{transfer}/approve', [WarehouseController::class, 'approveTransfer']);
        Route::post('/warehouse/transfer/{transfer}/complete', [WarehouseController::class, 'completeTransfer']);
        Route::get('/warehouse/transfer-requests', [WarehouseController::class, 'transferRequests']);
    });

    // ============================================================
    // ADMIN ONLY — Full Management
    // ============================================================
    Route::middleware('role:admin')->group(function () {

        // ---- User Management ----
        Route::get('/users', [UserController::class, 'index']);
        Route::get('/users/stats', [UserController::class, 'stats']);
    });

    Route::middleware('permission:users.manage')->group(function () {
        Route::post('/users', [UserController::class, 'store']);
        Route::put('/users/{user}', [UserController::class, 'update']);
        Route::delete('/users/{user}', [UserController::class, 'destroy']);
    });

    // User approval (admin + super_admin only)
    Route::middleware('permission:users.approve')->group(function () {
        Route::post('/users/{user}/approve', [UserController::class, 'approve']);
        Route::post('/users/{user}/reject', [UserController::class, 'reject']);
    });

    // ---- Suppliers (Write: admin + purchasing_staff) ----
    Route::middleware('role:admin,purchasing_staff')->group(function () {
        Route::post('/suppliers', [SupplierController::class, 'store']);
        Route::get('/suppliers/{supplier}/edit', [SupplierController::class, 'edit']);
        Route::put('/suppliers/{supplier}', [SupplierController::class, 'update']);
        Route::delete('/suppliers/{supplier}', [SupplierController::class, 'destroy']);
    });

    // ---- Purchase Orders (admin + purchasing_staff) ----
    Route::middleware('role:admin,purchasing_staff')->group(function () {
        Route::post('/purchase-orders/{purchaseOrder}/submit', [PurchaseOrderController::class, 'submit']);
        Route::post('/purchase-orders/{purchaseOrder}/send', [PurchaseOrderController::class, 'send']);
        Route::post('/purchase-orders/{purchaseOrder}/resend', [PurchaseOrderController::class, 'resend']);
        Route::post('/purchase-orders/{purchaseOrder}/send-email', [PurchaseOrderController::class, 'sendPdfToSupplier']);
        Route::post('/purchase-orders/{purchaseOrder}/deliver', [PurchaseOrderController::class, 'deliver']);
        Route::post('/purchase-orders/{purchaseOrder}/approve', [PurchaseOrderController::class, 'approve']);
        Route::post('/purchase-orders/{purchaseOrder}/complete', [PurchaseOrderController::class, 'complete']);
        Route::post('/purchase-orders/{purchaseOrder}/cancel', [PurchaseOrderController::class, 'cancel']);
        Route::post('/purchase-orders/{purchaseOrder}/reopen', [PurchaseOrderController::class, 'reopen']);
        Route::post('/purchase-orders/{purchaseOrder}/process', [PurchaseOrderController::class, 'process']);
        Route::get('/purchase-orders/{purchaseOrder}/preview', [PurchaseOrderController::class, 'preview']);
        Route::get('/purchase-orders/{purchaseOrder}/download', [PurchaseOrderController::class, 'download']);
        Route::apiResource('purchase-orders', PurchaseOrderController::class)->except(['index', 'show']);
    });

    // ---- Branches, Retail Products, Audit Logs (admin only) ----
    Route::middleware('role:admin')->group(function () {
        // ---- Branches (Full CRUD) ----
        Route::post('/branches', [BranchController::class, 'store']);
        Route::put('/branches/{branch}', [BranchController::class, 'update']);
        Route::delete('/branches/{branch}', [BranchController::class, 'destroy']);
        Route::post('/branches/{branch}/transfer-stock', [BranchController::class, 'transferStock']);

        // ---- Retail Products ----
        Route::post('/retail-products', [RetailProductController::class, 'store']);
        Route::put('/retail-products/{retailProduct}', [RetailProductController::class, 'update']);
        Route::delete('/retail-products/{retailProduct}', [RetailProductController::class, 'destroy']);

        // ---- Audit Logs (Export) ----
        Route::get('/audit-logs/export', [AuditLogController::class, 'export']);
    });

    // ============================================================
    // SALES — Read-Only (Admin, Pharmacist, Cashier)
    // ============================================================
    Route::middleware('role:admin,pharmacist,cashier')->group(function () {
        Route::get('/sales', [SaleController::class, 'index']);
        Route::get('/sales/today', [SaleController::class, 'getTodaySales']);
        Route::get('/sales/stats', [SaleController::class, 'getStats']);
        Route::get('/sales/{sale}/receipt', [SaleController::class, 'receipt']);
        Route::get('/sales/{sale}/receipt/pdf', [SaleController::class, 'download']);
        Route::get('/sales/{sale}/receipt/print', [SaleController::class, 'print']);
    });

    // ============================================================
    // SALES History & Export — Admin & Cashier
    // ============================================================
    Route::middleware('role:admin,cashier')->group(function () {
        Route::get('/sales/history', [SaleController::class, 'history']);
        Route::get('/sales/export', [SaleController::class, 'export']);
    });

    // ============================================================
    // SALES Operations — Pharmacist Only
    // ============================================================
    Route::middleware('role:pharmacist')->group(function () {
        Route::post('/sales/prescription', [SaleController::class, 'storePrescription']);
    });

    Route::middleware('permission:sales.retail')->group(function () {
        Route::post('/sales/retail', [SaleController::class, 'storeRetail']);
        Route::post('/sales/retail-draft', [SaleController::class, 'storeRetailDraft']);
    });

    // ============================================================
    // SALES — Cashier Only
    // ============================================================
    Route::middleware('role:cashier')->group(function () {
        Route::post('/sales/retail', [SaleController::class, 'storeRetail']);
        Route::patch('/sales/{id}/status', [SaleController::class, 'updateStatus']);
    });
});
