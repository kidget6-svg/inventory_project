<?php

namespace App\Http\Controllers\Api;

use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\Medicine;
use App\Models\StockMovement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class SaleController extends Controller
{
    public function index(Request $request)
    {
        $query = Sale::with(['user', 'items.medicine']);

        if ($request->start_date) {
            $query->whereDate('sale_date', '>=', $request->start_date);
        }
        if ($request->end_date) {
            $query->whereDate('sale_date', '<=', $request->end_date);
        }

        $sales = $query->latest()->get();

        return response()->json($sales);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'items' => 'required|array|min:1',
            'items.*.medicine_id' => 'required|exists:medicines,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.unit_price' => 'required|numeric|min:0',
            'customer_name' => 'nullable|string|max:255',
            'customer_phone' => 'nullable|string|max:50',
            'payment_method' => 'required|in:cash,card,insurance,transfer',
            'discount' => 'nullable|numeric|min:0',
            'tax' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string',
        ]);

        $sale = DB::transaction(function () use ($validated) {
            $totalAmount = 0;
            $saleItems = [];

            foreach ($validated['items'] as $item) {
                $medicine = Medicine::lockForUpdate()->findOrFail($item['medicine_id']);

                // Check stock
                if ($item['quantity'] > $medicine->quantity) {
                    throw ValidationException::withMessages([
                        'items' => "Insufficient stock for {$medicine->name}. Available: {$medicine->quantity}"
                    ]);
                }

                $subtotal = $item['unit_price'] * $item['quantity'];
                $totalAmount += $subtotal;

                // Decrease stock
                $medicine->decrement('quantity', $item['quantity']);

                // Record stock movement
                StockMovement::create([
                    'medicine_id' => $medicine->id,
                    'type' => 'out',
                    'quantity' => $item['quantity'],
                    'reference' => 'Sale',
                    'notes' => "Sale transaction",
                    'user_id' => auth()->id(),
                    'before_quantity' => $medicine->quantity + $item['quantity'],
                    'after_quantity' => $medicine->quantity,
                ]);

                $saleItems[] = [
                    'medicine_id' => $medicine->id,
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['unit_price'],
                    'subtotal' => $subtotal,
                ];
            }

            // Apply discount and tax
            $discount = $validated['discount'] ?? 0;
            $tax = $validated['tax'] ?? 0;
            $netAmount = $totalAmount - $discount + $tax;

            // Create sale
            $sale = Sale::create([
                'sale_date' => now(),
                'total_amount' => $totalAmount,
                'discount' => $discount,
                'tax' => $tax,
                'net_amount' => $netAmount,
                'customer_name' => $validated['customer_name'] ?? null,
                'customer_phone' => $validated['customer_phone'] ?? null,
                'payment_method' => $validated['payment_method'],
                'status' => 'completed',
                'user_id' => auth()->id(),
                'notes' => $validated['notes'] ?? null,
            ]);

            // Create sale items
            foreach ($saleItems as $item) {
                SaleItem::create(array_merge($item, ['sale_id' => $sale->id]));
            }

            return $sale->load(['items.medicine', 'user']);
        });

        return response()->json([
            'message' => 'Sale completed successfully',
            'sale' => $sale
        ], 201);
    }

    public function show($id)
    {
        $sale = Sale::with(['items.medicine', 'user'])->findOrFail($id);
        return response()->json($sale);
    }

    public function destroy($id)
    {
        $sale = Sale::with('items')->findOrFail($id);

        DB::transaction(function () use ($sale) {
            // Reverse stock
            foreach ($sale->items as $item) {
                $medicine = Medicine::find($item->medicine_id);
                if ($medicine) {
                    $medicine->increment('quantity', $item->quantity);
                    
                    StockMovement::create([
                        'medicine_id' => $medicine->id,
                        'type' => 'return',
                        'quantity' => $item->quantity,
                        'reference' => 'Sale reversal',
                        'notes' => "Reversed sale #{$sale->id}",
                        'user_id' => auth()->id(),
                    ]);
                }
            }

            $sale->delete();
        });

        return response()->json(['message' => 'Sale deleted successfully']);
    }

    public function getTodaySales()
    {
        $today = now()->toDateString();
        
        $sales = Sale::with(['items.medicine', 'user'])
            ->whereDate('sale_date', $today)
            ->get();

        $totalRevenue = $sales->sum('net_amount');
        $totalSales = $sales->count();

        return response()->json([
            'sales' => $sales,
            'total_revenue' => $totalRevenue,
            'total_sales' => $totalSales,
        ]);
    }
}