<?php

namespace App\Http\Controllers;

use App\Models\Medicine;
use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\PurchaseOrder;
use Carbon\Carbon;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    /**
     * Display reports.
     */
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
            ->whereBetween('expiry_date', [
                today(),
                today()->addDays(90)
            ])
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

    /**
     * Get medicines sold today with shelf information.
     */
    public function todaySales()
    {
        $sales = SaleItem::with('medicine.shelf')
            ->whereDate('created_at', Carbon::today())
            ->get();

        return response()->json($sales);
    }
}
