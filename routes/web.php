    <?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\MedicineController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\SupplierController;
use App\Http\Controllers\Api\PurchaseOrderController;
use App\Http\Controllers\Api\SaleController;
use App\Http\Controllers\Api\StockMovementController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\ShelfController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\DashboardController;

// ============================================
// PUBLIC AUTH ROUTES
// ============================================

Route::get('/reports/today-sales', [ReportController::class, 'todaySales']);
Route::get('/csrf-token', function () {
    return response()->json(['token' => csrf_token()]);
});
Route::post('/register', [AuthController::class, 'register']);

Route::post('/login', [AuthController::class, 'login'])->name('login');

// ============================================
// PUBLIC REGISTRATION (Pharmacist & Cashier only)
// ============================================
// Public self-registration. Only pharmacists and cashiers may
// self-register. Admin accounts cannot be self-registered.
// New accounts are created with a "pending" status and must be
// approved by an admin before they can log in.


// ============================================
// PROTECTED ROUTES
// ============================================

Route::middleware(['auth', 'approved'])->group(function () {

    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);

    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index']);

    // User Management (admin only)
    Route::middleware('role:admin')->group(function () {
        Route::get('/users', [UserController::class, 'index']);
        Route::post('/users', [UserController::class, 'store']);
        Route::put('/users/{user}', [UserController::class, 'update']);
        Route::delete('/users/{user}', [UserController::class, 'destroy']);
        Route::post('/users/{user}/approve', [UserController::class, 'approve']);
        Route::post('/users/{user}/reject', [UserController::class, 'reject']);
    });

    // Categories - read-only for admin + pharmacist
    Route::middleware('role:admin,pharmacist')->group(function () {
        Route::get('/categories', [CategoryController::class, 'index']);
        Route::get('/categories/{category}', [CategoryController::class, 'show']);
    });

    // Categories - write access admin only
    Route::middleware('role:admin')->group(function () {
        Route::get('/categories/create', [CategoryController::class, 'create']);
        Route::post('/categories', [CategoryController::class, 'store']);
        Route::get('/categories/{category}/edit', [CategoryController::class, 'edit']);
        Route::put('/categories/{category}', [CategoryController::class, 'update']);
        Route::delete('/categories/{category}', [CategoryController::class, 'destroy']);
    });

    // Suppliers (admin only)
    Route::middleware('role:admin')->group(function () {
        Route::apiResource('suppliers', SupplierController::class);
    });

    // Purchase Orders (admin only)
    Route::middleware('role:admin')->group(function () {
        Route::apiResource('purchase-orders', PurchaseOrderController::class);
        Route::post('/purchase-orders/{purchaseOrder}/submit', [PurchaseOrderController::class, 'submit']);
        Route::get('/purchase-orders/{purchaseOrder}/preview', [PurchaseOrderController::class, 'preview']);
        Route::get('/purchase-orders/{purchaseOrder}/download', [PurchaseOrderController::class, 'download']);
        Route::post('/purchase-orders/{purchaseOrder}/send', [PurchaseOrderController::class, 'send']);
        Route::post('/purchase-orders/{purchaseOrder}/send-email', [PurchaseOrderController::class, 'sendPdfToSupplier']);
        Route::post('/purchase-orders/{purchaseOrder}/resend', [PurchaseOrderController::class, 'resend']);
        Route::post('/purchase-orders/{purchaseOrder}/approve', [PurchaseOrderController::class, 'approve']);
        Route::post('/purchase-orders/{purchaseOrder}/process', [PurchaseOrderController::class, 'process']);
        Route::post('/purchase-orders/{purchaseOrder}/complete', [PurchaseOrderController::class, 'complete']);
        Route::post('/purchase-orders/{purchaseOrder}/cancel', [PurchaseOrderController::class, 'cancel']);
        Route::post('/purchase-orders/{purchaseOrder}/reopen', [PurchaseOrderController::class, 'reopen']);
    });

    // Reports (admin + pharmacist)
    Route::middleware('role:admin,pharmacist')->group(function () {
        Route::get('/reports', [ReportController::class, 'index']);
        Route::get('/reports/shelves/by-medicine-count', [ReportController::class, 'shelvesByMedicineCount']);
        Route::get('/reports/medicines-sold-by-shelf', [ReportController::class, 'medicinesSoldByShelf']);
        Route::get('/reports/shelf-revenue', [ReportController::class, 'shelfRevenue']);
        Route::get('/reports/medicines-not-sold-this-week', [ReportController::class, 'medicinesNotSoldThisWeek']);
        Route::get('/reports/shelves/low-stock', [ReportController::class, 'shelvesWithLowStock']);
    });

    // Shelves (admin + pharmacist)
    Route::middleware('role:admin,pharmacist')->group(function () {
        Route::get('/shelves', [ShelfController::class, 'index']);
    });

    // Medicines - read-only for admin + pharmacist
    Route::middleware('role:admin,pharmacist')->group(function () {
        Route::get('/medicines', [MedicineController::class, 'index']);
        Route::get('/medicines/{medicine}', [MedicineController::class, 'show']);
    });

    // Medicines - write access admin only
    Route::middleware('role:admin')->group(function () {
        Route::get('/medicines/create', [MedicineController::class, 'create']);
        Route::post('/medicines', [MedicineController::class, 'store']);
        Route::get('/medicines/{medicine}/edit', [MedicineController::class, 'edit']);
        Route::put('/medicines/{medicine}', [MedicineController::class, 'update']);
        Route::delete('/medicines/{medicine}', [MedicineController::class, 'destroy']);
    });

    // Stock Movements (admin + pharmacist)
    Route::middleware('role:admin,pharmacist')->group(function () {
        Route::get('/stock-movements', [StockMovementController::class, 'index']);
        Route::get('/stock-movements/{stockMovement}', [StockMovementController::class, 'show']);
        Route::post('/stock-movements', [StockMovementController::class, 'store']);
    });

    // Sales routes — Read-Only (Admin, Pharmacist, Cashier)
    // Admin can view sales data for reports/history but MUST NOT perform sales.
    Route::middleware('role:admin,pharmacist,cashier')->group(function () {
        Route::get('/sales/today', [SaleController::class, 'getTodaySales']);
        Route::get('/sales/stats', [SaleController::class, 'getStats']);
        Route::get('/sales/history', [SaleController::class, 'history']);
        Route::get('/sales/{sale}/receipt', [SaleController::class, 'receipt']);
    });

    // Sales routes — Pharmacist Only (dispatch drafts to cashier queue)
    // Admin is explicitly excluded: Admin MUST NOT perform sales.
    Route::middleware('role:pharmacist')->group(function () {
        Route::post('/sales/prescription', [SaleController::class, 'storePrescription']);
        Route::post('/sales/retail-draft', [SaleController::class, 'storeRetailDraft']);
    });

    // Sales routes — Cashier Only (complete payment & finalize sales)
    Route::middleware('role:cashier')->group(function () {
        Route::post('/sales/retail', [SaleController::class, 'storeRetail']);
    });

    // Sales routes — Complete Payment (Cashier & Admin)
    Route::middleware('role:admin,cashier')->group(function () {
        Route::patch('/sales/{id}/status', [SaleController::class, 'updateStatus']);
    });
});

// ============================================
// CATCH-ALL: Serve React App (must be last)
// ============================================

Route::get('/{any}', function () {
    return view('app');
})->where('any', '.*');
