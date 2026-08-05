<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Medicine;
use App\Models\Sale;
use App\Models\PurchaseOrder;
use App\Models\User;

class ReportController extends Controller
{
    public function index()
    {
        $medicines = Medicine::orderBy('name')->get();
        $sales = Sale::orderBy('sale_date', 'desc')->paginate(10);
        $purchases = PurchaseOrder::with('supplier')->orderBy('created_at', 'desc')->paginate(10);

        $lowStock = Medicine::whereColumn('quantity', '<=', 'reorder_level')->get();
        $expiring = Medicine::whereNotNull('expiry_date')
            ->whereBetween('expiry_date', [today(), today()->addDays(90)])
            ->orderBy('expiry_date')
            ->get();

        // Payment method breakdown for completed sales
        $paymentMethodBreakdown = [];
        foreach (Sale::paymentMethods() as $key => $label) {
            $paymentMethodBreakdown[] = [
                'method' => $key,
                'label' => $label,
                'count' => Sale::where('payment_method', $key)
                    ->where('status', 'completed')
                    ->count(),
                'total' => (float) Sale::where('payment_method', $key)
                    ->where('status', 'completed')
                    ->sum('total_amount'),
            ];
        }

        // Cashiers list for filtering
        $cashiers = User::where('role', 'cashier')->select('id', 'name')->get();

        return response()->json([
            'medicines' => $medicines,
            'sales' => $sales,
            'purchases' => $purchases,
            'lowStock' => $lowStock,
            'expiring' => $expiring,
            'paymentMethodBreakdown' => $paymentMethodBreakdown,
            'cashiers' => $cashiers,
        ]);
    }
}
