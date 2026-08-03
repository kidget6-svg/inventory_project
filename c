<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Medicine;
use App\Models\Category;
use App\Models\Supplier;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class MedicineController extends Controller
{
    public function index(Request $request)
    {
        $query = Medicine::with(['category', 'supplier']);

        // Search by name, generic name, batch number, or barcode
        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('generic_name', 'like', "%{$search}%")
                  ->orWhere('batch_number', 'like', "%{$search}%")
                  ->orWhere('barcode', 'like', "%{$search}%");
            });
        }

        // Filter by category
        if ($categoryId = $request->input('category_id')) {
            $query->where('category_id', $categoryId);
        }

        // Filter by supplier
        if ($supplierId = $request->input('supplier_id')) {
            $query->where('supplier_id', $supplierId);
        }

        // Filter by status
        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        $medicines = $query->latest()->get();

        return response()->json($medicines);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'generic_name' => 'nullable|string|max:255',
            'batch_number' => 'nullable|string|max:255',
            'barcode' => 'nullable|string|max:100|unique:medicines,barcode',
            'category_id' => 'required|exists:categories,id',
            'supplier_id' => 'nullable|exists:suppliers,id',
            'quantity' => 'required|integer|min:0',
            'unit_price' => 'nullable|numeric|min:0',
            'purchase_price' => 'nullable|numeric|min:0',
            'selling_price' => 'nullable|numeric|min:0',
            'reorder_level' => 'required|integer|min:0',
            'expiry_date' => 'nullable|date',
            'status' => 'in:active,inactive,expired,discontinued',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        $validated = $this->handleImageUpload($validated, null);

        $medicine = Medicine::create($validated);
        return response()->json($medicine->load(['category', 'supplier']), 201);
    }

    public function show(Medicine $medicine)
    {
        return response()->json($medicine->load(['category', 'supplier']));
    }

    public function update(Request $request, Medicine $medicine)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'generic_name' => 'nullable|string|max:255',
            'batch_number' => 'nullable|string|max:255',
            'barcode' => 'nullable|string|max:100|unique:medicines,barcode,' . $medicine->id,
            'category_id' => 'required|exists:categories,id',
            'supplier_id' => 'nullable|exists:suppliers,id',
            'quantity' => 'required|integer|min:0',
            'unit_price' => 'nullable|numeric|min:0',
            'purchase_price' => 'nullable|numeric|min:0',
            'selling_price' => 'nullable|numeric|min:0',
            'reorder_level' => 'required|integer|min:0',
            'expiry_date' => 'nullable|date',
            'status' => 'in:active,inactive,expired,discontinued',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        $validated = $this->handleImageUpload($validated, $medicine);
        $medicine->update($validated);
        return response()->json($medicine->load(['category', 'supplier']));
    }

    /**
     * Store an uploaded medicine image (if present) on the public disk.
     * Deletes any previously stored image when updating.
     */
    protected function handleImageUpload(array $validated, ?Medicine $medicine = null): array
    {
        $request = request();

        if (! $request->hasFile('image')) {
            return $validated;
        }

        // Remove a previously stored image when updating
        if ($medicine && $medicine->image && Storage::disk('public')->exists($medicine->image)) {
            Storage::disk('public')->delete($medicine->image);
        }

        $path = $request->file('image')->store('medicine-images', 'public');
        $validated['image'] = $path;

        return $validated;
    }

    public function destroy(Medicine $medicine)
    {
        $medicine->delete();
        return response()->json(['message' => 'Medicine deleted']);
    }
}
