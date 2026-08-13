<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreMedicineRequest;
use App\Http\Requests\UpdateMedicineRequest;
use App\Models\Medicine;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class MedicineController extends Controller
{
    /**
     * Display a paginated, searchable list of medicines.
     *
     * Supports searching by name, generic name, barcode, or batch number.
     * Supports filtering by category, supplier, shelf, and prescription flag.
     */
    public function index(Request $request)
    {
        $query = Medicine::with(['category', 'supplier', 'shelf']);

        // Search across multiple fields
        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('generic_name', 'like', "%{$search}%")
                  ->orWhere('barcode', 'like', "%{$search}%")
                  ->orWhere('batch_number', 'like', "%{$search}%")
                  ->orWhere('dosage_form', 'like', "%{$search}%")
                  ->orWhere('strength', 'like', "%{$search}%");
            });
        }

        // Barcode lookup (exact match via dedicated ?barcode= parameter)
        if ($barcode = $request->input('barcode')) {
            $query->where('barcode', $barcode);
        }

        // Filter by category
        if ($categoryId = $request->input('category_id')) {
            $query->where('category_id', $categoryId);
        }

        // Filter by supplier
        if ($supplierId = $request->input('supplier_id')) {
            $query->where('supplier_id', $supplierId);
        }

        // Filter by shelf
        if ($shelfId = $request->input('shelf_id')) {
            $query->where('shelf_id', $shelfId);
        }

        // Filter by prescription requirement
        if ($request->has('prescription')) {
            $query->where('prescription', (bool) $request->input('prescription'));
        }

        $perPage = (int) $request->input('per_page', 10);
        $medicines = $query->latest()->paginate($perPage);

        return response()->json($medicines);
    }

    /**
     * Store a newly created medicine.
     */
    public function store(StoreMedicineRequest $request)
    {
        $validated = $request->validated();

        // Upload image if present
        $validated = $this->handleImageUpload($validated, null);

        $medicine = Medicine::create($validated);

        return response()->json(
            $medicine->load(['category', 'supplier', 'shelf']),
            201
        );
    }

    /**
     * Display the specified medicine.
     */
    public function show(Medicine $medicine)
    {
        return response()->json($medicine->load(['category', 'supplier', 'shelf']));
    }

    /**
     * Update the specified medicine.
     */
    public function update(UpdateMedicineRequest $request, Medicine $medicine)
    {
        $validated = $request->validated();

        // Handle image removal flag
        if ($request->boolean('delete_image')) {
            $this->deleteExistingImage($medicine);
            $validated['image'] = null;
        }

        // Upload new image if present (also removes old image)
        $validated = $this->handleImageUpload($validated, $medicine);

        $medicine->update($validated);

        return response()->json($medicine->load(['category', 'supplier', 'shelf']));
    }

    /**
     * Delete the specified medicine.
     * Also removes the associated image file from storage.
     */
    public function destroy(Medicine $medicine)
    {
        // Delete the medicine image from disk
        $this->deleteExistingImage($medicine);

        $medicine->delete();

        return response()->json(['message' => 'Medicine deleted']);
    }

    /**
     * Print / generate a barcode label for a medicine.
     *
     * Returns the medicine data needed to render a barcode label.
     * The frontend can use this to print or download a label image.
     */
    public function barcodeLabel(Medicine $medicine)
    {
        return response()->json([
            'medicine'    => $medicine->load('category'),
            'barcode_value' => $medicine->barcode ?: $medicine->id,
        ]);
    }

    /**
     * Store an uploaded medicine image (if present) on the public disk.
     * Deletes any previously stored image when updating.
     *
     * Generates a unique filename to prevent collisions.
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

        // Store with a unique filename using Laravel's built-in storage
        $path = $request->file('image')->store('medicine-images', 'public');
        $validated['image'] = $path;

        return $validated;
    }

    /**
     * Delete the image associated with a medicine (if any).
     */
    protected function deleteExistingImage(Medicine $medicine): void
    {
        if ($medicine->image && Storage::disk('public')->exists($medicine->image)) {
            Storage::disk('public')->delete($medicine->image);
        }
    }
}
