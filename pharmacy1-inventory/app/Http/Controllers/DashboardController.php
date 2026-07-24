<?php

namespace App\Http\Controllers;

use App\Models\Medicine;
use App\Models\Category;
use App\Models\Supplier;
use App\Models\Sale;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $stats = [
            'totalMedicines' => Medicine::count(),
            'totalCategories' => Category::count(),
            'totalSuppliers' => Supplier::count(),
            'lowStock' => Medicine::where('quantity', '<', 10)->count(),
        ];

        $recentSales = Sale::latest()
            ->take(5)
            ->with('customer')
            ->get();

        return Inertia::render('Dashboard', [
            'stats' => $stats,
            'recentSales' => $recentSales,
        ]);
    }
}
