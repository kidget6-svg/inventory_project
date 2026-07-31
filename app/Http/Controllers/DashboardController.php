<?php

namespace App\Http\Controllers;

use App\Models\Medicine;
use App\Models\Sale;
use App\Models\Supplier;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    public function index(): JsonResponse
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

    private function adminDashboard(): JsonResponse
    {
        $totalProducts = Medicine::count();
        $totalStock = Medicine::sum('quantity');
        $totalSuppliers = Supplier::count();

        $lowStockMedicines = Medicine::whereColumn('quantity', '<=', 'reorder_level')
            ->orderBy('quantity')
            ->get();

        $expiringMedicines = Medicine::whereNotNull('expiry_date')
            ->whereBetween('expiry_date', [today(), today()->addDays(90)])
            ->orderBy('expiry_date')
            ->get();

        $todaySalesCount = Sale::whereDate('sale_date', today())->count();
        $todayRevenue = Sale::whereDate('sale_date', today())->sum('total_amount');

        return response()->json([
            'role' => 'admin',
            'totalProducts' => $totalProducts,
            'totalStock' => $totalStock,
            'totalSuppliers' => $totalSuppliers,
            'lowStockMedicines' => $lowStockMedicines,
            'lowStockCount' => $lowStockMedicines->count(),
            'expiringMedicines' => $expiringMedicines,
            'expiringCount' => $expiringMedicines->count(),
            'todaySalesCount' => $todaySalesCount,
            'todayRevenue' => $todayRevenue,
        ]);
    }

    private function pharmacistDashboard(): JsonResponse
    {
        $totalProducts = Medicine::count();
        $totalStock = Medicine::sum('quantity');

        $lowStockMedicines = Medicine::whereColumn('quantity', '<=', 'reorder_level')
            ->orderBy('quantity')
            ->get();

        $expiringMedicines = Medicine::whereNotNull('expiry_date')
            ->whereBetween('expiry_date', [today(), today()->addDays(90)])
            ->orderBy('expiry_date')
            ->get();

        return response()->json([
            'role' => 'pharmacist',
            'totalProducts' => $totalProducts,
            'totalStock' => $totalStock,
            'lowStockMedicines' => $lowStockMedicines,
            'lowStockCount' => $lowStockMedicines->count(),
            'expiringMedicines' => $expiringMedicines,
            'expiringCount' => $expiringMedicines->count(),
        ]);
    }

    private function cashierDashboard(): JsonResponse
    {
        $todaySalesCount = Sale::whereDate('sale_date', today())->count();
        $todayRevenue = Sale::whereDate('sale_date', today())->sum('total_amount');
        $totalProducts = Medicine::count();

        $recentSales = Sale::latest()
            ->take(5)
            ->get();

        return response()->json([
            'role' => 'cashier',
            'todaySalesCount' => $todaySalesCount,
            'todayRevenue' => $todayRevenue,
            'totalProducts' => $totalProducts,
            'recentSales' => $recentSales,
        ]);
    }
}
