<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Sale;
use App\Models\Medicine;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SaleController extends Controller
{
    // Fetch pending sales queue for Cashier
    public function index(Request $request)
    {
        $query = Sale::with(['items.itemable']);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        return response()->json($query->latest()->get());
    }

    // Pharmacist dispatches prescription sale
    public function storePrescription(Request $request)
    {
        $validated = $request->validate([
            'items' => 'required|array|min:1',
            'items.*.medicine_id' => 'required|exists:medicines,id',
            'items.*.quantity' => 'required|integer|min:1',
        ]);

        return DB::transaction(function () use ($validated, $request) {
            $totalAmount = 0;
            $itemsToCreate = [];

            foreach ($validated['items'] as $item) {
                $medicine = Medicine::findOrFail($item['medicine_id']);

                if ($medicine->quantity < $item['quantity']) {
                    return response()->json([
                        'message' => "Insufficient stock for {$medicine->name}"
                    ], 422);
                }

                $subtotal = $medicine->price * $item['quantity'];
                $totalAmount += $subtotal;

                $itemsToCreate[] = [
                    'itemable_id' => $medicine->id,
                    'itemable_type' => Medicine::class,
                    'quantity' => $item['quantity'],
                    'unit_price' => $medicine->price,
                    'subtotal' => $subtotal,
                ];
            }

            $sale = Sale::create([
                'user_id' => $request->user()?->id,
                'type' => 'prescription',
                'status' => 'pending_cashier',
                'total_amount' => $totalAmount,
            ]);

            foreach ($itemsToCreate as $itemData) {
                $sale->items()->create($itemData);
            }

            return response()->json([
                'message' => 'Order sent to Cashier',
                'sale' => $sale->load('items.itemable')
            ], 201);
        });
    }

    // Cashier updates order status (e.g., pending_cashier -> completed)
    public function updateStatus(Request $request, $id)
    {
        $validated = $request->validate([
            'status' => 'required|string|in:completed,cancelled'
        ]);

        $sale = Sale::with('items')->findOrFail($id);

        if ($sale->status === 'completed') {
            return response()->json(['message' => 'Sale already completed'], 400);
        }

        DB::transaction(function () use ($sale, $validated) {
            if ($validated['status'] === 'completed') {
                // Deduct stock for items when payment is confirmed
                foreach ($sale->items as $item) {
                    if ($item->itemable) {
                        $item->itemable->decrement('quantity', $item->quantity);
                    }
                }
            }

            $sale->update(['status' => $validated['status']]);
        });

        return response()->json([
            'message' => 'Sale status updated to ' . $validated['status'],
            'sale' => $sale
        ]);
    }
}