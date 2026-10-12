<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Medicine;
use App\Models\Batch;
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
    public function index(\Illuminate\Http\Request $request)
    {
        $user = Auth::user();

        if ($user->isAdmin()) {
            return $this->adminDashboard($request);
        }

        if ($user->isPharmacist()) {
            return $this->pharmacistDashboard($request);
        }

        return $this->cashierDashboard($request);
    }

    /*
    |--------------------------------------------------------------------------
    | Shared helper: low-stock medicines
    |--------------------------------------------------------------------------
    */
    private function lowStockMedicines(?int $branchScope = null)
    {
        return Medicine::whereColumn('quantity', '<=', 'reorder_level')
            ->when($branchScope, fn($q) => $q->where('branch_id', $branchScope))
            ->with('category')
            ->orderBy('quantity')
            ->get();
    }

    /*
    |--------------------------------------------------------------------------
    | Shared helper: expired medicines
    |--------------------------------------------------------------------------
    */
    private function expiredMedicines(?int $branchScope = null)
    {
        return Batch::whereNotNull('expiry_date')
            ->where('expiry_date', '<', Carbon::today())
            ->when($branchScope, function ($q) use ($branchScope) {
                $q->where(function ($sub) use ($branchScope) {
                    $sub->whereHas('medicine', fn($m) => $m->where('branch_id', $branchScope));
                });
            })
            ->with('medicine')
            ->orderBy('expiry_date')
            ->get()
            ->map(function ($b) {
                $b->name = $b->medicine->name ?? 'Unknown Medicine';
                $b->batch_number = $b->batch_number ?? null;
                $b->expiry_date = $b->expiry_date ?? null;
                return $b;
            });
    }

    /*
    |--------------------------------------------------------------------------
    | Shared helper: medicines expiring within N days
    |--------------------------------------------------------------------------
    */
    private function expiringMedicines(int $days, ?int $branchScope = null)
    {
        return Batch::whereNotNull('expiry_date')
            ->whereBetween('expiry_date', [Carbon::today(), Carbon::today()->addDays($days)])
            ->when($branchScope, function ($q) use ($branchScope) {
                $q->where(function ($sub) use ($branchScope) {
                    $sub->whereHas('medicine', fn($m) => $m->where('branch_id', $branchScope));
                });
            })
            ->with('medicine')
            ->orderBy('expiry_date')
            ->get()
            ->map(function ($b) {
                $b->name = $b->medicine->name ?? 'Unknown Medicine';
                $b->batch_number = $b->batch_number ?? null;
                $b->expiry_date = $b->expiry_date ?? null;
                return $b;
            });
    }

    /*
    |--------------------------------------------------------------------------
    | Shared helper: inventory status counts
    |--------------------------------------------------------------------------
    */
    private function inventoryStatus(?int $branchScope = null): array
    {
        return [
            'inStock' => Medicine::where('quantity', '>', 0)
                ->whereColumn('quantity', '>', 'reorder_level')
                ->when($branchScope, fn($q) => $q->where('branch_id', $branchScope))
                ->where(function ($q) {
                    $q->whereNull('expiry_date')
                        ->orWhere('expiry_date', '>=', Carbon::today());
                })->count(),
            'lowStock' => Medicine::where('quantity', '>', 0)
                ->whereColumn('quantity', '<=', 'reorder_level')
                ->when($branchScope, fn($q) => $q->where('branch_id', $branchScope))
                ->where(function ($q) {
                    $q->whereNull('expiry_date')
                        ->orWhere('expiry_date', '>=', Carbon::today());
                })->count(),
            'outOfStock' => Medicine::where('quantity', 0)
                ->when($branchScope, fn($q) => $q->where('branch_id', $branchScope))
                ->count(),
            'expired' => Medicine::whereNotNull('expiry_date')
                ->where('expiry_date', '<', Carbon::today())
                ->when($branchScope, fn($q) => $q->where('branch_id', $branchScope))
                ->count(),
        ];
    }

    /*
    |--------------------------------------------------------------------------
    | Shared helper: sales analytics (daily / weekly / monthly)
    |--------------------------------------------------------------------------
    */
    private function salesAnalytics(?int $branchScope = null): array
    {
        // Daily – last 7 days
        $daily = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = Carbon::today(null)->subDays($i);
            $dailyQuery = Sale::whereDate('sale_date', '=', $date)
                ->when($branchScope, fn($q) => $q->where('branch_id', $branchScope));

            $daily[] = [
                'label' => $date->format('D'),
                'date'  => $date->format('Y-m-d'),
                'total' => (float) (clone $dailyQuery)->sum('total_amount'),
                'count' => (clone $dailyQuery)->count(),
            ];
        }

        // Weekly – last 4 weeks
        $weekly = [];
        for ($i = 3; $i >= 0; $i--) {
            $start = Carbon::today(null)->subWeeks($i)->startOfWeek();
            $end   = Carbon::today(null)->subWeeks($i)->endOfWeek();
            $weeklyQuery = Sale::whereBetween('sale_date', [$start, $end], 'and')
                ->when($branchScope, fn($q) => $q->where('branch_id', $branchScope));

            $weekly[] = [
                'label' => $start->format('M d') . ' – ' . $end->format('M d'),
                'total' => (float) (clone $weeklyQuery)->sum('total_amount'),
                'count' => (clone $weeklyQuery)->count(),
            ];
        }

        // Monthly – last 6 months
        $monthly = [];
        for ($i = 5; $i >= 0; $i--) {
            $month = Carbon::today(null)->subMonths($i);
            $monthlyQuery = Sale::whereYear('sale_date', '=', $month->year)
                ->whereMonth('sale_date', '=', $month->month)
                ->when($branchScope, fn($q) => $q->where('branch_id', $branchScope));

            $monthly[] = [
                'label' => $month->format('M Y'),
                'total' => (float) (clone $monthlyQuery)->sum('total_amount'),
                'count' => (clone $monthlyQuery)->count(),
            ];
        }

        return compact('daily', 'weekly', 'monthly');
    }

    /*
    |--------------------------------------------------------------------------
    | Shared helper: purchase vs sales totals
    |--------------------------------------------------------------------------
    */
    private function purchaseVsSales(?int $branchScope = null): array
    {
        return [
            'totalPurchases' => (float) PurchaseOrder::where('status', 'completed', 'and')->sum('total_amount'),
            'totalSales'     => (float) Sale::when($branchScope, fn($q) => $q->where('branch_id', $branchScope))->sum('total_amount'),
            'purchaseCount'  => PurchaseOrder::where('status', 'completed', 'and')->count(),
            'salesCount'     => Sale::when($branchScope, fn($q) => $q->where('branch_id', $branchScope))->count(),
        ];
    }

    /*
    |--------------------------------------------------------------------------
    | Shared helper: purchase order statistics
    |--------------------------------------------------------------------------
    */
    private function purchaseOrderStats(): array
    {
        $statuses = PurchaseOrder::statuses();
        $stats = [];
        foreach ($statuses as $status) {
            $stats[$status] = PurchaseOrder::where('status', $status)->count();
        }
        return $stats;
    }

    /*
    |--------------------------------------------------------------------------
    | Shared helper: recent activities (built from existing model timestamps)
    |--------------------------------------------------------------------------
    */
    private function recentActivities(int $limit = 4, ?int $branchScope = null): array
    {
        $activities = [];

        // Recent sales
        $salesQuery = Sale::latest()->when($branchScope, fn($q) => $q->where('branch_id', $branchScope));
        foreach ($salesQuery->take($limit)->get() as $sale) {
            $createdAt = $sale->created_at ?? Carbon::now();

            $activities[] = [
                'id'        => 'sale_' . $sale->id,
                'user'      => 'System',
                'action'    => "Completed Sale #{$sale->id}",
                'icon'      => 'shopping-cart',
                'date'      => $createdAt->format('Y-m-d'),
                'time'      => $createdAt->format('H:i'),
                'timestamp' => $createdAt->timestamp,
            ];
        }

        // Recent purchase orders
        foreach (PurchaseOrder::with('supplier')->latest()->take($limit)->get() as $po) {
            $activityAt = $po->completed_at
                ?? $po->sent_at
                ?? $po->updated_at
                ?? $po->created_at
                ?? Carbon::now();

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
                'user'      => 'System',
                'action'    => $action,
                'icon'      => 'package',
                'date'      => $activityAt->format('Y-m-d'),
                'time'      => $activityAt->format('H:i'),
                'timestamp' => $activityAt->timestamp,
            ];
        }

        // Recent stock movements
        $movementsQuery = StockMovement::with('medicine')->latest()->when($branchScope, fn($q) => $q->where('branch_id', $branchScope));
        foreach ($movementsQuery->take($limit)->get() as $movement) {
            $createdAt = $movement->created_at ?? Carbon::now();

            $medicineName = $movement->medicine
                ? $movement->medicine->name
                : 'Unknown medicine';

            $action = $movement->type === 'in'
                ? "Stock increased for {$medicineName} ({$movement->quantity})"
                : "Stock decreased for {$medicineName} ({$movement->quantity})";

            $activities[] = [
                'id'        => 'sm_' . $movement->id,
                'user'      => 'System',
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
    private function adminDashboard(\Illuminate\Http\Request $request)
    {
        $user = Auth::user();
        $branchScope = $user ? $user->getBranchScope($request) : null;

        $totalMedicines       = Medicine::when($branchScope, fn($q) => $q->where('branch_id', $branchScope))->count();
        $totalStock           = Medicine::when($branchScope, fn($q) => $q->where('branch_id', $branchScope))->sum('quantity');
        $totalSuppliers       = Supplier::count();
        $totalUsers           = User::when($branchScope, fn($q) => $q->where('branch_id', $branchScope))->count();

        $lowStockMedicines    = $this->lowStockMedicines($branchScope);
        $lowStockCount        = $lowStockMedicines->count();

        $expiredMedicines     = $this->expiredMedicines($branchScope);
        $expiredCount         = $expiredMedicines->count();

        $expiring30           = $this->expiringMedicines(30, $branchScope);
        $expiring60           = $this->expiringMedicines(60, $branchScope);
        $expiring90           = $this->expiringMedicines(90, $branchScope);

        $pendingPOs           = PurchaseOrder::where('status', 'pending')->count();

        $todaySalesQuery      = Sale::whereDate('sale_date', Carbon::today())->when($branchScope, fn($q) => $q->where('branch_id', $branchScope));
        $todaySalesCount      = (clone $todaySalesQuery)->count();
        $todayRevenue         = (clone $todaySalesQuery)->sum('total_amount');

        $salesAnalytics       = $this->salesAnalytics($branchScope);
        $purchaseVsSales      = $this->purchaseVsSales($branchScope);
        $inventoryStatus      = $this->inventoryStatus($branchScope);
        $poStats              = $this->purchaseOrderStats();
        $activities           = $this->recentActivities(4, $branchScope);

        $recentPurchaseOrders = PurchaseOrder::with('supplier')
            ->latest()->take(5)->get();

        $salesChartData = [
            'labels'  => array_column($salesAnalytics['daily'], 'label'),
            'counts'  => array_column($salesAnalytics['daily'], 'count'),
            'revenue' => array_column($salesAnalytics['daily'], 'total'),
        ];

        $inventoryChartData = Category::with(['medicines' => function($q) use ($branchScope) {
            $q->when($branchScope, fn($sub) => $sub->where('branch_id', $branchScope));
        }])->get()->map(function ($category) {
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
            'totalRevenue'           => (float) Sale::when($branchScope, fn($q) => $q->where('branch_id', $branchScope))->sum('total_amount'),
            'pharmacistCount'        => User::where('role', 'pharmacist')->when($branchScope, fn($q) => $q->where('branch_id', $branchScope))->count(),
            'cashierCount'           => User::where('role', 'cashier')->when($branchScope, fn($q) => $q->where('branch_id', $branchScope))->count(),
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
    }

    /*
    |--------------------------------------------------------------------------
    | Pharmacist dashboard – inventory & expiry focus
    |--------------------------------------------------------------------------
    */
    private function pharmacistDashboard(\Illuminate\Http\Request $request)
    {
        $user = Auth::user();
        $branchScope = $user ? $user->getBranchScope($request) : null;

        $totalMedicines       = Medicine::when($branchScope, fn($q) => $q->where('branch_id', $branchScope))->count();
        $totalStock           = Medicine::when($branchScope, fn($q) => $q->where('branch_id', $branchScope))->sum('quantity');

        $lowStockMedicines    = $this->lowStockMedicines($branchScope);
        $lowStockCount        = $lowStockMedicines->count();

        $expiredMedicines     = $this->expiredMedicines($branchScope);
        $expiredCount         = $expiredMedicines->count();

        $expiring30           = $this->expiringMedicines(30, $branchScope);
        $expiring60           = $this->expiringMedicines(60, $branchScope);
        $expiring90           = $this->expiringMedicines(90, $branchScope);

        $salesAnalytics       = $this->salesAnalytics($branchScope);
        $inventoryStatus      = $this->inventoryStatus($branchScope);
        $activities           = $this->recentActivities(4, $branchScope);

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
    }

    /*
    |--------------------------------------------------------------------------
    | Cashier dashboard – sales focus
    |--------------------------------------------------------------------------
    */
    private function cashierDashboard(\Illuminate\Http\Request $request)
    {
        $user = Auth::user();
        $branchScope = $user ? $user->getBranchScope($request) : null;

        $todaySalesQuery      = Sale::whereDate('sale_date', Carbon::today())->when($branchScope, fn($q) => $q->where('branch_id', $branchScope));
        $todaySalesCount      = (clone $todaySalesQuery)->count();
        $todayRevenue         = (clone $todaySalesQuery)->sum('total_amount');
        $totalMedicines       = Medicine::when($branchScope, fn($q) => $q->where('branch_id', $branchScope))->count();

        $recentSales          = Sale::latest()->when($branchScope, fn($q) => $q->where('branch_id', $branchScope))->take(10)->get();

        // Today's sales by hour for a mini chart
        $todayHourly = [];
        for ($h = 0; $h < 24; $h++) {
            $todayHourly[] = [
                'label' => sprintf('%02d:00', $h),
                'total' => (float) Sale::whereDate('sale_date', Carbon::today())
                    ->when($branchScope, fn($q) => $q->where('branch_id', $branchScope))
                    ->whereTime('sale_date', '>=', sprintf('%02d:00:00', $h))
                    ->whereTime('sale_date', '<', sprintf('%02d:00:00', $h + 1))
                    ->sum('total_amount'),
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
    }
}