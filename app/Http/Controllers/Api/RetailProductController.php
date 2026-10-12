<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\RetailProduct;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class RetailProductController extends Controller
{
    public function index(Request $request)
    {
        $query = RetailProduct::with(['supplier', 'branch']);

        $user = $request->user();
        $branchScope = $user ? $user->getBranchScope($request) : null;
        if ($branchScope) {
            $query->where('branch_id', $branchScope);
        }

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

        $perPage = $request->input('per_page', 10);
        if ($perPage === 'all' || $perPage == -1) {
            return response()->json($query->latest()->get());
        }

        $products = $query->latest()->paginate((int) $perPage);

        return response()->json($products);
    }

    public function show(RetailProduct $retailProduct)
    {
        return response()->json($retailProduct->load(['supplier', 'branch']));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'sku' => 'nullable|string|max:100|unique:retail_products,sku',
            'barcode' => 'nullable|string|max:100|unique:retail_products,barcode',
            'category' => 'required|string|max:255',
            'supplier_id' => 'nullable|exists:suppliers,id',
            'quantity' => 'required|integer|min:0',
            'price' => 'nullable|numeric|min:0',
            'purchase_price' => 'nullable|numeric|min:0',
            'reorder_level' => 'required|integer|min:0',
            'expiry_date' => 'nullable|date',
            'status' => 'in:active,inactive,expired,discontinued',
            'description' => 'nullable|string',
            'manufacturer' => 'nullable|string|max:255',
            'shelf_location' => 'nullable|string|max:50',
            'branch_id' => 'nullable|exists:branches,id',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
        ]);

        $validated = $this->handleImageUpload($validated, null);

        if (empty($validated['branch_id'])) {
            $userBranch = $request->user()->getBranchScope($request);
            if ($userBranch) {
                $validated['branch_id'] = $userBranch;
            }
        }

        $product = RetailProduct::create($validated);
        return response()->json($product->load(['supplier', 'branch']), 201);
    }

    public function update(Request $request, RetailProduct $retailProduct)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'sku' => ['nullable', 'string', 'max:100', \Illuminate\Validation\Rule::unique('retail_products', 'sku')->ignore($retailProduct->id)],
            'barcode' => ['nullable', 'string', 'max:100', \Illuminate\Validation\Rule::unique('retail_products', 'barcode')->ignore($retailProduct->id)],
            'category' => 'required|string|max:255',
            'supplier_id' => 'nullable|exists:suppliers,id',
            'quantity' => 'required|integer|min:0',
            'price' => 'nullable|numeric|min:0',
            'purchase_price' => 'nullable|numeric|min:0',
            'reorder_level' => 'required|integer|min:0',
            'expiry_date' => 'nullable|date',
            'status' => 'in:active,inactive,expired,discontinued',
            'description' => 'nullable|string',
            'manufacturer' => 'nullable|string|max:255',
            'shelf_location' => 'nullable|string|max:50',
            'branch_id' => 'nullable|exists:branches,id',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
        ]);

        $validated = $this->handleImageUpload($validated, $retailProduct);
        $retailProduct->update($validated);

        return response()->json($retailProduct->load(['supplier', 'branch']));
    }

    public function destroy(RetailProduct $retailProduct)
    {
        $retailProduct->delete();

        return response()->json(['message' => 'Retail product deleted']);
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
