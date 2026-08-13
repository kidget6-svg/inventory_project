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

/*
|--------------------------------------------------------------------------
| Public Routes (no authentication required)
|--------------------------------------------------------------------------
*/
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);

/*
|--------------------------------------------------------------------------
| Protected Routes (Authenticated & Approved)
|--------------------------------------------------------------------------
| All routes below require a valid Sanctum token AND an approved account.
| The 'permission' middleware then enforces per-role authorization.
| Admin (role = 'admin') automatically passes every permission check
| because it holds the wildcard '*' permission.
|
| Roles:
|   admin            – Full system access
|   pharmacist       – Medicines, inventory, batches, prescriptions, reports
|   cashier          – POS, retail sales, prescription sales, payments, receipts, sales history
|   purchasing_staff – Suppliers, purchase orders, receiving, purchasing history
|--------------------------------------------------------------------------
*/
Route::middleware(['auth:sanctum', 'approved'])->group(function () {

    // ── Account & Core ─────────────────────────────────────────────
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
    Route::get('/permissions', [AuthController::class, 'permissions']);
    Route::get('/dashboard', [DashboardController::class, 'index']);

    // ── Low Stock ──────────────────────────────────────────────────
    Route::middleware('permission:suppliers.view')->group(function () {
        Route::get('/suppliers', [SupplierController::class, 'index']);
        Route::get('/suppliers/{supplier}', [SupplierController::class, 'show']);
    });

    // ── User Management (Admin only) ───────────────────────────────
    Route::middleware('permission:users.manage')->group(function () {
        Route::get('/users', [UserController::class, 'index']);
        Route::get('/users/stats', [UserController::class, 'stats']);
        Route::post('/users', [UserController::class, 'store']);
        Route::put('/users/{user}', [UserController::class, 'update']);
        Route::delete('/users/{user}', [UserController::class, 'destroy']);
    });

    Route::middleware('permission:users.approve')->group(function () {
        Route::post('/users/{user}/approve', [UserController::class, 'approve']);
    });

    Route::middleware('permission:users.reject')->group(function () {
        Route::post('/users/{user}/reject', [UserController::class, 'reject']);
    });

    // ── Suppliers ─────────────────────────────────────────────────
    // Read: admin, pharmacist (for medicine assignment), purchasing_staff
    // Write: admin, purchasing_staff
    // ─────────────────────────────────────────────────────────────
    Route::middleware('permission:suppliers.manage')->group(function () {
        Route::post('/suppliers', [SupplierController::class, 'store']);
        Route::post('/suppliers/{supplier}', [SupplierController::class, 'update']);
        Route::put('/suppliers/{supplier}', [SupplierController::class, 'update']);
        Route::delete('/suppliers/{supplier}', [SupplierController::class, 'destroy']);
    });

    // ── Medicines ─────────────────────────────────────────────────
    // Read: admin, pharmacist, cashier, purchasing_staff
    // Write: admin, pharmacist only
    // ─────────────────────────────────────────────────────────────
    Route::middleware('permission:medicines.view')->group(function () {
        Route::get('/medicines', [MedicineController::class, 'index']);
        Route::get('/medicines/{medicine}', [MedicineController::class, 'show']);
        Route::get('/medicines/barcode-label/{medicine}', [MedicineController::class, 'barcodeLabel']);
    });

    Route::middleware('permission:medicines.manage')->group(function () {
        Route::post('/medicines', [MedicineController::class, 'store']);
        Route::put('/medicines/{medicine}', [MedicineController::class, 'update']);
        Route::delete('/medicines/{medicine}', [MedicineController::class, 'destroy']);
    });

    // ── Categories ─────────────────────────────────────────────────
    // Read: admin, pharmacist   | Write: admin, pharmacist
    Route::middleware('permission:categories.view')->group(function () {
        Route::get('/categories', [CategoryController::class, 'index']);
        Route::get('/categories/{category}', [CategoryController::class, 'show']);
    });

    Route::middleware('permission:categories.manage')->group(function () {
        Route::post('/categories', [CategoryController::class, 'store']);
        Route::put('/categories/{category}', [CategoryController::class, 'update']);
        Route::delete('/categories/{category}', [CategoryController::class, 'destroy']);
    });

    // ── Retail / OTC Products ──────────────────────────────────────
    // Read: admin, pharmacist, cashier  |  Write: admin, pharmacist
    Route::middleware('permission:retail_products.view')->group(function () {
        Route::get('/retail-products', [RetailProductController::class, 'index']);
        Route::get('/retail-products/{retailProduct}', [RetailProductController::class, 'show']);
    });

    Route::middleware('permission:retail_products.manage')->group(function () {
        Route::post('/retail-products', [RetailProductController::class, 'store']);
        Route::put('/retail-products/{retailProduct}', [RetailProductController::class, 'update']);
        Route::delete('/retail-products/{retailProduct}', [RetailProductController::class, 'destroy']);
    });

    // ── Stock Movements ─────────────────────────────────────────────
    // Read + Write: admin, pharmacist
    Route::middleware('permission:stock_movements.view')->group(function () {
        Route::get('/stock-movements', [StockMovementController::class, 'index']);
    });

    Route::middleware('permission:stock_movements.manage')->group(function () {
        Route::post('/stock-movements', [StockMovementController::class, 'store']);
        Route::get('/stock-movements/types', [StockMovementController::class, 'getTypes']);
        Route::get('/stock-movements/summary', [StockMovementController::class, 'getSummary']);
        Route::get('/stock-movements/{id}', [StockMovementController::class, 'show']);
    });

    // ── Low Stock Alerts ───────────────────────────────────────────
    // Admin + Pharmacist
    Route::middleware('permission:low_stock.view')->group(function () {
        Route::get('/low-stock', [LowStockController::class, 'index']);
    });

    Route::middleware('permission:low_stock.order')->group(function () {
        Route::post('/low-stock/order-now/{medicine}', [LowStockController::class, 'orderNow']);
    });

    // ── Shelves ────────────────────────────────────────────────────
    // Admin + Pharmacist
    Route::middleware('permission:shelves.view')->group(function () {
        Route::get('/shelves', [ShelfController::class, 'index']);
    });

    // ── Reports ────────────────────────────────────────────────────
    // Admin + Pharmacist
    Route::middleware('permission:reports.view')->group(function () {
        Route::get('/reports', [ReportController::class, 'index']);
        Route::get('/reports/shelves/by-medicine-count', [ReportController::class, 'shelvesByMedicineCount']);
        Route::get('/reports/medicines-sold-by-shelf', [ReportController::class, 'medicinesSoldByShelf']);
        Route::get('/reports/shelf-revenue', [ReportController::class, 'shelfRevenue']);
        Route::get('/reports/medicines-not-sold-this-week', [ReportController::class, 'medicinesNotSoldThisWeek']);
        Route::get('/reports/shelves/low-stock', [ReportController::class, 'shelvesWithLowStock']);
        Route::get('/reports/today-sales', [ReportController::class, 'todaySales']);
    });

    // ── Purchase Orders ────────────────────────────────────────────
    // Admin + Purchasing Staff
    // ─────────────────────────────────────────────────────────────
    // Read: view, show, preview PDF, download PDF
    Route::middleware('permission:purchase_orders.view')->group(function () {
        Route::get('/purchase-orders', [PurchaseOrderController::class, 'index']);
        Route::get('/purchase-orders/{purchaseOrder}', [PurchaseOrderController::class, 'show']);
        Route::get('/purchase-orders/{purchaseOrder}/preview', [PurchaseOrderController::class, 'preview']);
        Route::get('/purchase-orders/{purchaseOrder}/download', [PurchaseOrderController::class, 'download']);
    });

    // Write: create, update, delete, process
    Route::middleware('permission:purchase_orders.manage')->group(function () {
        Route::post('/purchase-orders', [PurchaseOrderController::class, 'store']);
        Route::put('/purchase-orders/{purchaseOrder}', [PurchaseOrderController::class, 'update']);
        Route::delete('/purchase-orders/{purchaseOrder}', [PurchaseOrderController::class, 'destroy']);
        Route::post('/purchase-orders/{purchaseOrder}/process', [PurchaseOrderController::class, 'process']);
    });

    // Purchasing History (completed/delivered orders)
    Route::middleware('permission:purchasing_history.view')->group(function () {
        Route::get('/purchase-orders/history', [PurchaseOrderController::class, 'history']);
    });

    // Workflow: Submit (draft -> pending)
    Route::middleware('permission:purchase_orders.send')->group(function () {
        Route::post('/purchase-orders/{purchaseOrder}/send', [PurchaseOrderController::class, 'send']);
        Route::post('/purchase-orders/{purchaseOrder}/send-email', [PurchaseOrderController::class, 'sendPdfToSupplier']);
        Route::post('/purchase-orders/{purchaseOrder}/resend', [PurchaseOrderController::class, 'resend']);
    });

    // Workflow: Receive (sent -> delivered)
    Route::middleware('permission:purchase_orders.receive')->group(function () {
        Route::post('/purchase-orders/{purchaseOrder}/deliver', [PurchaseOrderController::class, 'deliver']);
    });

    // Workflow: Approve (pending -> approved)
    Route::middleware('permission:purchase_orders.approve')->group(function () {
        Route::post('/purchase-orders/{purchaseOrder}/approve', [PurchaseOrderController::class, 'approve']);
    });

    // Workflow: Complete (approved/delivered -> completed)
    Route::middleware('permission:purchase_orders.complete')->group(function () {
        Route::post('/purchase-orders/{purchaseOrder}/complete', [PurchaseOrderController::class, 'complete']);
    });

    // Workflow: Cancel
    Route::middleware('permission:purchase_orders.cancel')->group(function () {
        Route::post('/purchase-orders/{purchaseOrder}/cancel', [PurchaseOrderController::class, 'cancel']);
    });

    // Workflow: Reopen
    Route::middleware('permission:purchase_orders.reopen')->group(function () {
        Route::post('/purchase-orders/{purchaseOrder}/reopen', [PurchaseOrderController::class, 'reopen']);
    });

    // ── Sales ──────────────────────────────────────────────────────
    // Read access: admin, pharmacist, cashier
    Route::middleware('permission:sales.view')->group(function () {
        Route::get('/sales', [SaleController::class, 'index']);
    });

    Route::middleware('permission:sales.today')->group(function () {
        Route::get('/sales/today', [SaleController::class, 'getTodaySales']);
    });

    Route::middleware('permission:sales.stats')->group(function () {
        Route::get('/sales/stats', [SaleController::class, 'getStats']);
    });

    Route::middleware('permission:sales.history')->group(function () {
        Route::get('/sales/history', [SaleController::class, 'history']);
        Route::get('/sales/export', [SaleController::class, 'export']);
    });

    // Receipts (receipt data, PDF, print)
    Route::middleware('permission:receipts.view')->group(function () {
        Route::get('/sales/{sale}/receipt', [SaleController::class, 'receipt']);
        Route::get('/sales/{sale}/receipt/pdf', [SaleController::class, 'download']);
        Route::get('/sales/{sale}/receipt/print', [SaleController::class, 'print']);
    });

    // Prescription Sales Dispatch — Pharmacist only
    Route::middleware('permission:prescription_sales.dispatch')->group(function () {
        Route::post('/sales/prescription', [SaleController::class, 'storePrescription']);
        Route::post('/sales/retail-draft', [SaleController::class, 'storeRetailDraft']);
    });

    // Retail Sales Checkout — Cashier only
    Route::middleware('permission:retail_sales.manage')->group(function () {
        Route::post('/sales/retail', [SaleController::class, 'storeRetail']);
    });

    // Prescription Checkout / Status Update — Cashier only
    Route::middleware('permission:prescription_sales.checkout')->group(function () {
        Route::patch('/sales/{id}/status', [SaleController::class, 'updateStatus']);
    });
});
