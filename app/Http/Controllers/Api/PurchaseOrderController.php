<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PurchaseOrder;
use App\Models\PurchaseOrderItem;
use App\Models\Medicine;
use App\Models\Supplier;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PurchaseOrderController extends Controller
{
    public function index()
    {
        $orders = PurchaseOrder::with('supplier')->orderBy('id', 'asc')->get();
        return response()->json($orders);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'supplier_id' => 'required|exists:suppliers,id',
            'order_date' => 'required|date',
            'medicine_id' => 'required|exists:medicines,id',
            'quantity' => 'required|integer|min:1',
            'unit_price' => 'required|numeric|min:0',
        ]);

        DB::beginTransaction();

        try {
            $subtotal = $validated['quantity'] * $validated['unit_price'];

            $order = PurchaseOrder::create([
                'supplier_id' => $validated['supplier_id'],
                'order_date' => $validated['order_date'],
                'status' => 'pending',
                'total_amount' => $subtotal,
            ]);

            PurchaseOrderItem::create([
                'purchase_order_id' => $order->id,
                'medicine_id' => $validated['medicine_id'],
                'quantity' => $validated['quantity'],
                'unit_price' => $validated['unit_price'],
                'subtotal' => $subtotal,
            ]);

            DB::commit();

            return response()->json($order->load('supplier'), 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Error creating order: ' . $e->getMessage()], 500);
        }
    }

    public function show(PurchaseOrder $purchaseOrder)
    {
        return response()->json($purchaseOrder->load('supplier', 'items.medicine'));
    }

    public function update(Request $request, PurchaseOrder $purchaseOrder)
    {
        // Only allow editing when status is pending or approved
        if (! $purchaseOrder->canEdit()) {
            return response()->json([
                'message' => 'Cannot edit order in ' . $purchaseOrder->status . ' status'
            ], 422);
        }

        $validated = $request->validate([
            'supplier_id' => 'required|exists:suppliers,id',
            'order_date' => 'required|date',
            'medicine_id' => 'required|exists:medicines,id',
            'quantity' => 'required|integer|min:1',
            'unit_price' => 'required|numeric|min:0',
        ]);

        DB::beginTransaction();

        try {
            $subtotal = $validated['quantity'] * $validated['unit_price'];

            // Update the order header (status is NOT changed here — it's workflow-driven)
            $purchaseOrder->update([
                'supplier_id' => $validated['supplier_id'],
                'order_date' => $validated['order_date'],
                'total_amount' => $subtotal,
            ]);

            // Get the existing item (if any)
            $item = $purchaseOrder->items()->first();

            if ($item) {
                // Update the item — stock is NOT adjusted here because
                // stock is only added when the order is completed
                $item->update([
                    'medicine_id' => $validated['medicine_id'],
                    'quantity' => $validated['quantity'],
                    'unit_price' => $validated['unit_price'],
                    'subtotal' => $subtotal,
                ]);
            } else {
                // No existing item — create one (stock will be added on completion)
                PurchaseOrderItem::create([
                    'purchase_order_id' => $purchaseOrder->id,
                    'medicine_id' => $validated['medicine_id'],
                    'quantity' => $validated['quantity'],
                    'unit_price' => $validated['unit_price'],
                    'subtotal' => $subtotal,
                ]);
            }

            DB::commit();

            return response()->json($purchaseOrder->load('supplier', 'items.medicine'));
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Error updating order: ' . $e->getMessage()], 500);
        }
    }

    public function destroy(PurchaseOrder $purchaseOrder)
    {
        // Only allow deletion when status is pending
        if (! $purchaseOrder->canDelete()) {
            return response()->json([
                'message' => 'Cannot delete order in ' . $purchaseOrder->status . ' status'
            ], 422);
        }

        DB::beginTransaction();

        try {
            // No stock to reverse since stock is only added on completion
            $purchaseOrder->delete();

            DB::commit();

            return response()->json(['message' => 'Purchase order deleted']);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Error deleting order: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Approve a purchase order (pending → approved).
     */
    public function approve(PurchaseOrder $purchaseOrder)
    {
        if (! $purchaseOrder->canApprove()) {
            return response()->json([
                'message' => 'Cannot approve order in ' . $purchaseOrder->status . ' status'
            ], 422);
        }

        $result = $purchaseOrder->approve();

        if (! $result) {
            return response()->json(['message' => 'Error approving order'], 500);
        }

        return response()->json($purchaseOrder->fresh()->load('supplier', 'items.medicine'));
    }

    /**
     * Process a purchase order (approved → processing).
     */
    public function process(PurchaseOrder $purchaseOrder)
    {
        if (! $purchaseOrder->canProcess()) {
            return response()->json([
                'message' => 'Cannot process order in ' . $purchaseOrder->status . ' status'
            ], 422);
        }

        $purchaseOrder->process();

        return response()->json($purchaseOrder->load('supplier', 'items.medicine'));
    }

    /**
     * Complete a purchase order (approved/processing → completed).
     * Updates medicine stock and creates stock movement records.
     */
    public function complete(PurchaseOrder $purchaseOrder)
    {
        if (! $purchaseOrder->canComplete()) {
            return response()->json([
                'message' => 'Cannot complete order in ' . $purchaseOrder->status . ' status'
            ], 422);
        }

        $result = $purchaseOrder->complete();

        if (! $result) {
            return response()->json(['message' => 'Error completing order'], 500);
        }

        return response()->json($purchaseOrder->fresh()->load('supplier', 'items.medicine'));
    }

    /**
     * Cancel a purchase order (pending/approved/processing → cancelled).
     */
    public function cancel(PurchaseOrder $purchaseOrder)
    {
        if (! $purchaseOrder->canCancel()) {
            return response()->json([
                'message' => 'Cannot cancel order in ' . $purchaseOrder->status . ' status'
            ], 422);
        }

        $purchaseOrder->cancel();

        return response()->json($purchaseOrder->load('supplier', 'items.medicine'));
    }
}
