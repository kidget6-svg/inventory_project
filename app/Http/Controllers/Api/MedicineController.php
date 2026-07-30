<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Medicine;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class MedicineController extends Controller
{
    /**
     * Display a listing of medicines.
     */
    public function index(Request $request)
    {
        $query = Medicine::with('shelf');

        if ($request->has('search') && !empty($request->search)) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('generic_name', 'like', "%{$search}%")
                  ->orWhere('barcode', 'like', "%{$search}%")
                  ->orWhere('gtin_ndc', 'like', "%{$search}%")
                  ->orWhere('batch_number', 'like', "%{$search}%");
            });
        }

        if ($request->boolean('trash')) {
            $query->onlyTrashed();
        }

        return response()->json($query->latest()->paginate(15));
    }

    /**
     * Store a newly created medicine.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'                  => 'required|string|max:255',
            'generic_name'         => 'nullable|string|max:255',
            'category_id'           => 'nullable|integer',
            'manufacturer'          => 'nullable|string|max:255',
            'dosage_form'           => 'nullable|string|max:100',
            'strength'              => 'nullable|string|max:100',
            'unit_price'            => 'required|numeric|min:0',
            'stock_quantity'        => 'required|integer|min:0',
            'reorder_level'         => 'required|integer|min:0',
            'batch_number'          => 'nullable|string|max:100',
            'gtin_ndc'              => 'nullable|string|max:100',
            'expiry_date'           => 'required|date',
            'barcode'               => 'nullable|string|unique:medicines,barcode',
            'requires_prescription' => 'nullable|boolean',
            'shelf_id'              => 'nullable|exists:shelves,id',
            'shelf_number'          => 'nullable|string|max:50',
            'row_number'            => 'nullable|string|max:50',
            'image'                 => 'nullable|image|max:2048',
        ]);

        $validated['requires_prescription'] = $request->boolean('requires_prescription');

        if ($request->hasFile('image')) {
            $validated['image_path'] = $request->file('image')->store('medicines', 'public');
        }

        $medicine = Medicine::create($validated);

        return response()->json([
            'message' => 'Medicine added successfully!',
            'data'    => $medicine->load('shelf')
        ], 201);
    }

    /**
     * Update the specified medicine.
     */
    public function update(Request $request, $id)
    {
        $medicine = Medicine::findOrFail($id);

        $validated = $request->validate([
            'name'                  => 'required|string|max:255',
            'generic_name'         => 'nullable|string|max:255',
            'category_id'           => 'nullable|integer',
            'manufacturer'          => 'nullable|string|max:255',
            'dosage_form'           => 'nullable|string|max:100',
            'strength'              => 'nullable|string|max:100',
            'unit_price'            => 'required|numeric|min:0',
            'stock_quantity'        => 'required|integer|min:0',
            'reorder_level'         => 'required|integer|min:0',
            'batch_number'          => 'nullable|string|max:100',
            'gtin_ndc'              => 'nullable|string|max:100',
            'expiry_date'           => 'required|date',
            'barcode'               => 'nullable|string|unique:medicines,barcode,' . $id,
            'requires_prescription' => 'nullable|boolean',
            'shelf_id'              => 'nullable|exists:shelves,id',
            'shelf_number'          => 'nullable|string|max:50',
            'row_number'            => 'nullable|string|max:50',
            'image'                 => 'nullable|image|max:2048',
        ]);

        $validated['requires_prescription'] = $request->boolean('requires_prescription');

        if ($request->hasFile('image')) {
            if ($medicine->image_path) {
                Storage::disk('public')->delete($medicine->image_path);
            }
            $validated['image_path'] = $request->file('image')->store('medicines', 'public');
        }

        $medicine->update($validated);

        return response()->json([
            'message' => 'Medicine updated successfully!',
            'data'    => $medicine->load('shelf')
        ]);
    }

    /**
     * Soft delete a medicine.
     */
    public function destroy($id)
    {
        $medicine = Medicine::findOrFail($id);
        $medicine->delete();

        return response()->json(['message' => 'Medicine moved to trash.']);
    }

    /**
     * Restore a soft-deleted medicine.
     */
    public function restore($id)
    {
        $medicine = Medicine::onlyTrashed()->findOrFail($id);
        $medicine->restore();

        return response()->json(['message' => 'Medicine restored successfully!']);
    }

    /**
     * Force delete a medicine permanently.
     */
    public function forceDelete($id)
    {
        $medicine = Medicine::onlyTrashed()->findOrFail($id);
        if ($medicine->image_path) {
            Storage::disk('public')->delete($medicine->image_path);
        }
        $medicine->forceDelete();

        return response()->json(['message' => 'Medicine permanently deleted.']);
    }
}