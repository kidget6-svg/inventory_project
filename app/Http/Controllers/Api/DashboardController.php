<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Medicine;
use App\Models\PurchaseOrder;
use App\Models\Sale;
use App\Models\StockMovement;
use App\Models\Supplier;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index()
    {
        $user = auth()->user();

        if ($user->isAdmin()) {
            return $this->adminDashboard();
        }
        if ($user->isPharmacist()) {
            return $this->pharmacistDashboard();
        }
        return $this->cashierDashboard();
    }

    /*
    |--------------------------------------------------------------------------
    | Shared helper: low-stock medicines
    |--------------------------------------------------------------------------
    */
    private function lowStockMedicines()
    {
        return Medicine::whereColumn('quantity', '<=', 'reorder_level')
            ->with('category')
            ->orderBy('quantity')
            ->get();
    }

    /*
    |--------------------------------------------------------------------------
    | Shared helper: expired medicines
    |--------------------------------------------------------------------------
    */
    private function expiredMedicines()
    {
        return Medicine::whereNotNull('expiry_date')
            ->where('expiry_date', '<', today())
            ->orderBy('expiry_date')
            ->get();
    }

    /*
    |--------------------------------------------------------------------------
    | Shared helper: medicines expiring within N days
    |--------------------------------------------------------------------------
    */
    private function expiringMedicines(int $days)
    {
        return Medicine::whereNotNull('expiry_date')
            ->whereBetween('expiry_date', [today(), today()->addDays($days)])
            ->with('category')
            ->orderBy('expiry_date')
            ->get();
    }

    /*
    |--------------------------------------------------------------------------
    | Shared helper: inventory status counts
    |--------------------------------------------------------------------------
    */
    private function inventoryStatus(): array
    {
        return [
            'inStock'    => Medicine::where('quantity', '>', 0)
                ->whereColumn('quantity', '>', 'reorder_level')
                ->where(function ($q) {
                    $q->whereNull('expiry_date')
                      ->orWhere('expiry_date', '>=', today());
                })->count(),
            'lowStock'   => Medicine::where('quantity', '>', 0)
                ->whereColumn('quantity', '<=', 'reorder_level')
                ->where(function ($q) {
                    $q->whereNull('expiry_date')
                      ->orWhere('expiry_date', '>=', today());
                })->count(),
            'outOfStock' => Medicine::where('quantity', 0)->count(),
            'expired'    => Medicine::whereNotNull('expiry_date')
                ->where('expiry_date', '<', today())->count(),
        ];
    }

    /*
    |--------------------------------------------------------------------------
    | Shared helper: sales analytics (daily / weekly / monthly)
    |--------------------------------------------------------------------------
    */
    private function salesAnalytics(): array
    {
        // Daily – last 7 days
        $daily = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = today()->subDays($i);
            $daily[] = [
                'label' => $date->format('D'),
                'date'  => $date->format('Y-m-d'),
                'total' => (float) Sale::whereDate('sale_date', $date)->sum('total_amount'),
                'count' => Sale::whereDate('sale_date', $date)->count(),
            ];
        }

        // Weekly – last 4 weeks
        $weekly = [];
        for ($i = 3; $i >= 0; $i--) {
            $start = today()->subWeeks($i)->startOfWeek();
            $end   = today()->subWeeks($i)->endOfWeek();
            $weekly[] = [
                'label' => $start->format('M d') . ' – ' . $end->format('M d'),
                'total' => (float) Sale::whereBetween('sale_date', [$start, $end])->sum('total_amount'),
                'count' => Sale::whereBetween('sale_date', [$start, $end])->count(),
            ];
        }

        // Monthly – last 6 months
        $monthly = [];
        for ($i = 5; $i >= 0; $i--) {
            $month = today()->subMonths($i);
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

        return compact('daily', 'weekly', 'monthly');
    }

    /*
    |--------------------------------------------------------------------------
    | Shared helper: purchase vs sales totals
    |--------------------------------------------------------------------------
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
    private function recentActivities(int $limit = 10): array
    {
        $activities = [];

        // Recent sales
        foreach (Sale::latest()->take($limit)->get() as $sale) {
            $createdAt = $sale->created_at ?? now();
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
            $updatedAt = $po->updated_at ?? $po->created_at ?? now();
            $action = match ($po->status) {
                'pending'    => "Created Purchase Order #{$po->id}",
                'approved'   => "Approved Purchase Order #{$po->id}",
                'processing' => "Processing Purchase Order #{$po->id}",
                'completed'  => "Completed Purchase Order #{$po->id}",
                'cancelled'  => "Cancelled Purchase Order #{$po->id}",
                default      => "Updated Purchase Order #{$po->id}",
            };
            $activities[] = [
                'id'        => 'po_' . $po->id,
                'user'      => 'System',
                'action'    => $action,
                'icon'      => 'package',
                'date'      => $updatedAt->format('Y-m-d'),
                'time'      => $updatedAt->format('H:i'),
                'timestamp' => $updatedAt->timestamp,
            ];
        }

        // Recently added medicines
        foreach (Medicine::latest()->take($limit)->get() as $medicine) {
            $createdAt = $medicine->created_at ?? now();
            $activities[] = [
                'id'        => 'med_' . $medicine->id,
                'user'      => 'System',
                'action'    => "Added new medicine: {$medicine->name}",
                'icon'      => 'pill',
                'date'      => $createdAt->format('Y-m-d'),
                'time'      => $createdAt->format('H:i'),
                'timestamp' => $createdAt->timestamp,
            ];
        }

        // Recent stock movements
        foreach (StockMovement::with('medicine')->latest()->take($limit)->get() as $movement) {
            $createdAt = $movement->created_at ?? now();
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
    private function adminDashboard()
    {
        $totalProducts   = Medicine::count();
        $totalStock      = Medicine::sum('quantity');
        $totalSuppliers  = Supplier::count();

        $lowStockMedicines    = $this->lowStockMedicines();
        $lowStockCount        = $lowStockMedicines->count();

        $expiredMedicines     = $this->expiredMedicines();
        $expiredCount         = $expiredMedicines->count();

        $expiringMedicines    = $this->expiringMedicines(90);
        $expiringCount        = $expiringMedicines->count();

        $todaySalesCount      = Sale::whereDate('sale_date', today())->count();
        $todayRevenue         = Sale::whereDate('sale_date', today())->sum('total_amount');

        $totalRevenue         = Sale::sum('total_amount');

        $totalPurchases       = PurchaseOrder::sum('total_amount');

        $totalUsers           = User::count();
        $pharmacistCount      = User::where('role', 'pharmacist')->count();
        $cashierCount         = User::where('role', 'cashier')->count();
        $pendingUsersCount    = User::where('status', User::STATUS_PENDING)->count();

        // ── Chart data: sales & revenue for last 7 days ────────────────
        $salesChartData = Sale::select(
            DB::raw('DATE(sale_date) as date'),
            DB::raw('COUNT(*) as count'),
            DB::raw('SUM(total_amount) as revenue')
        )
            ->where('sale_date', '>=', today()->subDays(6))
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->keyBy('date');

        $salesChartLabels = [];
        $salesChartCounts = [];
        $salesChartRevenue = [];
        for ($i = 6; $i >= 0; $i--) {
            $day = today()->subDays($i)->toDateString();
            $salesChartLabels[] = today()->subDays($i)->format('D M j');
            $salesChartCounts[]  = $salesChartData->has($day) ? (int) $salesChartData[$day]->count : 0;
            $salesChartRevenue[] = $salesChartData->has($day) ? (float) $salesChartData[$day]->revenue : 0;
        }

        // ── Chart data: inventory status by category ───────────────────
        $inventoryChartData = Medicine::leftJoin('categories', 'medicines.category_id', '=', 'categories.id')
            ->select(
                DB::raw('COALESCE(categories.name, "Uncategorized") as category'),
                DB::raw('COUNT(medicines.id) as medicine_count'),
                DB::raw('SUM(medicines.quantity) as total_stock')
            )
            ->groupBy(DB::raw('COALESCE(categories.name, "Uncategorized")'))
            ->orderBy('total_stock', 'desc')
            ->get();

        // ── Recent activities ──────────────────────────────────────────
        $recentSales = Sale::latest('sale_date')
            ->take(5)->get();

        $recentPurchases = PurchaseOrder::with('supplier')
            ->latest('order_date')
            ->take(5)->get();

        $recentStockMovements = StockMovement::with('medicine')
            ->latest()
            ->take(5)->get();

        $recentActivities = [];

        foreach ($recentSales as $sale) {
            $recentActivities[] = [
                'type'      => 'sale',
                'title'     => 'New Sale #' . $sale->id,
                'subtitle'  => '$' . number_format($sale->total_amount, 2) . ' on ' . $sale->sale_date,
                'time'      => $sale->created_at->diffForHumans(),
                'icon'      => '💰',
                'color'     => 'green',
            ];
        }

        foreach ($recentPurchases as $po) {
            $recentActivities[] = [
                'type'      => 'purchase',
                'title'     => 'Purchase Order #' . $po->id,
                'subtitle'  => 'From ' . ($po->supplier->name ?? 'Unknown Supplier'),
                'time'      => $po->created_at->diffForHumans(),
                'icon'      => '📦',
                'color'     => 'blue',
            ];
        }

        foreach ($recentStockMovements as $sm) {
            $recentActivities[] = [
                'type'      => 'stock',
                'title'     => 'Stock ' . ($sm->type === 'in' ? 'In' : 'Out') . ' - ' . ($sm->medicine->name ?? 'Unknown'),
                'subtitle'  => $sm->quantity . ' units',
                'time'      => $sm->created_at->diffForHumans(),
                'icon'      => $sm->type === 'in' ? '📥' : '📤',
                'color'     => $sm->type === 'in' ? 'blue' : 'orange',
            ];
        }

        usort($recentActivities, function ($a, $b) {
            return strcmp($b['time'], $a['time']);
        });
        $recentActivities = array_slice($recentActivities, 0, 8);

        return response()->json([
            'totalProducts'      => $totalProducts,
            'totalStock'         => $totalStock,
            'totalSuppliers'     => $totalSuppliers,
            'lowStockMedicines'  => $lowStockMedicines,
            'lowStockCount'      => $lowStockCount,
            'expiringMedicines'  => $expiringMedicines,
            'expiringCount'      => $expiringCount,
            'expiredMedicines'   => $expiredMedicines,
            'expiredCount'       => $expiredCount,
            'todaySalesCount'    => $todaySalesCount,
            'todayRevenue'       => $todayRevenue,
            'totalRevenue'       => $totalRevenue,
            'totalPurchases'     => $totalPurchases,
            'pendingUsersCount'  => $pendingUsersCount,
            'totalUsers'         => $totalUsers,
            'pharmacistCount'    => $pharmacistCount,
            'cashierCount'       => $cashierCount,
            'salesChartData'     => [
                'labels'   => $salesChartLabels,
                'counts'   => $salesChartCounts,
                'revenue'  => $salesChartRevenue,
            ],
            'inventoryChartData' => $inventoryChartData,
            'recentActivities'   => $recentActivities,
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | Pharmacist dashboard – inventory & expiry focus
    |--------------------------------------------------------------------------
    */
    private function pharmacistDashboard()
    {
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
        $activities           = $this->recentActivities(8);

        return response()->json([
            'totalMedicines'         => $totalMedicines,
            'totalStock'             => $totalStock,
            'lowStockCount'          => $lowStockCount,
            'expiredCount'           => $expiredCount,
            'expiring30Count'        => $expiring30->count(),
            'expiring60Count'        => $expiring60->count(),
            'expiring90Count'        => $expiring90->count(),
            'lowStockMedicines'      => $lowStockMedicines,
            'expiredMedicines'       => $expiredMedicines,
            'expiringSoon'           => [
                '30_days' => $expiring30,
                '60_days' => $expiring60,
                '90_days' => $expiring90,
            ],
            'salesAnalytics'         => $salesAnalytics,
            'inventoryStatus'        => $inventoryStatus,
            'recentActivities'       => $activities,
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
    private function cashierDashboard()
    {
        $todaySalesCount      = Sale::whereDate('sale_date', today())->count();
        $todayRevenue         = Sale::whereDate('sale_date', today())->sum('total_amount');
        $totalMedicines       = Medicine::count();

        $recentSales          = Sale::latest()
            ->take(10)
            ->get();

        $todayHourly = [];
        for ($h = 0; $h < 24; $h++) {
            $todayHourly[] = [
                'label' => sprintf('%02d:00', $h),
                'total' => (float) Sale::whereDate('sale_date', today())
                    ->whereTime('sale_date', '>=', sprintf('%02d:00:00', $h))
                    ->whereTime('sale_date', '<', sprintf('%02d:00:00', $h + 1))
                    ->sum('total_amount'),
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
    }
}
