<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreMedicineRequest;
use App\Http\Requests\UpdateMedicineRequest;
use App\Models\Medicine;
use App\Models\Category;
use App\Models\Supplier;
use App\Models\Shelf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class MedicineController extends Controller
{
    /**
     * Display a listing of medicines.
     */
    public function index(Request $request)
    {
        $query = Medicine::with(['category', 'supplier', 'shelf']);

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('generic_name', 'like', "%{$search}%")
                  ->orWhere('barcode', 'like', "%{$search}%");
            });
        }

        $medicines = $query->latest()->paginate(10);

        return view('medicines.index', compact('medicines'));
    }

    /**
     * Show the form for creating a new medicine.
     */
    public function create()
    {
        $categories = Category::all();
        $suppliers  = Supplier::all();
        $shelves    = Shelf::all();

        return view('medicines.create', compact('categories', 'suppliers', 'shelves'));
    }

    /**
     * Store a newly created medicine.
     */
    public function store(StoreMedicineRequest $request)
    {
        $validated = $request->validated();

        if ($request->hasFile('image')) {
            $validated['image'] = $request->file('image')
                ->store('medicine-images', 'public');
        }

        Medicine::create($validated);

        return redirect()->route('medicines.index')
            ->with('success', 'Medicine added successfully.');
    }

    /**
     * Display the specified medicine.
     */
    public function show(Medicine $medicine)
    {
        return view('medicines.show', compact('medicine'));
    }

    /**
     * Show the form for editing the specified medicine.
     */
    public function edit(Medicine $medicine)
    {
        $categories = Category::all();
        $suppliers  = Supplier::all();
        $shelves    = Shelf::all();

        return view('medicines.edit', compact('medicine', 'categories', 'suppliers', 'shelves'));
    }

    /**
     * Update the specified medicine.
     */
    public function update(UpdateMedicineRequest $request, Medicine $medicine)
    {
        $validated = $request->validated();

        // Handle image deletion flag
        if ($request->boolean('delete_image')) {
            if ($medicine->image && Storage::disk('public')->exists($medicine->image)) {
                Storage::disk('public')->delete($medicine->image);
            }
            $validated['image'] = null;
        }

        // Handle new image upload (deletes old one)
        if ($request->hasFile('image')) {
            if ($medicine->image && Storage::disk('public')->exists($medicine->image)) {
                Storage::disk('public')->delete($medicine->image);
            }
            $validated['image'] = $request->file('image')
                ->store('medicine-images', 'public');
        }

        $medicine->update($validated);

        return redirect()->route('medicines.index')
            ->with('success', 'Medicine updated successfully.');
    }

    /**
     * Delete the specified medicine.
     */
    public function destroy(Medicine $medicine)
    {
        if ($medicine->image && Storage::disk('public')->exists($medicine->image)) {
            Storage::disk('public')->delete($medicine->image);
        }

        $medicine->delete();

        return redirect()->route('medicines.index')
            ->with('success', 'Medicine deleted successfully');
    }

    /**
     * Generate a barcode label for the specified medicine.
     */
    public function barcodeLabel(Medicine $medicine)
    {
        return view('medicines.barcode-label', compact('medicine'));
    }
}
