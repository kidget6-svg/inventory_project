<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Product;
use App\Models\Batch;
use App\Models\Sale;
use App\Models\Supplier;
use App\Models\PurchaseOrder;
use App\Models\StockAdjustment;
use Illuminate\Support\Facades\DB;

class AdminDashboardController extends Controller
{
    public function index()
    {
        // Dashboard Statistics
        $totalProducts = Product::count();
        $totalStock = Batch::sum('quantity');
        
        // Low Stock Products
        $lowStockProducts = Product::with(['batches' => function($query) {
            $query->where('quantity', '>', 0);
        }])
        ->whereHas('batches', function($query) {
            $query->where('quantity', '<=', DB::raw('reorder_level'));
        })
        ->get();
        
        $lowStockCount = $lowStockProducts->count();
        
        // Expiring Soon (within 30, 60, 90 days)
        $expiring30Days = Batch::with('product')
            ->where('quantity', '>', 0)
            ->whereDate('expiry_date', '>=', now())
            ->whereDate('expiry_date', '<=', now()->addDays(30))
            ->count();
        
        $expiring60Days = Batch::with('product')
            ->where('quantity', '>', 0)
            ->whereDate('expiry_date', '>=', now()->addDays(31))
            ->whereDate('expiry_date', '<=', now()->addDays(60))
            ->count();
        
        $expiring90Days = Batch::with('product')
            ->where('quantity', '>', 0)
            ->whereDate('expiry_date', '>=', now()->addDays(61))
            ->whereDate('expiry_date', '<=', now()->addDays(90))
            ->count();
        
        $expiringCount = $expiring30Days + $expiring60Days + $expiring90Days;
        
        // Today's Sales
        $todaySales = Sale::whereDate('sale_date', today())->get();
        $todaySalesCount = $todaySales->count();
        $todayRevenue = $todaySales->sum('total_amount');
        
        // Monthly Sales
        $monthlySales = Sale::whereMonth('sale_date', now()->month)
            ->whereYear('sale_date', now()->year)
            ->sum('total_amount');
        
        // Top Selling Products
        $topProducts = DB::table('sale_items')
            ->join('products', 'sale_items.product_id', '=', 'products.id')
            ->select('products.generic_name', 'products.brand_name', DB::raw('SUM(sale_items.quantity) as total_sold'))
            ->groupBy('products.id', 'products.generic_name', 'products.brand_name')
            ->orderBy('total_sold', 'desc')
            ->limit(5)
            ->get();
        
        // Controlled Medicines
        $controlledMedicines = Product::where('is_controlled', true)->count();
        
        // Total Suppliers
        $totalSuppliers = Supplier::count();
        
        // Pending Orders
        $pendingOrders = PurchaseOrder::where('status', 'pending')->count();
        
        // Stock Value
        $stockValue = Batch::with('product')
            ->get()
            ->sum(function($batch) {
                return $batch->quantity * ($batch->unit_cost ?? 0);
            });
        
        // Recent Activities (if audit_logs table exists)
        $recentActivities = [];
        if (DB::table('audit_logs')->exists()) {
            $recentActivities = DB::table('audit_logs')
                ->join('users', 'audit_logs.user_id', '=', 'users.id')
                ->select('audit_logs.*', 'users.name as user_name')
                ->orderBy('audit_logs.logged_at', 'desc')
                ->limit(10)
                ->get();
        }
        
        // Pass all data to the view
        return view('admin.dashboard', compact(
            'totalProducts',
            'totalStock',
            'lowStockCount',
            'lowStockProducts',
            'expiringCount',
            'expiring30Days',
            'expiring60Days',
            'expiring90Days',
            'todaySalesCount',
            'todayRevenue',
            'monthlySales',
            'topProducts',
            'controlledMedicines',
            'totalSuppliers',
            'pendingOrders',
            'stockValue',
            'recentActivities'
        ));
    }
}