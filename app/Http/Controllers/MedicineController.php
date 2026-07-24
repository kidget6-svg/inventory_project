<?php

namespace App\Http\Controllers;

use App\Models\Medicine;
use App\Models\Category;
use Illuminate\Http\Request;

class MedicineController extends Controller
{
   public function index()
{
    $medicines = Medicine::with('category')
        ->latest()
        ->get();

    return view('medicines.index', compact('medicines'));
}


    public function create()
    {
        $categories = Category::all();

        return view('medicines.create', compact('categories'));
    }


    public function store(Request $request)
    {
        $validated = $request->validate($this->medicineRules());

        Medicine::create($validated);

        return redirect()
            ->route('medicines.index')
            ->with('success', 'Medicine added successfully.');
    }


    public function edit(Medicine $medicine)
    {
        $categories = Category::all();

        return view('medicines.edit', compact('medicine', 'categories'));
    }


    public function update(Request $request, Medicine $medicine)
    {
        $validated = $request->validate($this->medicineRules());

        $medicine->update($validated);

        return redirect()
            ->route('medicines.index')
            ->with('success', 'Medicine updated successfully.');
    }


   public function destroy(Medicine $medicine)
{
    $medicine->delete();

    return redirect()
        ->route('medicines.index')
        ->with('success','Medicine deleted successfully');
}

    private function medicineRules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'generic_name' => 'nullable|string|max:255',
            'batch_number' => 'nullable|string|max:255',
            'category_id' => 'required|exists:categories,id',
            'quantity' => 'required|integer|min:0',
            'unit_price' => 'required|numeric|min:0',
            'reorder_level' => 'required|integer|min:0',
            'expiry_date' => 'nullable|date',
        ];
    }
}