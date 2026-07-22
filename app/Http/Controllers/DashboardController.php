<?php

namespace App\Http\Controllers;

use App\Models\Medicine;

class DashboardController extends Controller
{
    public function index()
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

        return view('dashboard', compact(
            'totalProducts',
            'totalStock',
            'lowStockMedicines',
            'expiringMedicines'
        ));
    }
}