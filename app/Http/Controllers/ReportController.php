<?php

namespace App\Http\Controllers;

use App\Models\Medicine;
use App\Models\Sale;
use App\Models\PurchaseOrder;

class ReportController extends Controller
{
    public function index()
    {
        // Inventory
        $medicines = Medicine::orderBy('name')->get();

        // Sales
        $sales = Sale::orderBy('sale_date', 'desc')->get();

        // Purchase Orders
        $purchases = PurchaseOrder::with('supplier')
            ->orderBy('created_at', 'desc')
            ->get();

        // Low Stock
        $lowStock = Medicine::whereColumn(
            'quantity',
            '<=',
            'reorder_level'
        )->orderBy('quantity')->get();

        // Expiring Medicines
        $expiring = Medicine::whereNotNull('expiry_date')
            ->whereBetween(
                'expiry_date',
                [today(), today()->addDays(90)]
            )
            ->orderBy('expiry_date')
            ->get();

        return view('reports.index', compact(
            'medicines',
            'sales',
            'purchases',
            'lowStock',
            'expiring'
        ));
    }
}