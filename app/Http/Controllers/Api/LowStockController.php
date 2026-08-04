<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Medicine;
use App\Models\PurchaseOrder;
use App\Models\PurchaseOrderItem;
use Illuminate\Http\Request;

class LowStockController extends Controller
{
    public function index()
    {
        $medicines = Medicine::with(['category', 'supplier'])
            ->whereColumn('quantity', '<=', 'reorder_level')
            ->orderBy('quantity')
            ->get();

        $stats = [
            'critical' => $medicines->where('quantity', 0)->count(),
            'low' => $medicines->filter(fn ($m) => $m->quantity > 0 && $m->quantity <= (int) ($m->reorder_level / 2))->count(),
            'reorder' => $medicines->filter(fn ($m) => $m->quantity > 0 && $m->quantity > (int) ($m->reorder_level / 2))->count(),
        ];

        return response()->json([
            'medicines' => $medicines,
            'stats' => $stats,
        ]);
    }

    /**
     * Create a draft purchase order for a low-stock medicine
     * using its assigned supplier.
     */
    public function orderNow(Request $request, Medicine $medicine)
    {
        if (! $medicine->supplier) {
            return response()->json([
                'message' => 'This medicine has no supplier assigned. Please assign a supplier first.'
            ], 422);
        }

        $quantity = max(1, $medicine->reorder_level - $medicine->quantity);
        $unitPrice = $medicine->purchase_price ?? $medicine->unit_price ?? 0;
        $subtotal = $quantity * $unitPrice;

        $order = PurchaseOrder::create([
            'supplier_id' => $medicine->supplier_id,
            'order_date' => now(),
            'status' => 'draft',
            'total_amount' => $subtotal,
        ]);

        PurchaseOrderItem::create([
            'purchase_order_id' => $order->id,
            'medicine_id' => $medicine->id,
            'quantity' => $quantity,
            'unit_price' => $unitPrice,
            'subtotal' => $subtotal,
        ]);

        return response()->json([
            'message' => 'Purchase order created successfully',
            'purchase_order' => $order->load('items'),
        ], 201);
    }
}
