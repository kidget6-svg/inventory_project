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
<<<<<<< Updated upstream
=======

>>>>>>> Stashed changes

        if ($user->isAdmin()) {
            return $this->adminDashboard();
        }
        if ($user->isPharmacist()) {
            return $this->pharmacistDashboard();
        }
        return $this->cashierDashboard();
    }

    private function adminDashboard()
    {
        // ── Summary stats ──────────────────────────────────────────────
        $totalProducts   = Medicine::count();
        $totalStock      = Medicine::sum('quantity');
        $totalSuppliers  = Supplier::count();

        $lowStockMedicines = Medicine::whereColumn('quantity', '<=', 'reorder_level')
            ->orderBy('quantity')->get();
        $lowStockCount = $lowStockMedicines->count();

        // Expired medicines (past expiry date)
        $expiredMedicines = Medicine::whereNotNull('expiry_date')
            ->where('expiry_date', '<', today())
            ->orderBy('expiry_date')
            ->get();
        $expiredCount = $expiredMedicines->count();

        // Expiring within 90 days (for notifications)
        $expiringMedicines = Medicine::whereNotNull('expiry_date')
            ->whereBetween('expiry_date', [today(), today()->addDays(90)])
            ->orderBy('expiry_date')->get();
        $expiringCount = $expiringMedicines->count();

        $todaySalesCount = Sale::whereDate('sale_date', today())->count();
        $todayRevenue    = Sale::whereDate('sale_date', today())->sum('total_amount');

        // All-time revenue
        $totalRevenue = Sale::sum('total_amount');

        // All-time purchases
        $totalPurchases = PurchaseOrder::sum('total_amount');

        // User counts
        $totalUsers       = User::count();
        $pharmacistCount  = User::where('role', 'pharmacist')->count();
        $cashierCount     = User::where('role', 'cashier')->count();
        $pendingUsersCount = User::where('status', User::STATUS_PENDING)->count();

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

        // Build a complete 7-day dataset (fill missing days with zeros)
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
        // Use LEFT JOIN so medicines without a category are still included.
        // Wrap in try-catch in case the category_id column doesn't exist yet.
        try {
            $inventoryChartData = Medicine::leftJoin('categories', 'medicines.category_id', '=', 'categories.id')
                ->select(
                    DB::raw('COALESCE(categories.name, "Uncategorized") as category'),
                    DB::raw('COUNT(medicines.id) as medicine_count'),
                    DB::raw('SUM(medicines.quantity) as total_stock')
                )
                ->groupBy(DB::raw('COALESCE(categories.name, "Uncategorized")'))
                ->orderBy('total_stock', 'desc')
                ->get();
        } catch (\Exception $e) {
            // category_id column may not exist — fall back to grouping by name
            $inventoryChartData = Medicine::select(
                DB::raw('name as category'),
                DB::raw('COUNT(*) as medicine_count'),
                DB::raw('SUM(quantity) as total_stock')
            )
                ->groupBy('name')
                ->orderBy('total_stock', 'desc')
                ->get();
        }

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

<<<<<<< Updated upstream
        // Sort by time (most recent first) — diffForHumans doesn't sort well, so use created_at
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
=======
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
        $totalMedicines       = Medicine::count();
        $totalStock           = Medicine::sum('quantity');
        $totalSuppliers       = Supplier::count();
        $totalUsers           = User::count();
        $pendingUsers         = User::where('status', User::STATUS_PENDING)->count();

        $lowStockMedicines    = $this->lowStockMedicines();
        $lowStockCount        = $lowStockMedicines->count();

        $expiredMedicines     = $this->expiredMedicines();
        $expiredCount         = $expiredMedicines->count();

        $expiring30           = $this->expiringMedicines(30);
        $expiring60           = $this->expiringMedicines(60);
        $expiring90           = $this->expiringMedicines(90);

        $pendingPOs           = PurchaseOrder::where('status', 'pending')->count();

        $todaySalesCount      = Sale::whereDate('sale_date', today())->count();
        $todayRevenue         = Sale::whereDate('sale_date', today())->sum('total_amount');

        $salesAnalytics       = $this->salesAnalytics();
        $purchaseVsSales      = $this->purchaseVsSales();
        $inventoryStatus      = $this->inventoryStatus();
        $poStats              = $this->purchaseOrderStats();
        $activities           = $this->recentActivities(10);

        $recentPurchaseOrders = PurchaseOrder::with('supplier')
            ->latest()->take(5)->get();

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
            'pendingUsers'           => $pendingUsers,

            // ---- Lists ----
            'lowStockMedicines'      => $lowStockMedicines,
            'expiredMedicines'       => $expiredMedicines,
            'expiringSoon'           => [
                '30_days' => $expiring30,
                '60_days' => $expiring60,
                '90_days' => $expiring90,
>>>>>>> Stashed changes
            ],
            'inventoryChartData' => $inventoryChartData,
            'recentActivities'   => $recentActivities,
        ]);
    }

    private function pharmacistDashboard()
    {
        $totalProducts = Medicine::count();
        $totalStock = Medicine::sum('quantity');

        $lowStockMedicines = Medicine::whereColumn('quantity', '<=', 'reorder_level')
            ->orderBy('quantity')->get();
        $lowStockCount = $lowStockMedicines->count();

        $expiringMedicines = Medicine::whereNotNull('expiry_date')
            ->whereBetween('expiry_date', [today(), today()->addDays(90)])
            ->orderBy('expiry_date')->get();
        $expiringCount = $expiringMedicines->count();

        return response()->json([
            'totalProducts' => $totalProducts,
            'totalStock' => $totalStock,
            'lowStockMedicines' => $lowStockMedicines,
            'lowStockCount' => $lowStockCount,
            'expiringMedicines' => $expiringMedicines,
            'expiringCount' => $expiringCount,
        ]);
    }

    private function cashierDashboard()
    {
        $todaySalesCount = Sale::whereDate('sale_date', today())->count();
        $todayRevenue = Sale::whereDate('sale_date', today())->sum('total_amount');
        $totalProducts = Medicine::count();
        $recentSales = Sale::latest()->take(5)->get();

        return response()->json([
            'todaySalesCount' => $todaySalesCount,
            'todayRevenue' => $todayRevenue,
            'totalProducts' => $totalProducts,
            'recentSales' => $recentSales,
        ]);
    }
}
