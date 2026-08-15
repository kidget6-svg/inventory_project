<?php
namespace App\Http\Controllers\Api;


use App\Http\Controllers\Controller;
use App\Models\Batch;
use App\Models\Category;
use App\Models\Medicine;
use App\Models\PurchaseOrder;
use App\Models\Sale;
use App\Models\StockMovement;
use App\Models\Supplier;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class DashboardController extends Controller
{
    /**
     * Main dashboard endpoint.
     */
    public function index(): JsonResponse
    {
        try {
            $user = Auth::user();

            if (!$user) {
                return response()->json(['error' => 'Unauthenticated'], 401);
            }

            // Use direct role comparison instead of methods
            if ($user->role === 'admin' || $user->role === 'super_admin') {
                return $this->adminDashboard();
            }

            if ($user->role === 'pharmacist') {
                return $this->pharmacistDashboard();
            }

            if ($user->role === 'purchasing_staff') {
                return $this->purchasingStaffDashboard();
            }

            return $this->cashierDashboard();

        } catch (\Exception $e) {
            Log::error('Dashboard error: ' . $e->getMessage());
            return response()->json([
                'error' => $e->getMessage(),
                'message' => 'Failed to load dashboard'
            ], 500);
        }
    }

    /**
     * Get medicines that are at or below the reorder level.
     */
    private function lowStockMedicines()
    {
        return Medicine::whereColumn('quantity', '<=', 'reorder_level')
            ->with('category')
            ->orderBy('quantity')
            ->get();
    }

    /**
     * Get medicines with at least one expired batch
     * that still has stock.
     */
    private function expiredMedicines()
    {
        return Medicine::whereNotNull('expiry_date')
            ->where('expiry_date', '<', Carbon::today())
            ->orderBy('expiry_date')
            ->get();
    }

    /**
     * Get medicines expiring within the specified number of days.
     */
    private function expiringMedicines(int $days)
    {
        return Medicine::whereNotNull('expiry_date')
            ->whereBetween('expiry_date', [Carbon::today(), Carbon::today()->addDays($days)])
            ->with('category')
            ->get();
    }

    /**
     * Inventory status counts.
     */
    private function inventoryStatus(): array
    {
        $totalStockByMedicine = Batch::query()
            ->selectRaw('medicine_id, SUM(quantity) as total_quantity')
            ->groupBy('medicine_id')
            ->get();

        $outOfStockCount = $totalStockByMedicine
            ->where('total_quantity', '<=', 0)
            ->count();

        $lowStockCount = $totalStockByMedicine
            ->where('total_quantity', '>', 0)
            ->where(
                'total_quantity',
                '<=',
                Medicine::DEFAULT_REORDER_LEVEL
            )
            ->count();

        $inStockCount = $totalStockByMedicine
            ->where('total_quantity', '>', Medicine::DEFAULT_REORDER_LEVEL)
            ->count();

        $expiredCount = Batch::query()
            ->whereDate('expiry_date', '<', Carbon::today())
            ->where('quantity', '>', 0)
            ->distinct()
            ->count('medicine_id');

        return [
            'inStock' => Medicine::where('quantity', '>', 0)
                ->whereColumn('quantity', '>', 'reorder_level')
                ->where(function ($q) {
                    $q->whereNull('expiry_date')
                        ->orWhere('expiry_date', '>=', Carbon::today());
                })->count(),
            'lowStock' => Medicine::where('quantity', '>', 0)
                ->whereColumn('quantity', '<=', 'reorder_level')
                ->where(function ($q) {
                    $q->whereNull('expiry_date')
                        ->orWhere('expiry_date', '>=', Carbon::today());
                })->count(),
            'outOfStock' => Medicine::where('quantity', 0)->count(),
            'expired' => Medicine::whereNotNull('expiry_date')
                ->where('expiry_date', '<', Carbon::today())
                ->count(),
        ];
    }

    /**
     * Sales analytics for daily, weekly and monthly periods.
     */
    private function salesAnalytics(): array
    {
        // Last 7 days
        $daily = [];

        for ($i = 6; $i >= 0; $i--) {
            $date = Carbon::today()->subDays($i);
            $daily[] = [
                'label' => $date->format('D'),
                'date'  => $date->format('Y-m-d'),
                'total' => (float) Sale::whereDate('sale_date', $date)->sum('total_amount'),
                'count' => Sale::whereDate('sale_date', $date)->count(),
            ];
        }

        // Last 4 weeks
        $weekly = [];

        for ($i = 3; $i >= 0; $i--) {
            $start = Carbon::today()->subWeeks($i)->startOfWeek();
            $end   = Carbon::today()->subWeeks($i)->endOfWeek();
            $weekly[] = [
                'label' => $start->format('M d') . ' – ' . $end->format('M d'),
                'total' => (float) Sale::whereBetween('sale_date', [$start, $end])->sum('total_amount'),
                'count' => Sale::whereBetween('sale_date', [$start, $end])->count(),
            ];
        }

        // Last 6 months
        $monthly = [];

        for ($i = 5; $i >= 0; $i--) {
            $month = Carbon::today()->subMonths($i);
            $monthly[] = [
                'label' => $month->format('M Y'),
                'total' => (float) Sale::whereYear('sale_date', $month->year)
                    ->whereMonth('sale_date', $month->month)
                    ->sum('total_amount'),
                'count' => Sale::whereYear('sale_date', $month->year)
                    ->whereMonth('sale_date', $month->month)
                    ->count(),
            ];
        }

        return [
            'daily' => $daily,
            'weekly' => $weekly,
            'monthly' => $monthly,
        ];
    }

    /**
     * Purchase and sales totals.
     */
    private function purchaseVsSales(): array
    {
        return [
            'totalPurchases' => (float) PurchaseOrder::where('status', 'completed')->sum('total_amount'),
            'totalSales'     => (float) Sale::sum('total_amount'),
            'purchaseCount'  => PurchaseOrder::where('status', 'completed')->count(),
            'salesCount'     => Sale::count(),
        ];
    }

    /**
     * Purchase order statistics.
     */
    private function purchaseOrderStats(): array
    {
        $statuses = ['draft', 'pending', 'sent', 'approved', 'delivered', 'completed', 'cancelled'];
        $stats = [];

        foreach ($statuses as $status) {
            $stats[$status] = PurchaseOrder::where(
                'status',
                $status
            )->count();
        }

        return $stats;
    }

    /*
    |--------------------------------------------------------------------------
    | Shared helper: recent activities
    |--------------------------------------------------------------------------
    */
    private function recentActivities(int $limit = 4): array
    {
        $activities = [];

        // Recent sales
        foreach (Sale::with('user')->latest()->take($limit)->get() as $sale) {
            $createdAt = $sale->created_at ?? Carbon::now();

            $activities[] = [
                'id'        => 'sale_' . $sale->id,
                'user'      => $sale->user?->name ?? 'System',
                'action'    => "Completed Sale #{$sale->id}",
                'icon'      => 'shopping-cart',
                'date'      => $createdAt->format('Y-m-d'),
                'time'      => $createdAt->format('H:i'),
                'timestamp' => $createdAt->timestamp,
            ];
        }

        // Recent purchase orders
        foreach (PurchaseOrder::with('supplier')->latest()->take($limit)->get() as $po) {
            $activityAt = $po->updated_at ?? $po->created_at ?? Carbon::now();

            $action = match ($po->status) {
                'draft' => "Created Purchase Order #{$po->id}",
                'pending' => "Submitted Purchase Order #{$po->id}",
                'sent' => "Sent Purchase Order #{$po->id} to supplier",
                'delivered' => "Purchase Order #{$po->id} marked as delivered",
                'completed' => "Completed Purchase Order #{$po->id}",
                'cancelled' => "Cancelled Purchase Order #{$po->id}",
                default => "Updated Purchase Order #{$po->id}",
            };

            $activities[] = [
                'id'        => 'po_' . $po->id,
                'user'      => $po->supplier?->name ?? 'System',
                'action'    => $action,
                'icon'      => 'package',
                'date'      => $activityAt->format('Y-m-d'),
                'time'      => $activityAt->format('H:i'),
                'timestamp' => $activityAt->timestamp,
            ];
        }

        // Recent stock movements
        foreach (StockMovement::with(['medicine', 'user'])->latest()->take($limit)->get() as $movement) {
            $createdAt = $movement->created_at ?? Carbon::now();

            $medicineName = $movement->medicine?->name
                ?? 'Unknown medicine';

            $action = $movement->type === 'in'
                ? "Stock increased for {$medicineName} ({$movement->quantity})"
                : "Stock decreased for {$medicineName} ({$movement->quantity})";

            $activities[] = [
                'id'        => 'sm_' . $movement->id,
                'user'      => $movement->user?->name ?? 'System',
                'action'    => $action,
                'icon'      => 'activity',
                'date'      => $createdAt->format('Y-m-d'),
                'time'      => $createdAt->format('H:i'),
                'timestamp' => $createdAt->timestamp,
            ];
        }

        usort(
            $activities,
            fn ($a, $b) => $b['timestamp'] <=> $a['timestamp']
        );

        return array_slice($activities, 0, $limit);
    }

    /**
     * Admin dashboard.
     */
    private function adminDashboard(): JsonResponse
    {
        try {
            $totalMedicines       = Medicine::count();
            $totalStock           = Medicine::sum('quantity');
            $totalSuppliers       = Supplier::count();
            $totalUsers           = User::count();

            $lowStockMedicines    = $this->lowStockMedicines();
            $lowStockCount        = $lowStockMedicines->count();

            $expiredMedicines     = $this->expiredMedicines();
            $expiredCount         = $expiredMedicines->count();

            $expiring30           = $this->expiringMedicines(30);
            $expiring60           = $this->expiringMedicines(60);
            $expiring90           = $this->expiringMedicines(90);

            $pendingPOs           = PurchaseOrder::where('status', 'pending')->count();

            $todaySalesCount      = Sale::whereDate('sale_date', Carbon::today())->count();
            $todayRevenue         = Sale::whereDate('sale_date', Carbon::today())->sum('total_amount');

            $salesAnalytics       = $this->salesAnalytics();
            $purchaseVsSales      = $this->purchaseVsSales();
            $inventoryStatus      = $this->inventoryStatus();
            $poStats              = $this->purchaseOrderStats();
            $activities           = $this->recentActivities(4);

            $recentPurchaseOrders = PurchaseOrder::with('supplier')
                ->latest()->take(5)->get();

            $salesChartData = [
                'labels'  => array_column($salesAnalytics['daily'], 'label'),
                'counts'  => array_column($salesAnalytics['daily'], 'count'),
                'revenue' => array_column($salesAnalytics['daily'], 'total'),
            ];

            $inventoryChartData = Category::with('medicines')->get()->map(function ($category) {
                return [
                    'category'       => $category->name,
                    'total_stock'    => (int) $category->medicines->sum('quantity'),
                    'medicine_count' => $category->medicines->count(),
                ];
            })->values();

            return response()->json([
                // ---- Summary cards ----
                'totalMedicines'         => $totalMedicines,
                'totalStock'             => $totalStock,
                'lowStockCount'          => $lowStockCount,
                'expiredCount'           => $expiredCount,
                'pendingPurchaseOrders'  => $pendingPOs,
                'todaySalesCount'        => $todaySalesCount,
                'todayRevenue'           => $todayRevenue,
                'totalUsers'             => $totalUsers,
                'totalRevenue'           => (float) Sale::sum('total_amount'),
                'pharmacistCount'        => User::where('role', 'pharmacist')->count(),
                'cashierCount'           => User::where('role', 'cashier')->count(),
                'pendingUsersCount'      => User::where('status', 'pending')->count(),

                // ---- Lists ----
                'lowStockMedicines'      => $lowStockMedicines,
                'expiredMedicines'       => $expiredMedicines,
                'expiringSoon'           => [
                    '30_days' => $expiring30,
                    '60_days' => $expiring60,
                    '90_days' => $expiring90,
                ],
                'expiring30Count'        => $expiring30->count(),
                'expiring60Count'        => $expiring60->count(),
                'expiring90Count'        => $expiring90->count(),

                // ---- Charts ----
                'salesAnalytics'         => $salesAnalytics,
                'salesChartData'         => $salesChartData,
                'inventoryChartData'     => $inventoryChartData,
                'purchaseVsSales'        => $purchaseVsSales,
                'inventoryStatus'        => $inventoryStatus,

                // ---- Purchase order stats ----
                'purchaseOrderStats'     => $poStats,

                // ---- Recent data ----
                'recentActivities'       => $activities,
                'recentPurchaseOrders'   => $recentPurchaseOrders,

                // ---- Backward-compatible fields ----
                'totalProducts'          => $totalMedicines,
                'totalSuppliers'         => $totalSuppliers,
                'expiringCount'          => $expiring90->count(),
                'expiringMedicines'      => $expiring90,
            ]);

        } catch (\Exception $e) {
            Log::error('Admin Dashboard Error: ' . $e->getMessage());
            return response()->json([
                'error' => $e->getMessage(),
                'message' => 'Failed to load dashboard'
            ], 500);
        }
    }

    /**
     * Pharmacist dashboard.
     */
    private function pharmacistDashboard(): JsonResponse
    {
        try {
            $totalMedicines       = Medicine::count();
            $totalStock           = Medicine::sum('quantity');

            $lowStockMedicines    = $this->lowStockMedicines();
            $lowStockCount        = $lowStockMedicines->count();

            $expiredMedicines     = $this->expiredMedicines();
            $expiredCount         = $expiredMedicines->count();

            $expiring30           = $this->expiringMedicines(30);
            $expiring60           = $this->expiringMedicines(60);
            $expiring90           = $this->expiringMedicines(90);

            $salesAnalytics       = $this->salesAnalytics();
            $inventoryStatus      = $this->inventoryStatus();
            $activities           = $this->recentActivities(4);

            return response()->json([
                // ---- Summary cards ----
                'totalMedicines'         => $totalMedicines,
                'totalStock'             => $totalStock,
                'lowStockCount'          => $lowStockCount,
                'expiredCount'           => $expiredCount,
                'expiring30Count'        => $expiring30->count(),
                'expiring60Count'        => $expiring60->count(),
                'expiring90Count'        => $expiring90->count(),

                // ---- Lists ----
                'lowStockMedicines'      => $lowStockMedicines,
                'expiredMedicines'       => $expiredMedicines,
                'expiringSoon'           => [
                    '30_days' => $expiring30,
                    '60_days' => $expiring60,
                    '90_days' => $expiring90,
                ],

                // ---- Charts ----
                'salesAnalytics'         => $salesAnalytics,
                'inventoryStatus'        => $inventoryStatus,

                // ---- Recent ----
                'recentActivities'       => $activities,

                // ---- Backward-compatible fields ----
                'totalProducts'          => $totalMedicines,
                'expiringCount'          => $expiring90->count(),
                'expiringMedicines'      => $expiring90,
            ]);

        } catch (\Exception $e) {
            Log::error('Pharmacist Dashboard Error: ' . $e->getMessage());
            return response()->json([
                'error' => $e->getMessage(),
                'message' => 'Failed to load dashboard'
            ], 500);
        }
    }

    /**
     * Cashier dashboard.
     */
    private function cashierDashboard(): JsonResponse
    {
        try {
            $todaySalesCount      = Sale::whereDate('sale_date', Carbon::today())->count();
            $todayRevenue         = Sale::whereDate('sale_date', Carbon::today())->sum('total_amount');
            $totalMedicines       = Medicine::count();

            $recentSales          = Sale::with('user')->latest()->take(10)->get();

            // Today's sales by hour
            $todayHourly = [];
            for ($h = 0; $h < 24; $h++) {
                $start = Carbon::today()->setHour($h)->setMinute(0)->setSecond(0);
                $end = Carbon::today()->setHour($h)->setMinute(59)->setSecond(59);

                $hourlySales = Sale::whereBetween('sale_date', [$start, $end])->get();
                $todayHourly[] = [
                    'label' => sprintf('%02d:00', $h),
                    'total' => (float) $hourlySales->sum('total_amount'),
                    'count' => $hourlySales->count(),
                ];
            }

            return response()->json([
                'todaySalesCount'        => $todaySalesCount,
                'todayRevenue'           => $todayRevenue,
                'totalMedicines'         => $totalMedicines,

                'recentSales'            => $recentSales,
                'todayHourlySales'       => $todayHourly,

                'totalProducts'          => $totalMedicines,
            ]);

        } catch (\Exception $e) {
            Log::error('Cashier Dashboard Error: ' . $e->getMessage());
            return response()->json([
                'error' => $e->getMessage(),
                'message' => 'Failed to load dashboard'
            ], 500);
        }
    }

    /**
     * Purchasing staff dashboard.
     */
    private function purchasingStaffDashboard(): JsonResponse
    {
        try {
            $today           = Carbon::today();

            $totalSuppliers       = Supplier::count();
            $totalPurchaseOrders  = PurchaseOrder::count();

            $pendingPOs           = PurchaseOrder::where('status', 'pending')->count();
            $pendingReceiving     = PurchaseOrder::whereIn('status', ['sent', 'delivered'])->count();

            $completedThisMonth   = PurchaseOrder::where('status', 'completed')
                ->whereMonth('created_at', $today->month)
                ->whereYear('created_at', $today->year)
                ->count();

            $totalSpendThisMonth  = (float) PurchaseOrder::where('status', 'completed')
                ->whereMonth('created_at', $today->month)
                ->whereYear('created_at', $today->year)
                ->sum('total_amount');

            $poStats              = $this->purchaseOrderStats();
            $activities           = $this->recentActivities(5);

            $recentPurchaseOrders = PurchaseOrder::with('supplier')
                ->latest()
                ->take(10)
                ->get();

            $expiring30           = $this->expiringMedicines(30);

            return response()->json([
                // ---- Summary cards ----
                'totalSuppliers'        => $totalSuppliers,
                'totalPurchaseOrders'   => $totalPurchaseOrders,
                'pendingPurchaseOrders' => $pendingPOs,
                'pendingReceiving'      => $pendingReceiving,
                'totalSpendThisMonth'   => $totalSpendThisMonth,
                'completedThisMonth'    => $completedThisMonth,

                // ---- Purchase Order Stats ----
                'purchaseOrderStats'    => $poStats,

                // ---- Lists ----
                'expiringSoon'          => $expiring30,
                'expiring30Count'       => $expiring30->count(),
                'recentPurchaseOrders'  => $recentPurchaseOrders,

                // ---- Activity ----
                'recentActivities'      => $activities,

                // ---- Misc ----
                'totalProducts'         => Medicine::count(),
            ]);

        } catch (\Exception $e) {
            Log::error('Purchasing Staff Dashboard Error: ' . $e->getMessage());
            return response()->json([
                'error' => $e->getMessage(),
                'message' => 'Failed to load dashboard'
            ], 500);
        }
    }
}
