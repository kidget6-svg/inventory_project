<?php
// app/Http/Controllers/Api/DashboardController.php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Medicine;
use App\Models\Category;
use App\Models\Supplier;
use App\Models\Sale;
use App\Models\StockMovement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        try {
            $user = $request->user();
            $role = $user->role;

            // Common data for all roles
            $data = [
                'totalMedicines' => Medicine::count(),
                'totalCategories' => Category::count(),
                'totalSuppliers' => Supplier::count(),
            ];

            // Role-specific data
            if ($role === 'admin') {
                $data = array_merge($data, [
                    'totalUsers' => User::count(),
                    'pendingUsers' => User::where('status', 'pending')->count(),
                    'totalSales' => Sale::count(),
                    'todaySales' => Sale::whereDate('created_at', today())->count(),
                    'todayRevenue' => Sale::whereDate('created_at', today())->sum('total_amount'),
                    'lowStockCount' => Medicine::whereColumn('quantity', '<=', 'reorder_level')->count(),
                    'recentSales' => Sale::with('user')->latest()->limit(5)->get(),
                    'recentUsers' => User::latest()->limit(5)->get(),
                ]);
            }

            if ($role === 'pharmacist' || $role === 'admin') {
                $data = array_merge($data, [
                    'totalStock' => Medicine::sum('quantity'),
                    'lowStockMedicines' => Medicine::with('category')
                        ->whereColumn('quantity', '<=', 'reorder_level')
                        ->limit(5)
                        ->get(),
                    'expiringSoon' => Medicine::with('category')
                        ->whereDate('expiry_date', '<=', now()->addDays(30))
                        ->whereDate('expiry_date', '>=', now())
                        ->limit(5)
                        ->get(),
                    'recentMovements' => StockMovement::with(['medicine', 'user'])
                        ->latest()
                        ->limit(10)
                        ->get(),
                ]);
            }

            if ($role === 'cashier' || $role === 'admin') {
                $data = array_merge($data, [
                    'todaySalesCount' => Sale::whereDate('created_at', today())->count(),
                    'todayRevenue' => Sale::whereDate('created_at', today())->sum('total_amount'),
                    'recentSales' => Sale::with('user')->latest()->limit(5)->get(),
                ]);
            }

            return response()->json($data);
        } catch (\Exception $e) {
            Log::error('Dashboard error: ' . $e->getMessage());
            Log::error($e->getTraceAsString());
            
            return response()->json([
                'message' => 'Failed to load dashboard data',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Additional methods for specific dashboard data
    public function stats()
    {
        try {
            $stats = [
                'total_medicines' => Medicine::count(),
                'total_categories' => Category::count(),
                'total_suppliers' => Supplier::count(),
                'total_users' => User::count(),
                'total_sales' => Sale::count(),
                'today_sales' => Sale::whereDate('created_at', today())->count(),
                'pending_users' => User::where('status', 'pending')->count(),
                'low_stock' => Medicine::whereColumn('quantity', '<=', 'reorder_level')->count(),
                'expiring_soon' => Medicine::whereDate('expiry_date', '<=', now()->addDays(30))
                    ->whereDate('expiry_date', '>=', now())
                    ->count(),
            ];

            return response()->json($stats);
        } catch (\Exception $e) {
            Log::error('Dashboard stats error: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}