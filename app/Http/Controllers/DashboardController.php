<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Medicine;
use App\Models\Sale;
use App\Models\Supplier;
use App\Models\PurchaseOrder;
use App\Models\StockMovement;
use App\Models\Category;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        $branchScope = $user->getBranchScope();

        // Check role using direct comparison
        if ($user->role === 'admin' || $user->role === 'super_admin') {
            return $this->adminDashboard();
        }

        if ($user->role === 'pharmacist') {
            return $this->pharmacistDashboard($branchScope);
        }

        return $this->cashierDashboard($branchScope);
    }

    /*
    |--------------------------------------------------------------------------
    | Shared helper: low-stock medicines
    |--------------------------------------------------------------------------
    */
    private function lowStockMedicines($branchScope = null)
    {
        $query = Medicine::whereColumn('quantity', '<=', 'reorder_level')
            ->with('category');

        if ($branchScope) {
            $query->where('branch_id', $branchScope);
        }

        return $query->orderBy('quantity')->get();
    }

    /*
    |--------------------------------------------------------------------------
    | Shared helper: expired medicines
    |--------------------------------------------------------------------------
    */
    private function expiredMedicines($branchScope = null)
    {
        $query = Medicine::whereNotNull('expiry_date')
            ->where('expiry_date', '<', Carbon::today());

        if ($branchScope) {
            $query->where('branch_id', $branchScope);
        }

        return $query->orderBy('expiry_date')->get();
    }

    /*
    |--------------------------------------------------------------------------
    | Shared helper: medicines expiring within N days
    |--------------------------------------------------------------------------
    */
    private function expiringMedicines(int $days, $branchScope = null)
    {
        $query = Medicine::whereNotNull('expiry_date')
            ->whereBetween('expiry_date', [Carbon::today(), Carbon::today()->addDays($days)]);

        if ($branchScope) {
            $query->where('branch_id', $branchScope);
        }

        return $query->with('category')->orderBy('expiry_date')->get();
    }

    /*
    |--------------------------------------------------------------------------
    | Shared helper: inventory status counts
    |--------------------------------------------------------------------------
    */
    private function inventoryStatus(): array
    {
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

    /*
    |--------------------------------------------------------------------------
    | Shared helper: sales analytics (daily / weekly / monthly)
    |--------------------------------------------------------------------------
    */
    private function salesAnalytics($branchScope = null): array
    {
        // Daily – last 7 days
        $daily = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = Carbon::today()->subDays($i);
            $saleQuery = Sale::whereDate('sale_date', $date);
            if ($branchScope) {
                $saleQuery->where('branch_id', $branchScope);
            }
            $daily[] = [
                'label' => $date->format('D'),
                'date'  => $date->format('Y-m-d'),
                'total' => (float) $saleQuery->sum('total_amount'),
                'count' => $saleQuery->count(),
            ];
        }

        // Weekly – last 4 weeks
        $weekly = [];
        for ($i = 3; $i >= 0; $i--) {
            $start = Carbon::today()->subWeeks($i)->startOfWeek();
            $end   = Carbon::today()->subWeeks($i)->endOfWeek();
            $saleQuery = Sale::whereBetween('sale_date', [$start, $end]);
            if ($branchScope) {
                $saleQuery->where('branch_id', $branchScope);
            }
            $weekly[] = [
                'label' => $start->format('M d') . ' – ' . $end->format('M d'),
                'total' => (float) $saleQuery->sum('total_amount'),
                'count' => $saleQuery->count(),
            ];
        }

        // Monthly – last 6 months
        $monthly = [];
        for ($i = 5; $i >= 0; $i--) {
            $month = Carbon::today()->subMonths($i);
            $saleQuery = Sale::whereYear('sale_date', $month->year)
                ->whereMonth('sale_date', $month->month);
            if ($branchScope) {
                $saleQuery->where('branch_id', $branchScope);
            }
            $monthly[] = [
                'label' => $month->format('M Y'),
                'total' => (float) $saleQuery->sum('total_amount'),
                'count' => $saleQuery->count(),
            ];
        }

        return compact('daily', 'weekly', 'monthly');
    }

    /*
    |--------------------------------------------------------------------------
    | Shared helper: purchase vs sales totals
    |--------------------------------------------------------------------------
    */
    private function purchaseVsSales($branchScope = null): array
    {
        return [
            'totalPurchases' => (float) PurchaseOrder::when($branchScope, function ($query) use ($branchScope) {
                return $query->where('branch_id', $branchScope);
            })->where('status', 'completed')->sum('total_amount'),
            'totalSales'     => (float) Sale::when($branchScope, function ($query) use ($branchScope) {
                return $query->where('branch_id', $branchScope);
            })->sum('total_amount'),
            'purchaseCount'  => PurchaseOrder::when($branchScope, function ($query) use ($branchScope) {
                return $query->where('branch_id', $branchScope);
            })->where('status', 'completed')->count(),
            'salesCount'     => Sale::when($branchScope, function ($query) use ($branchScope) {
                return $query->where('branch_id', $branchScope);
            })->count(),
        ];
    }

    /*
    |--------------------------------------------------------------------------
    | Shared helper: purchase order statistics
    |--------------------------------------------------------------------------
    */
    private function purchaseOrderStats($branchScope = null): array
    {
        $statuses = ['draft', 'pending', 'sent', 'approved', 'delivered', 'completed', 'cancelled'];
        $stats = [];
        foreach ($statuses as $status) {
            $stats[$status] = PurchaseOrder::when($branchScope, function ($query) use ($branchScope) {
                return $query->where('branch_id', $branchScope);
            })->where('status', $status)->count();
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
        foreach (Sale::latest()->take($limit)->get() as $sale) {
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
                'draft'      => "Created Purchase Order #{$po->id}",
                'pending'    => "Submitted Purchase Order #{$po->id}",
                'sent'       => "Sent Purchase Order #{$po->id} to supplier",
                'delivered'  => "Purchase Order #{$po->id} marked as delivered",
                'completed'  => "Completed Purchase Order #{$po->id}",
                'cancelled'  => "Cancelled Purchase Order #{$po->id}",
                default      => "Updated Purchase Order #{$po->id}",
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
        foreach (StockMovement::with('medicine', 'user')->latest()->take($limit)->get() as $movement) {
            $createdAt = $movement->created_at ?? Carbon::now();

            $medicineName = $movement->medicine
                ? $movement->medicine->name
                : 'Unknown medicine';

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

        usort($activities, function ($a, $b) {
            return $b['timestamp'] <=> $a['timestamp'];
        });

        return array_slice($activities, 0, $limit);
    }

    /*
    |--------------------------------------------------------------------------
    | Admin dashboard – full data set
    |--------------------------------------------------------------------------
    */
    private function adminDashboard()
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
            return response()->json([
                'error' => $e->getMessage(),
                'message' => 'Failed to load admin dashboard data'
            ], 500);
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Pharmacist dashboard – inventory & expiry focus
    |--------------------------------------------------------------------------
    */
    private function pharmacistDashboard($branchScope = null)
    {
        try {
            $totalMedicines       = Medicine::when($branchScope, function ($query) use ($branchScope) {
                return $query->where('branch_id', $branchScope);
            })->count();
            $totalStock           = Medicine::when($branchScope, function ($query) use ($branchScope) {
                return $query->where('branch_id', $branchScope);
            })->sum('quantity');

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
            return response()->json([
                'error' => $e->getMessage(),
                'message' => 'Failed to load pharmacist dashboard data'
            ], 500);
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Cashier dashboard – sales focus
    |--------------------------------------------------------------------------
    */
    private function cashierDashboard($branchScope = null)
    {
        try {
            $todaySalesCount      = Sale::when($branchScope, function ($query) use ($branchScope) {
                return $query->where('branch_id', $branchScope);
            })->whereDate('sale_date', Carbon::today())->count();
            $todayRevenue         = Sale::when($branchScope, function ($query) use ($branchScope) {
                return $query->where('branch_id', $branchScope);
            })->whereDate('sale_date', Carbon::today())->sum('total_amount');
            $totalMedicines       = Medicine::when($branchScope, function ($query) use ($branchScope) {
                return $query->where('branch_id', $branchScope);
            })->count();

            $recentSales          = Sale::with('user')->latest()->take(10)->get();

            // Today's sales by hour for a mini chart
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
                // ---- Summary cards ----
                'todaySalesCount'        => $todaySalesCount,
                'todayRevenue'           => $todayRevenue,
                'totalMedicines'         => $totalMedicines,

                // ---- Lists ----
                'recentSales'            => $recentSales,
                'todayHourlySales'       => $todayHourly,

                // ---- Backward-compatible fields ----
                'totalProducts'          => $totalMedicines,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'error' => $e->getMessage(),
                'message' => 'Failed to load cashier dashboard data'
            ], 500);
        }
    }
}
