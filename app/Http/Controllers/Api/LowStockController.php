<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Medicine;
use App\Models\Batch;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class LowStockController extends Controller
{
    /**
     * Display a list of low-stock medicines.
     *
     * Low-stock is determined at the batch level: a medicine is flagged
     * when the total quantity across all of its batches is at or below
     * the default reorder level.
     */
    public function index()
    {
        $lowStockThreshold = Medicine::DEFAULT_REORDER_LEVEL;

        $medicineIds = Batch::groupBy('medicine_id')
            ->havingRaw('SUM(quantity) <= ' . $lowStockThreshold)
            ->pluck('medicine_id');

        $medicines = Medicine::whereIn('id', $medicineIds)
            ->with(['category', 'batches'])
            ->get()
            ->each(function ($medicine) {
                $medicine->quantity = $medicine->batches->sum('quantity');
                $medicine->reorder_level = Medicine::DEFAULT_REORDER_LEVEL;
            });

        $stats = [
            'critical' => $medicines->where('quantity', 0)->count(),
            'low'      => $medicines->filter(fn ($m) => $m->quantity > 0 && $m->quantity <= ($m->reorder_level / 2))->count(),
            'reorder'  => $medicines->filter(fn ($m) => $m->quantity > ($m->reorder_level / 2) && $m->quantity <= $m->reorder_level)->count(),
        ];

        return response()->json([
            'medicines' => $medicines,
            'stats'     => $stats,
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

        // Determine the current quantity from batches
        $currentQty = $medicine->batches()->sum('quantity');
        $reorderLevel = Medicine::DEFAULT_REORDER_LEVEL;

        // Also consider supplier-level pricing if available
        $unitPrice = $medicine->supplier->pivot->unit_price ?? 0;

        $quantity = max(1, $reorderLevel - $currentQty);
        $subtotal = $quantity * $unitPrice;

        $order = \App\Models\PurchaseOrder::create([
            'supplier_id' => $medicine->supplier_id,
            'order_date'   => now(),
            'status'       => 'draft',
            'total_amount' => $subtotal,
        ]);

        \App\Models\PurchaseOrderItem::create([
            'purchase_order_id' => $order->id,
            'medicine_id'       => $medicine->id,
            'quantity'          => $quantity,
            'unit_price'        => $unitPrice,
            'subtotal'          => $subtotal,
        ]);

        return response()->json([
            'message'         => 'Purchase order created successfully',
            'purchase_order'  => $order->load('items'),
        ], 201);
    }
}
