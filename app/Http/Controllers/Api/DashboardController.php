
<?php



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

class DashboardController extends Controller
{
    /**
     * Main dashboard endpoint.
     */
    public function index(): JsonResponse
    {
        $user = Auth::user();

        if (!$user) {
            return response()->json([
                'message' => 'Unauthenticated.',
            ], 401);
        }

        if ($user->isAdmin()) {
            return $this->adminDashboard();
        }

        if ($user->isPharmacist()) {
            return $this->pharmacistDashboard();
        }

        if ($user->isPurchasingStaff()) {
            return $this->purchasingStaffDashboard();
        }

        return $this->cashierDashboard();
    }

    /**
     * Get medicines that are at or below the reorder level.
     */
    private function lowStockMedicines()
    {
        $medicineIds = Batch::query()
            ->select('medicine_id')
            ->groupBy('medicine_id')
            ->havingRaw(
                'SUM(quantity) <= ?',
                [Medicine::DEFAULT_REORDER_LEVEL]
            )
            ->pluck('medicine_id');

        return Medicine::query()
            ->whereIn('id', $medicineIds)
            ->with(['category', 'batches'])
            ->get()
            ->each(function ($medicine) {
                $medicine->quantity = $medicine->batches->sum('quantity');
                $medicine->reorder_level = Medicine::DEFAULT_REORDER_LEVEL;
            });
    }

    /**
     * Get medicines with at least one expired batch
     * that still has stock.
     */
    private function expiredMedicines()
    {
        $medicineIds = Batch::query()
            ->whereDate('expiry_date', '<', Carbon::today())
            ->where('quantity', '>', 0)
            ->distinct()
            ->pluck('medicine_id');

        return Medicine::query()
            ->whereIn('id', $medicineIds)
            ->with('category')
            ->get();
    }

    /**
     * Get medicines expiring within the specified number of days.
     */
    private function expiringMedicines(int $days)
    {
        $today = Carbon::today();
        $endDate = Carbon::today()->addDays($days);

        $medicineIds = Batch::query()
            ->whereBetween('expiry_date', [$today, $endDate])
            ->where('quantity', '>', 0)
            ->distinct()
            ->pluck('medicine_id');

        return Medicine::query()
            ->whereIn('id', $medicineIds)
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
            'inStock' => $inStockCount,
            'lowStock' => $lowStockCount,
            'outOfStock' => $outOfStockCount,
            'expired' => $expiredCount,
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
                'date' => $date->format('Y-m-d'),
                'total' => (float) Sale::whereDate(
                    'sale_date',
                    $date
                )->sum('total_amount'),
                'count' => Sale::whereDate(
                    'sale_date',
                    $date
                )->count(),
            ];
        }

        // Last 4 weeks
        $weekly = [];

        for ($i = 3; $i >= 0; $i--) {
            $start = Carbon::today()
                ->subWeeks($i)
                ->startOfWeek();

            $end = Carbon::today()
                ->subWeeks($i)
                ->endOfWeek();

            $weekly[] = [
                'label' => $start->format('M d')
                    . ' - '
                    . $end->format('M d'),

                'total' => (float) Sale::whereBetween(
                    'sale_date',
                    [$start, $end]
                )->sum('total_amount'),

                'count' => Sale::whereBetween(
                    'sale_date',
                    [$start, $end]
                )->count(),
            ];
        }

        // Last 6 months
        $monthly = [];

        for ($i = 5; $i >= 0; $i--) {
            $month = Carbon::today()->subMonths($i);

            $monthly[] = [
                'label' => $month->format('M Y'),

                'total' => (float) Sale::whereYear(
                    'sale_date',
                    $month->year
                )
                    ->whereMonth('sale_date', $month->month)
                    ->sum('total_amount'),

                'count' => Sale::whereYear(
                    'sale_date',
                    $month->year
                )
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
            'totalPurchases' => (float) PurchaseOrder::where(
                'status',
                'completed'
            )->sum('total_amount'),

            'totalSales' => (float) Sale::sum('total_amount'),

            'purchaseCount' => PurchaseOrder::where(
                'status',
                'completed'
            )->count(),

            'salesCount' => Sale::count(),
        ];
    }

    /**
     * Purchase order statistics.
     */
    private function purchaseOrderStats(): array
    {
        $statuses = PurchaseOrder::statuses();
        $stats = [];

        foreach ($statuses as $status) {
            $stats[$status] = PurchaseOrder::where(
                'status',
                $status
            )->count();
        }

        return $stats;
    }

    /**
     * Get recent system activities.
     */
    private function recentActivities(int $limit = 4): array
    {
        $activities = [];

        // Recent sales
        foreach (Sale::latest()->take($limit)->get() as $sale) {
            $createdAt = $sale->created_at ?? Carbon::now();

            $activities[] = [
                'id' => 'sale_' . $sale->id,
                'user' => 'System',
                'action' => "Completed Sale #{$sale->id}",
                'icon' => 'shopping-cart',
                'date' => $createdAt->format('Y-m-d'),
                'time' => $createdAt->format('H:i'),
                'timestamp' => $createdAt->timestamp,
            ];
        }

        // Recent purchase orders
        foreach (
            PurchaseOrder::with('supplier')
                ->latest()
                ->take($limit)
                ->get()
            as $po
        ) {
            $activityAt =
                $po->completed_at ??
                $po->delivered_at ??
                $po->sent_at ??
                $po->updated_at ??
                $po->created_at ??
                Carbon::now();

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
                'id' => 'po_' . $po->id,
                'user' => 'System',
                'action' => $action,
                'icon' => 'package',
                'date' => $activityAt->format('Y-m-d'),
                'time' => $activityAt->format('H:i'),
                'timestamp' => $activityAt->timestamp,
            ];
        }

        // Recent stock movements
        foreach (
            StockMovement::with('medicine')
                ->latest()
                ->take($limit)
                ->get()
            as $movement
        ) {
            $createdAt = $movement->created_at ?? Carbon::now();

            $medicineName = $movement->medicine?->name
                ?? 'Unknown medicine';

            $action = $movement->type === 'in'
                ? "Stock increased for {$medicineName} ({$movement->quantity})"
                : "Stock decreased for {$medicineName} ({$movement->quantity})";

            $activities[] = [
                'id' => 'sm_' . $movement->id,
                'user' => 'System',
                'action' => $action,
                'icon' => 'activity',
                'date' => $createdAt->format('Y-m-d'),
                'time' => $createdAt->format('H:i'),
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
        $totalMedicines = Medicine::count();
        $totalStock = Batch::sum('quantity');
        $totalSuppliers = Supplier::count();
        $totalUsers = User::count();

        $lowStockMedicines = $this->lowStockMedicines();
        $expiredMedicines = $this->expiredMedicines();

        $expiring30 = $this->expiringMedicines(30);
        $expiring60 = $this->expiringMedicines(60);
        $expiring90 = $this->expiringMedicines(90);

        $pendingPOs = PurchaseOrder::where(
            'status',
            'pending'
        )->count();

        $todaySalesCount = Sale::whereDate(
            'sale_date',
            Carbon::today()
        )->count();

        $todayRevenue = (float) Sale::whereDate(
            'sale_date',
            Carbon::today()
        )->sum('total_amount');

        $salesAnalytics = $this->salesAnalytics();
        $purchaseVsSales = $this->purchaseVsSales();
        $inventoryStatus = $this->inventoryStatus();
        $poStats = $this->purchaseOrderStats();
        $activities = $this->recentActivities(4);

        $recentPurchaseOrders = PurchaseOrder::with('supplier')
            ->latest()
            ->take(5)
            ->get();

        $salesChartData = [
            'labels' => array_column(
                $salesAnalytics['daily'],
                'label'
            ),
            'counts' => array_column(
                $salesAnalytics['daily'],
                'count'
            ),
            'revenue' => array_column(
                $salesAnalytics['daily'],
                'total'
            ),
        ];

        $inventoryChartData = Category::with('medicines.batches')
            ->get()
            ->map(function ($category) {
                $totalStock = $category->medicines->sum(
                    fn ($medicine) =>
                        $medicine->batches->sum('quantity')
                );

                return [
                    'category' => $category->name,
                    'total_stock' => (int) $totalStock,
                    'medicine_count' => $category->medicines->count(),
                ];
            })
            ->values();

        return response()->json([
            // Summary
            'totalMedicines' => $totalMedicines,
            'totalStock' => $totalStock,
            'lowStockCount' => $lowStockMedicines->count(),
            'expiredCount' => $expiredMedicines->count(),
            'pendingPurchaseOrders' => $pendingPOs,
            'todaySalesCount' => $todaySalesCount,
            'todayRevenue' => $todayRevenue,

            'totalUsers' => $totalUsers,
            'totalRevenue' => (float) Sale::sum('total_amount'),

            'pharmacistCount' => User::where(
                'role',
                'pharmacist'
            )->count(),

            'cashierCount' => User::where(
                'role',
                'cashier'
            )->count(),

            'purchasingStaffCount' => User::where(
                'role',
                'purchasing_staff'
            )->count(),

            'pendingUsersCount' => User::where(
                'status',
                'pending'
            )->count(),

            // Lists
            'lowStockMedicines' => $lowStockMedicines,
            'expiredMedicines' => $expiredMedicines,

            'expiringSoon' => [
                '30_days' => $expiring30,
                '60_days' => $expiring60,
                '90_days' => $expiring90,
            ],

            'expiring30Count' => $expiring30->count(),
            'expiring60Count' => $expiring60->count(),
            'expiring90Count' => $expiring90->count(),

            // Charts
            'salesAnalytics' => $salesAnalytics,
            'salesChartData' => $salesChartData,
            'inventoryChartData' => $inventoryChartData,
            'purchaseVsSales' => $purchaseVsSales,
            'inventoryStatus' => $inventoryStatus,

            // Purchase orders
            'purchaseOrderStats' => $poStats,

            // Recent data
            'recentActivities' => $activities,
            'recentPurchaseOrders' => $recentPurchaseOrders,

            // Backward compatibility
            'totalProducts' => $totalMedicines,
            'totalSuppliers' => $totalSuppliers,
            'expiringCount' => $expiring90->count(),
            'expiringMedicines' => $expiring90,
        ]);
    }

    /**
     * Pharmacist dashboard.
     */
    private function pharmacistDashboard(): JsonResponse
    {
        $totalMedicines = Medicine::count();
        $totalStock = Batch::sum('quantity');

        $lowStockMedicines = $this->lowStockMedicines();
        $expiredMedicines = $this->expiredMedicines();

        $expiring30 = $this->expiringMedicines(30);
        $expiring60 = $this->expiringMedicines(60);
        $expiring90 = $this->expiringMedicines(90);

        return response()->json([
            'totalMedicines' => $totalMedicines,
            'totalStock' => $totalStock,

            'lowStockCount' => $lowStockMedicines->count(),
            'expiredCount' => $expiredMedicines->count(),

            'expiring30Count' => $expiring30->count(),
            'expiring60Count' => $expiring60->count(),
            'expiring90Count' => $expiring90->count(),

            'lowStockMedicines' => $lowStockMedicines,
            'expiredMedicines' => $expiredMedicines,

            'expiringSoon' => [
                '30_days' => $expiring30,
                '60_days' => $expiring60,
                '90_days' => $expiring90,
            ],

            'salesAnalytics' => $this->salesAnalytics(),
            'inventoryStatus' => $this->inventoryStatus(),
            'recentActivities' => $this->recentActivities(4),

            'totalProducts' => $totalMedicines,
            'expiringCount' => $expiring90->count(),
            'expiringMedicines' => $expiring90,
        ]);
    }

    /**
     * Cashier dashboard.
     */
    private function cashierDashboard(): JsonResponse
    {
        $today = Carbon::today();

        $todaySalesCount = Sale::whereDate(
            'sale_date',
            $today
        )->count();

        $todayRevenue = (float) Sale::whereDate(
            'sale_date',
            $today
        )->sum('total_amount');

        $totalMedicines = Medicine::count();

        $recentSales = Sale::latest()
            ->take(10)
            ->get();

        $todayHourly = [];

        for ($h = 0; $h < 24; $h++) {
            $start = sprintf('%02d:00:00', $h);
            $end = sprintf('%02d:00:00', $h + 1);

            $query = Sale::whereDate(
                'sale_date',
                $today
            )->whereTime(
                'sale_date',
                '>=',
                $start
            );

            if ($h < 23) {
                $query->whereTime(
                    'sale_date',
                    '<',
                    $end
                );
            }

            $todayHourly[] = [
                'label' => sprintf('%02d:00', $h),
                'total' => (float) $query->sum('total_amount'),
            ];
        }

        return response()->json([
            'todaySalesCount' => $todaySalesCount,
            'todayRevenue' => $todayRevenue,
            'totalMedicines' => $totalMedicines,

            'recentSales' => $recentSales,
            'todayHourlySales' => $todayHourly,

            'totalProducts' => $totalMedicines,
        ]);
    }

    /**
     * Purchasing staff dashboard.
     */
    private function purchasingStaffDashboard(): JsonResponse
    {
        $today = Carbon::today();
        $thirtyDaysAgo = Carbon::today()->subDays(30);

        $totalSuppliers = Supplier::count();
        $totalPurchaseOrders = PurchaseOrder::count();

        $poStats = $this->purchaseOrderStats();

        $pendingPOs = PurchaseOrder::where(
            'status',
            'pending'
        )->count();

        $pendingReceiving = PurchaseOrder::whereIn(
            'status',
            ['sent', 'delivered']
        )->count();

        $completedThisMonth = PurchaseOrder::where(
            'status',
            'completed'
        )
            ->whereMonth('created_at', $today->month)
            ->whereYear('created_at', $today->year)
            ->count();

        $totalSpendThisMonth = (float) PurchaseOrder::where(
            'status',
            'completed'
        )
            ->whereMonth('created_at', $today->month)
            ->whereYear('created_at', $today->year)
            ->sum('total_amount');

        $recentPurchaseOrders = PurchaseOrder::with('supplier')
            ->where('created_at', '>=', $thirtyDaysAgo)
            ->latest()
            ->take(10)
            ->get();

        $activities = $this->recentActivities(5);

        $expiringMeds = $this->expiringMedicines(30);

        return response()->json([
            'totalSuppliers' => $totalSuppliers,
            'totalPurchaseOrders' => $totalPurchaseOrders,
            'pendingPurchaseOrders' => $pendingPOs,
            'pendingReceiving' => $pendingReceiving,
            'completedThisMonth' => $completedThisMonth,
            'totalSpendThisMonth' => $totalSpendThisMonth,
            'expiringMedicineCount' => $expiringMeds->count(),

            'recentPurchaseOrders' => $recentPurchaseOrders,
            'recentActivities' => $activities,
            'purchaseOrderStats' => $poStats,

            'expiringSoon' => $expiringMeds,

            'totalProducts' => Medicine::count(),
        ]);
    }
}
