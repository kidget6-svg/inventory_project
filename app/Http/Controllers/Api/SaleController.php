<?php
// app/Http/Controllers/Api/SaleController.php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\Medicine;
use App\Models\StockMovement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

class SaleController extends Controller
{
    /**
     * Display a listing of sales.
     */
    public function index(Request $request)
    {
        $query = Sale::with(['user', 'items.medicine']);

        // Filter by date
        if ($request->start_date) {
            $query->whereDate('sale_date', '>=', $request->start_date);
        }
        if ($request->end_date) {
            $query->whereDate('sale_date', '<=', $request->end_date);
        }

        // Filter by status
        if ($request->status) {
            $query->where('status', $request->status);
        }

        $sales = $query->latest()->get();

        return response()->json($sales);
    }

    /**
     * Store a newly created sale.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
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

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $sale = DB::transaction(function () use ($request) {
            $totalAmount = 0;
            $saleItems = [];

            foreach ($request->items as $item) {
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
                $oldQuantity = $medicine->quantity;
                $medicine->decrement('quantity', $item['quantity']);

                // Record stock movement
                StockMovement::create([
                    'medicine_id' => $medicine->id,
                    'user_id' => auth()->id(),
                    'type' => 'out',
                    'quantity' => $item['quantity'],
                    'before_quantity' => $oldQuantity,
                    'after_quantity' => $medicine->quantity,
                    'reference' => 'Sale',
                    'notes' => "Sale transaction for {$medicine->name}",
                ]);

                $saleItems[] = [
                    'medicine_id' => $medicine->id,
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['unit_price'],
                    'subtotal' => $subtotal,
                ];
            }

            // Apply discount and tax
            $discount = $request->discount ?? 0;
            $tax = $request->tax ?? 0;
            $netAmount = $totalAmount - $discount + $tax;

            // Create sale
            $sale = Sale::create([
                'sale_date' => now(),
                'total_amount' => $totalAmount,
                'discount' => $discount,
                'tax' => $tax,
                'net_amount' => $netAmount,
                'customer_name' => $request->customer_name ?? null,
                'customer_phone' => $request->customer_phone ?? null,
                'payment_method' => $request->payment_method,
                'status' => 'completed',
                'user_id' => auth()->id(),
                'notes' => $request->notes ?? null,
                'receipt_number' => 'REC-' . date('Ymd') . '-' . str_pad(rand(1, 9999), 4, '0', STR_PAD_LEFT),
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

    /**
     * Display the specified sale.
     */
    public function show($id)
    {
        $sale = Sale::with(['items.medicine', 'user'])->findOrFail($id);
        return response()->json($sale);
    }

    /**
     * Update the specified sale.
     */
    public function update(Request $request, $id)
    {
        $sale = Sale::findOrFail($id);
        
        $validator = Validator::make($request->all(), [
            'status' => 'in:pending,completed,cancelled',
            'payment_method' => 'in:cash,card,insurance,transfer',
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $sale->update($request->only(['status', 'payment_method', 'notes']));

        return response()->json([
            'message' => 'Sale updated successfully',
            'sale' => $sale
        ]);
    }

    /**
     * Remove the specified sale.
     */
    public function destroy($id)
    {
        $sale = Sale::with('items')->findOrFail($id);

        DB::transaction(function () use ($sale) {
            // Reverse stock
            foreach ($sale->items as $item) {
                $medicine = Medicine::find($item->medicine_id);
                if ($medicine) {
                    $oldQuantity = $medicine->quantity;
                    $medicine->increment('quantity', $item->quantity);
                    
                    StockMovement::create([
                        'medicine_id' => $medicine->id,
                        'user_id' => auth()->id(),
                        'type' => 'return',
                        'quantity' => $item->quantity,
                        'before_quantity' => $oldQuantity,
                        'after_quantity' => $medicine->quantity,
                        'reference' => 'Sale reversal',
                        'notes' => "Reversed sale #{$sale->id}",
                    ]);
                }
            }

            $sale->delete();
        });

        return response()->json(['message' => 'Sale deleted successfully']);
    }

    /**
     * Get today's sales.
     */
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

    /**
     * Get sales statistics.
     */
    public function getStats()
    {
        $stats = [
            'today_sales' => Sale::whereDate('sale_date', today())->count(),
            'today_revenue' => Sale::whereDate('sale_date', today())->sum('net_amount'),
            'this_week_sales' => Sale::whereBetween('sale_date', [now()->startOfWeek(), now()->endOfWeek()])->count(),
            'this_week_revenue' => Sale::whereBetween('sale_date', [now()->startOfWeek(), now()->endOfWeek()])->sum('net_amount'),
            'this_month_sales' => Sale::whereMonth('sale_date', now()->month)->count(),
            'this_month_revenue' => Sale::whereMonth('sale_date', now()->month)->sum('net_amount'),
            'total_sales' => Sale::count(),
            'total_revenue' => Sale::sum('net_amount'),
        ];

        return response()->json($stats);
    }
}