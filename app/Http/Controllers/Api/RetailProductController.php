<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\RetailProduct;
use Illuminate\Http\Request;

class RetailProductController extends Controller
{
    public function index()
    {
        return response()->json(RetailProduct::all());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'sku' => 'nullable|string|unique:retail_products,sku',
            'category' => 'required|string',
            'price' => 'required|numeric|min:0',
            'quantity' => 'required|integer|min:0',
        ]);

        $product = RetailProduct::create($validated);

        return response()->json($product, 201);
    }
}