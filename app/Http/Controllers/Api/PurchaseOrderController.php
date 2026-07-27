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
            'status' => 'nullable|string',
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
                'status' => $validated['status'] ?? 'pending',
                'total_amount' => $subtotal,
            ]);

            PurchaseOrderItem::create([
                'purchase_order_id' => $order->id,
                'medicine_id' => $validated['medicine_id'],
                'quantity' => $validated['quantity'],
                'unit_price' => $validated['unit_price'],
                'subtotal' => $subtotal,
            ]);

            Medicine::where('id', $validated['medicine_id'])
                ->increment('quantity', $validated['quantity']);

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
        $validated = $request->validate([
            'supplier_id' => 'required|exists:suppliers,id',
            'order_date' => 'required|date',
            'status' => 'nullable|string',
            'medicine_id' => 'required|exists:medicines,id',
            'quantity' => 'required|integer|min:1',
            'unit_price' => 'required|numeric|min:0',
        ]);

        DB::beginTransaction();

        try {
            $subtotal = $validated['quantity'] * $validated['unit_price'];

            // Update the order header
            $purchaseOrder->update([
                'supplier_id' => $validated['supplier_id'],
                'order_date' => $validated['order_date'],
                'status' => $validated['status'] ?? 'pending',
                'total_amount' => $subtotal,
            ]);

            // Get the existing item (if any)
            $item = $purchaseOrder->items()->first();

            if ($item) {
                // Handle stock adjustment
                $oldQuantity = $item->quantity;
                $oldMedicineId = $item->medicine_id;
                $newQuantity = $validated['quantity'];
                $newMedicineId = $validated['medicine_id'];

                if ($oldMedicineId != $newMedicineId) {
                    // Medicine changed: revert old medicine stock, add new medicine stock
                    Medicine::where('id', $oldMedicineId)->decrement('quantity', $oldQuantity);
                    Medicine::where('id', $newMedicineId)->increment('quantity', $newQuantity);
                } else {
                    // Same medicine: adjust by difference
                    $diff = $newQuantity - $oldQuantity;
                    if ($diff > 0) {
                        Medicine::where('id', $newMedicineId)->increment('quantity', $diff);
                    } elseif ($diff < 0) {
                        Medicine::where('id', $newMedicineId)->decrement('quantity', abs($diff));
                    }
                }

                // Update the item
                $item->update([
                    'medicine_id' => $validated['medicine_id'],
                    'quantity' => $validated['quantity'],
                    'unit_price' => $validated['unit_price'],
                    'subtotal' => $subtotal,
                ]);
            } else {
                // No existing item — create one and increment stock
                PurchaseOrderItem::create([
                    'purchase_order_id' => $purchaseOrder->id,
                    'medicine_id' => $validated['medicine_id'],
                    'quantity' => $validated['quantity'],
                    'unit_price' => $validated['unit_price'],
                    'subtotal' => $subtotal,
                ]);

                Medicine::where('id', $validated['medicine_id'])
                    ->increment('quantity', $validated['quantity']);
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
        DB::beginTransaction();

        try {
            // Reverse stock for each item before deleting
            foreach ($purchaseOrder->items as $item) {
                Medicine::where('id', $item->medicine_id)
                    ->decrement('quantity', $item->quantity);
            }

            $purchaseOrder->delete();

            DB::commit();

            return response()->json(['message' => 'Purchase order deleted']);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Error deleting order: ' . $e->getMessage()], 500);
        }
    }
}
