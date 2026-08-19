<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreRetailProductRequest;
use App\Http\Requests\UpdateRetailProductRequest;
use App\Models\RetailProduct;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class RetailProductController extends Controller
{
    public function index(Request $request)
    {
        $query = RetailProduct::with('supplier');

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('sku', 'like', "%{$search}%")
                  ->orWhere('barcode', 'like', "%{$search}%");
            });
        }

        if ($category = $request->input('category')) {
            $query->where('category', $category);
        }

        if ($supplierId = $request->input('supplier_id')) {
            $query->where('supplier_id', $supplierId);
        }

        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        $perPage = (int) $request->input('per_page', 10);
        $products = $query->latest()->paginate($perPage);

        return response()->json($products);
    }

    public function show(RetailProduct $retailProduct)
    {
        return response()->json($retailProduct->load('supplier'));
    }

    public function store(StoreRetailProductRequest $request)
    {
        $validated = $request->validated();
        $validated = $this->handleImageUpload($validated, null);

        $product = RetailProduct::create($validated);
        return response()->json([
            'success' => true,
            'message' => 'Retail product created successfully',
            'data'    => $product->load('supplier'),
        ], 201);
    }

    public function update(UpdateRetailProductRequest $request, RetailProduct $retailProduct)
    {
        $validated = $request->validated();
        $validated = $this->handleImageUpload($validated, $retailProduct);
        $retailProduct->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Retail product updated successfully',
            'data'    => $retailProduct->load('supplier'),
        ]);
    }

    public function destroy(RetailProduct $retailProduct)
    {
        $retailProduct->delete();

        return response()->json([
            'success' => true,
            'message' => 'Retail product deleted successfully',
        ]);
    }

    protected function handleImageUpload(array $validated, ?RetailProduct $product = null): array
    {
        $request = request();

        if (! $request->hasFile('image')) {
            return $validated;
        }

        if ($product && $product->image && Storage::disk('public')->exists($product->image)) {
            Storage::disk('public')->delete($product->image);
        }

        $path = $request->file('image')->store('retail-product-images', 'public');
        $validated['image'] = $path;

        return $validated;
    }
}
