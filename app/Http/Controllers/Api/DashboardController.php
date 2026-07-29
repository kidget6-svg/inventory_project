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
