<?php

namespace App\Http\Controllers;

use App\Models\Batch;
use App\Models\Product;
use App\Models\Role;
use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\StockLedger;
use App\Models\Supplier;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        if ($user->isAdmin()) {
            return $this->adminDashboard($request);
        }

        if ($user->isPharmacist()) {
            return $this->pharmacistDashboard($request);
        }

        if ($user->isCashier()) {
            return $this->cashierDashboard($request);
        }

        return view('dashboard.default');
    }

    protected function adminDashboard(Request $request)
    {
        // === KPI Summary Cards ===
        $todayRevenue = Sale::whereDate('created_at', today())->sum('total_amount');
        $yesterdayRevenue = Sale::whereDate('created_at', today()->subDay())->sum('total_amount');
        $revenueChange = $yesterdayRevenue > 0
            ? round((($todayRevenue - $yesterdayRevenue) / $yesterdayRevenue) * 100, 1)
            : 0;

        $lowStockCount = Product::whereHas('batches', function ($q) {
            $q->where('quantity_remaining', '<=', DB::raw('products.minimum_stock_level'));
        })->count();

        $outOfStockCount = Product::whereHas('batches', function ($q) {
            $q->where('quantity_remaining', '<=', 0);
        })->count();

        $expiringSoonCount = Batch::where('expiry_date', '>=', now())
            ->where('expiry_date', '<=', now()->addDays(90))
            ->where('quantity_remaining', '>', 0)
            ->count();

        $activeStaffCount = User::where('is_active', true)
            ->whereIn('role_id', Role::whereIn('name', ['pharmacist', 'cashier'])->pluck('id'))
            ->count();

        // === Operational Alerts ===
        $criticalLowStock = Product::select('products.*')
            ->selectRaw('(SELECT COALESCE(SUM(b.quantity_remaining), 0) FROM batches b WHERE b.product_id = products.id) as total_stock')
            ->whereRaw('(SELECT COALESCE(SUM(b.quantity_remaining), 0) FROM batches b WHERE b.product_id = products.id) <= products.minimum_stock_level')
            ->orderBy('total_stock', 'asc')
            ->limit(10)
            ->get();

        $expiryWarnings = Batch::with('product')
            ->where('expiry_date', '>=', now())
            ->where('expiry_date', '<=', now()->addDays(90))
            ->where('quantity_remaining', '>', 0)
            ->orderBy('expiry_date', 'asc')
            ->limit(10)
            ->get();

        // === Sales & Financial Performance ===
        // Sales trend for last 7 days
        $salesTrend = Sale::select(
            DB::raw('DATE(created_at) as date'),
            DB::raw('SUM(total_amount) as total')
        )
            ->where('created_at', '>=', now()->subDays(7))
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        $trendDates = $salesTrend->pluck('date')->toArray();
        $trendAmounts = $salesTrend->pluck('total')->toArray();

        // Top-selling medicines
        $topSelling = \App\Models\SaleItem::select(
            'products.name_generic',
            'products.name_brand',
            DB::raw('SUM(sale_items.quantity) as total_quantity'),
            DB::raw('SUM(sale_items.total_price) as total_revenue')
        )
            ->join('products', 'sale_items.product_id', '=', 'products.id')
            ->join('sales', 'sale_items.sale_id', '=', 'sales.id')
            ->where('sales.created_at', '>=', now()->subDays(30))
            ->groupBy('products.id', 'products.name_generic', 'products.name_brand')
            ->orderBy('total_revenue', 'desc')
            ->limit(5)
            ->get();

        // Sales by cashier
        $salesByCashier = User::select(
            'users.name',
            DB::raw('COUNT(sales.id) as total_sales'),
            DB::raw('SUM(sales.total_amount) as total_revenue')
        )
            ->join('sales', 'users.id', '=', 'sales.user_id')
            ->where('sales.created_at', '>=', now()->subDays(30))
            ->whereIn('users.role_id', Role::where('name', 'cashier')->pluck('id'))
            ->groupBy('users.id', 'users.name')
            ->orderBy('total_revenue', 'desc')
            ->get();

        // === Recent Transactions & Audit Trail ===
        $recentSales = Sale::with('user')
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        $recentActivity = StockLedger::with(['user', 'product'])
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        // === Other data ===
        $totalUsers = User::count();
        $totalRoles = Role::count();
        $activeUsers = User::where('is_active', true)->count();
        $inactiveUsers = User::where('is_active', false)->count();

        $usersByRole = User::join('roles', 'users.role_id', '=', 'roles.id')
            ->selectRaw('roles.display_name, COUNT(*) as count')
            ->groupBy('roles.id', 'roles.display_name')
            ->get();

        return view('dashboard.admin', compact(
            'todayRevenue', 'revenueChange',
            'lowStockCount', 'outOfStockCount',
            'expiringSoonCount', 'activeStaffCount',
            'criticalLowStock', 'expiryWarnings',
            'trendDates', 'trendAmounts',
            'topSelling', 'salesByCashier',
            'recentSales', 'recentActivity',
            'totalUsers', 'totalRoles', 'activeUsers', 'inactiveUsers',
            'usersByRole'
        ));
    }

    protected function pharmacistDashboard(Request $request)
    {
        // === Inventory Alerts ===
        $lowStockCount = Product::whereHas('batches', function ($q) {
            $q->where('quantity_remaining', '<=', DB::raw('products.minimum_stock_level'));
        })->count();

        $expiringSoonCount = Batch::where('expiry_date', '>=', now())
            ->where('expiry_date', '<=', now()->addDays(30))
            ->where('quantity_remaining', '>', 0)
            ->count();

        $totalProducts = Product::where('is_active', true)->count();

        $lowStockProducts = Product::select('products.*')
            ->selectRaw('(SELECT COALESCE(SUM(b.quantity_remaining), 0) FROM batches b WHERE b.product_id = products.id) as total_stock')
            ->whereRaw('(SELECT COALESCE(SUM(b.quantity_remaining), 0) FROM batches b WHERE b.product_id = products.id) <= products.minimum_stock_level')
            ->orderBy('total_stock', 'asc')
            ->limit(10)
            ->get();

        $expiringBatches = Batch::with('product')
            ->where('expiry_date', '>=', now())
            ->where('expiry_date', '<=', now()->addDays(30))
            ->where('quantity_remaining', '>', 0)
            ->orderBy('expiry_date', 'asc')
            ->limit(10)
            ->get();

        // === Sales Summary ===
        $todaySalesCount = Sale::whereDate('created_at', today())->count();
        $todaySalesTotal = Sale::whereDate('created_at', today())->sum('total_amount');

        $yesterdaySalesTotal = Sale::whereDate('created_at', today()->subDay())->sum('total_amount');
        $salesChange = $yesterdaySalesTotal > 0
            ? round((($todaySalesTotal - $yesterdaySalesTotal) / $yesterdaySalesTotal) * 100, 1)
            : 0;

        // === Purchases / Stock Intake ===
        $stockIntakeToday = StockLedger::where('transaction_type', 'in')
            ->whereDate('created_at', today())
            ->sum('quantity_change');

        $totalStockValue = Batch::sum(DB::raw('cost_price * quantity_remaining'));

        // === Suppliers ===
        $totalSuppliers = Supplier::where('is_active', true)->count();

        $topSuppliers = Supplier::select(
            'suppliers.name',
            'suppliers.contact_person',
            'suppliers.phone',
            DB::raw('COUNT(b.id) as batches_received')
        )
            ->leftJoin('batches as b', 'suppliers.id', '=', 'b.supplier_id')
            ->groupBy('suppliers.id', 'suppliers.name', 'suppliers.contact_person', 'suppliers.phone')
            ->orderBy('batches_received', 'desc')
            ->limit(5)
            ->get();

        // === Customers ===
        $totalCustomers = Sale::whereNotNull('customer_name')
            ->where('customer_name', '!=', '')
            ->distinct('customer_name')
            ->count('customer_name');

        // === Sales Trend (last 7 days) ===
        $salesTrend = Sale::select(
            DB::raw('DATE(created_at) as date'),
            DB::raw('SUM(total_amount) as total')
        )
            ->where('created_at', '>=', now()->subDays(7))
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        $trendDates = $salesTrend->pluck('date')->toArray();
        $trendAmounts = $salesTrend->pluck('total')->toArray();

        // === Top-Selling Products (last 30 days) ===
        $topSellingProducts = SaleItem::select(
            'products.name_generic',
            'products.name_brand',
            DB::raw('SUM(sale_items.quantity) as total_quantity'),
            DB::raw('SUM(sale_items.total_price) as total_revenue')
        )
            ->join('products', 'sale_items.product_id', '=', 'products.id')
            ->join('sales', 'sale_items.sale_id', '=', 'sales.id')
            ->where('sales.created_at', '>=', now()->subDays(30))
            ->groupBy('products.id', 'products.name_generic', 'products.name_brand')
            ->orderBy('total_revenue', 'desc')
            ->limit(5)
            ->get();

        // === Recent Activity (stock ledger) ===
        $recentActivity = StockLedger::with(['user', 'product'])
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        return view('dashboard.pharmacist', compact(
            'lowStockCount', 'expiringSoonCount', 'totalProducts',
            'lowStockProducts', 'expiringBatches',
            'todaySalesCount', 'todaySalesTotal', 'salesChange',
            'stockIntakeToday', 'totalStockValue',
            'totalSuppliers', 'topSuppliers',
            'totalCustomers',
            'trendDates', 'trendAmounts',
            'topSellingProducts',
            'recentActivity'
        ));
    }

    protected function cashierDashboard(Request $request)
    {
        $todaySalesCount = Sale::whereDate('created_at', today())->count();
        $todaySalesTotal = Sale::whereDate('created_at', today())->sum('total_amount');

        $recentSales = Sale::with('user')
            ->whereDate('created_at', today())
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        return view('dashboard.cashier', compact(
            'todaySalesCount', 'todaySalesTotal', 'recentSales'
        ));
    }
}
