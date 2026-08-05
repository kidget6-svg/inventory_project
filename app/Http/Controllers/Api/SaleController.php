<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Sale;
use App\Models\Medicine;
use App\Models\RetailProduct;
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

                $unitPrice = $medicine->selling_price ?? $medicine->unit_price ?? 0;
                $subtotal = $unitPrice * $item['quantity'];
                $totalAmount += $subtotal;

                $itemsToCreate[] = [
                    'medicine_id' => $medicine->id,
                    'itemable_id' => $medicine->id,
                    'itemable_type' => Medicine::class,
                    'quantity' => $item['quantity'],
                    'unit_price' => $unitPrice,
                    'subtotal' => $subtotal,
                ];
            }

            $sale = Sale::create([
                'user_id' => $request->user()->id,
                'sale_date' => now(),
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

    // Cashier completes a retail sale from the retail catalogue
    public function storeRetail(Request $request)
    {
        $validated = $request->validate([
            'items' => 'required|array|min:1',
            'items.*.id' => 'required|integer|exists:retail_products,id',
            'items.*.cartQty' => 'required|integer|min:1',
        ]);

        return DB::transaction(function () use ($validated, $request) {
            $totalAmount = 0;
            $itemsToCreate = [];

            foreach ($validated['items'] as $item) {
                $product = RetailProduct::findOrFail($item['id']);

                if ($product->quantity < $item['cartQty']) {
                    return response()->json([
                        'message' => "Insufficient stock for {$product->name}"
                    ], 422);
                }

                $subtotal = $product->price * $item['cartQty'];
                $totalAmount += $subtotal;

                $itemsToCreate[] = [
                    'medicine_id' => $product->id,
                    'itemable_id' => $product->id,
                    'itemable_type' => RetailProduct::class,
                    'quantity' => $item['cartQty'],
                    'unit_price' => $product->price,
                    'subtotal' => $subtotal,
                ];
            }

            $sale = Sale::create([
                'user_id' => $request->user()->id,
                'sale_date' => now(),
                'type' => 'retail',
                'status' => 'completed',
                'total_amount' => $totalAmount,
                'net_amount' => $totalAmount,
            ]);

            foreach ($itemsToCreate as $itemData) {
                $sale->items()->create($itemData);
                RetailProduct::whereKey($itemData['itemable_id'])->decrement('quantity', $itemData['quantity']);
            }

            return response()->json([
                'message' => 'Retail sale processed successfully',
                'sale' => $sale->load('items.itemable')
            ], 201);
        });
    }

    // Today's sales
    public function getTodaySales()
    {
        $sales = Sale::with('items.itemable')
            ->whereDate('sale_date', today())
            ->latest()
            ->get();

        return response()->json($sales);
    }

    // Sales summary stats
    public function getStats()
    {
        return response()->json([
            'today_count' => Sale::whereDate('sale_date', today())->count(),
            'today_revenue' => (float) Sale::whereDate('sale_date', today())->sum('total_amount'),
            'total_count' => Sale::count(),
            'total_revenue' => (float) Sale::sum('total_amount'),
        ]);
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