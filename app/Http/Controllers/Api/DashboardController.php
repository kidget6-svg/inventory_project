<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Medicine;
use App\Models\Sale;
use App\Models\Supplier;

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
        $totalProducts = Medicine::count();
        $totalStock = Medicine::sum('quantity');
        $totalSuppliers = Supplier::count();

        $lowStockMedicines = Medicine::whereColumn('quantity', '<=', 'reorder_level')
            ->orderBy('quantity')->get();
        $lowStockCount = $lowStockMedicines->count();

        $expiringMedicines = Medicine::whereNotNull('expiry_date')
            ->whereBetween('expiry_date', [today(), today()->addDays(90)])
            ->orderBy('expiry_date')->get();
        $expiringCount = $expiringMedicines->count();

        $todaySalesCount = Sale::whereDate('sale_date', today())->count();
        $todayRevenue = Sale::whereDate('sale_date', today())->sum('total_amount');

        return response()->json([
            'totalProducts' => $totalProducts,
            'totalStock' => $totalStock,
            'totalSuppliers' => $totalSuppliers,
            'lowStockMedicines' => $lowStockMedicines,
            'lowStockCount' => $lowStockCount,
            'expiringMedicines' => $expiringMedicines,
            'expiringCount' => $expiringCount,
            'todaySalesCount' => $todaySalesCount,
            'todayRevenue' => $todayRevenue,
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
