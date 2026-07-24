<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Medicine;
use App\Models\Sale;
use App\Models\PurchaseOrder;

class ReportController extends Controller
{
    public function index()
    {
        $medicines = Medicine::orderBy('name')->get();
        $sales = Sale::orderBy('sale_date', 'desc')->get();
        $purchases = PurchaseOrder::with('supplier')->orderBy('created_at', 'desc')->get();

        $lowStock = Medicine::whereColumn('quantity', '<=', 'reorder_level')->get();
        $expiring = Medicine::whereNotNull('expiry_date')
            ->whereBetween('expiry_date', [today(), today()->addDays(90)])
            ->orderBy('expiry_date')
            ->get();

        return response()->json([
            'medicines' => $medicines,
            'sales' => $sales,
            'purchases' => $purchases,
            'lowStock' => $lowStock,
            'expiring' => $expiring,
        ]);
    }
}
