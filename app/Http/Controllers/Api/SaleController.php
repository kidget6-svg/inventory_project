<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\Medicine;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SaleController extends Controller
{
    public function index()
    {
        $sales = Sale::withCount('items')->latest()->get();
        return response()->json($sales);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'sale_date' => 'required|date',
            'total_amount' => 'required|numeric|min:0',
            'items' => 'required|array|min:1',
            'items.*.medicine_id' => 'required|exists:medicines,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.unit_price' => 'required|numeric|min:0',
        ]);

        $sale = DB::transaction(function () use ($validated, $request) {
            $sale = Sale::create([
                'sale_date' => $validated['sale_date'],
                'total_amount' => $validated['total_amount'],
            ]);

            foreach ($request->items as $item) {
                SaleItem::create([
                    'sale_id' => $sale->id,
                    'medicine_id' => $item['medicine_id'],
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['unit_price'],
                ]);

                // Decrease stock
                Medicine::where('id', $item['medicine_id'])
                    ->decrement('quantity', $item['quantity']);
            }

            return $sale;
        });

        return response()->json($sale->loadCount('items'), 201);
    }

    public function show(Sale $sale)
    {
        return response()->json($sale->load('items'));
    }

    public function update(Request $request, Sale $sale)
    {
        $sale->update([
            'sale_date' => $request->sale_date,
            'total_amount' => $request->total_amount,
        ]);

        return response()->json($sale);
    }

    public function destroy(Sale $sale)
    {
        $sale->delete();
        return response()->json(['message' => 'Sale deleted']);
    }
}
