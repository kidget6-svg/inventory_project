<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Sale;
use Illuminate\Http\Request;

class SaleController extends Controller
{
    public function index()
    {
        $sales = Sale::latest()->get();
        return response()->json($sales);
    }

    public function store(Request $request)
    {
        $request->validate([
            'sale_date' => 'required',
            'total_amount' => 'required|numeric|min:0',
        ]);

        $sale = Sale::create([
            'sale_date' => $request->sale_date,
            'total_amount' => $request->total_amount,
        ]);

        return response()->json($sale, 201);
    }

    public function show(Sale $sale)
    {
        return response()->json($sale);
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
