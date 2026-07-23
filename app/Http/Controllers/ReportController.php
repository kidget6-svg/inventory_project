<?php

namespace App\Http\Controllers;

use App\Models\Medicine;
use App\Models\Sale;
use App\Models\PurchaseOrder;

class ReportController extends Controller
{
    public function index()
    {
        $medicines = Medicine::orderBy('name')->get();

        $sales = Sale::orderBy('sale_date', 'desc')->get();

        $purchases = PurchaseOrder::orderBy('created_at', 'desc')->get();

        $lowStock = Medicine::whereColumn(
            'quantity',
            '<=',
            'reorder_level'
        )->get();

        $expiring = Medicine::whereBetween(
            'expiry_date',
            [today(), today()->addDays(90)]
        )->get();

        return view('reports.index', compact(
            'medicines',
            'sales',
            'purchases',
            'lowStock',
            'expiring'
        ));
    }
}