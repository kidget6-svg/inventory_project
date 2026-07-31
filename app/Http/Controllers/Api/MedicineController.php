<?php
// app/Http/Controllers/Api/MedicineController.php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Medicine;
use App\Models\Category;
use App\Models\Supplier;
use App\Models\StockMovement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class MedicineController extends Controller
{
    /**
     * Display a listing of the medicines.
     */
    public function index(Request $request)
    {
        $query = Medicine::with(['category', 'supplier']);

        // Search
        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                  ->orWhere('generic_name', 'like', "%{$request->search}%")
                  ->orWhere('barcode', 'like', "%{$request->search}%")
                  ->orWhere('batch_number', 'like', "%{$request->search}%");
            });
        }

        // Filters
        if ($request->category_id) {
            $query->where('category_id', $request->category_id);
        }

        if ($request->supplier_id) {
            $query->where('supplier_id', $request->supplier_id);
        }

        if ($request->status) {
            $query->where('status', $request->status);
        }

        // Low stock filter
        if ($request->low_stock) {
            $query->whereColumn('quantity', '<=', 'reorder_level');
        }

        $medicines = $query->latest()->get();

        return response()->json($medicines);
    }

    /**
     * Store a newly created medicine.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'generic_name' => 'nullable|string|max:255',
            'batch_number' => 'nullable|string|max:255',
            'barcode' => 'nullable|string|max:100|unique:medicines',
            'category_id' => 'required|exists:categories,id',
            'supplier_id' => 'nullable|exists:suppliers,id',
            'quantity' => 'required|integer|min:0',
            'unit_price' => 'nullable|numeric|min:0',
            'purchase_price' => 'nullable|numeric|min:0',
            'selling_price' => 'nullable|numeric|min:0',
            'reorder_level' => 'required|integer|min:0',
            'expiry_date' => 'nullable|date',
            'status' => ['required', Rule::in(['active', 'inactive', 'expired', 'discontinued'])],
            'shelf_location' => 'nullable|string|max:50',
            'image' => 'nullable|image|max:2048',
            'image_url' => 'nullable|url',
            'description' => 'nullable|string',
            'manufacturer' => 'nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();

        // Handle image upload
        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('medicines', 'public');
            $data['image'] = $path;
        }

        // Handle image URL
        if ($request->image_url) {
            $data['image'] = $this->downloadImageFromUrl($request->image_url);
        }

        $medicine = Medicine::create($data);

        // Create initial stock movement
        if ($data['quantity'] > 0) {
            StockMovement::create([
                'medicine_id' => $medicine->id,
                'user_id' => auth()->id(),
                'type' => 'in',
                'quantity' => $data['quantity'],
                'before_quantity' => 0,
                'after_quantity' => $data['quantity'],
                'notes' => 'Initial stock entry',
            ]);
        }

        return response()->json([
            'message' => 'Medicine created successfully',
            'medicine' => $medicine->load(['category', 'supplier'])
        ], 201);
    }

    /**
     * Display the specified medicine.
     */
    public function show($id)
    {
        $medicine = Medicine::with(['category', 'supplier'])->findOrFail($id);
        return response()->json($medicine);
    }

    /**
     * Update the specified medicine.
     */
    public function update(Request $request, $id)
    {
        $medicine = Medicine::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'generic_name' => 'nullable|string|max:255',
            'batch_number' => 'nullable|string|max:255',
            'barcode' => ['nullable', 'string', 'max:100', Rule::unique('medicines')->ignore($id)],
            'category_id' => 'required|exists:categories,id',
            'supplier_id' => 'nullable|exists:suppliers,id',
            'quantity' => 'required|integer|min:0',
            'unit_price' => 'nullable|numeric|min:0',
            'purchase_price' => 'nullable|numeric|min:0',
            'selling_price' => 'nullable|numeric|min:0',
            'reorder_level' => 'required|integer|min:0',
            'expiry_date' => 'nullable|date',
            'status' => ['required', Rule::in(['active', 'inactive', 'expired', 'discontinued'])],
            'shelf_location' => 'nullable|string|max:50',
            'image' => 'nullable|image|max:2048',
            'image_url' => 'nullable|url',
            'description' => 'nullable|string',
            'manufacturer' => 'nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();

        // Handle image upload
        if ($request->hasFile('image')) {
            // Delete old image
            if ($medicine->image && Storage::disk('public')->exists($medicine->image)) {
                Storage::disk('public')->delete($medicine->image);
            }
            $path = $request->file('image')->store('medicines', 'public');
            $data['image'] = $path;
        }

        // Handle image URL
        if ($request->image_url && !$request->hasFile('image')) {
            if ($medicine->image && Storage::disk('public')->exists($medicine->image)) {
                Storage::disk('public')->delete($medicine->image);
            }
            $data['image'] = $this->downloadImageFromUrl($request->image_url);
        }

        $oldQuantity = $medicine->quantity;
        $medicine->update($data);

        // Record stock movement if quantity changed
        if ($oldQuantity != $data['quantity']) {
            $type = $data['quantity'] > $oldQuantity ? 'in' : 'out';
            StockMovement::create([
                'medicine_id' => $medicine->id,
                'user_id' => auth()->id(),
                'type' => 'adjustment',
                'quantity' => abs($data['quantity'] - $oldQuantity),
                'before_quantity' => $oldQuantity,
                'after_quantity' => $data['quantity'],
                'notes' => 'Stock adjustment during update',
            ]);
        }

        return response()->json([
            'message' => 'Medicine updated successfully',
            'medicine' => $medicine->load(['category', 'supplier'])
        ]);
    }

    /**
     * Remove the specified medicine.
     */
    public function destroy($id)
    {
        $medicine = Medicine::findOrFail($id);
        
        // Delete image
        if ($medicine->image && Storage::disk('public')->exists($medicine->image)) {
            Storage::disk('public')->delete($medicine->image);
        }
        
        $medicine->delete();

        return response()->json(['message' => 'Medicine deleted successfully']);
    }

    /**
     * Get low stock medicines.
     */
    public function getLowStock()
    {
        $medicines = Medicine::whereColumn('quantity', '<=', 'reorder_level')
            ->with(['category', 'supplier'])
            ->orderBy('quantity')
            ->get();

        return response()->json($medicines);
    }

    /**
     * Get expiring soon medicines.
     */
    public function getExpiringSoon($days = 90)
    {
        $medicines = Medicine::whereDate('expiry_date', '<=', now()->addDays($days))
            ->whereDate('expiry_date', '>=', now())
            ->with(['category', 'supplier'])
            ->orderBy('expiry_date')
            ->get();

        return response()->json($medicines);
    }

    /**
     * Download image from URL.
     */
    private function downloadImageFromUrl($url)
    {
        try {
            $contents = file_get_contents($url);
            $filename = 'medicines/' . uniqid() . '.jpg';
            Storage::disk('public')->put($filename, $contents);
            return $filename;
        } catch (\Exception $e) {
            return null;
        }
    }
}