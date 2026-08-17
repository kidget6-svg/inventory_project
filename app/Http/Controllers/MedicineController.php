<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreMedicineRequest;
use App\Http\Requests\UpdateMedicineRequest;
use App\Models\Medicine;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class MedicineController extends Controller
{
    /**
     * Display a listing of medicines.
     */
    public function index(Request $request)
    {
        try {
            // Retrieve medicines safely without breaking on missing relationships
            $medicines = Medicine::query()
                ->when($request->filled('search'), function ($q) use ($request) {
                    $search = $request->search;
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('generic_name', 'like', "%{$search}%")
                      ->orWhere('shelf_location', 'like', "%{$search}%");
                })
                ->latest()
                ->get();

            return response()->json([
                'success' => true,
                'data'    => $medicines
            ], 200);

        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Database Query Error: ' . $e->getMessage(),
                'file'    => $e->getFile(),
                'line'    => $e->getLine()
            ], 500);
        }
    }

    /**
     * Store a newly created medicine.
     */
    public function store(Request $request)
    {
        try {
            // Validation rules matching nullable database fields
            $validated = $request->validate([
                'name'           => 'required|string|max:255',
                'generic_name'   => 'nullable|string|max:255',
                'category_id'    => 'nullable',
                'status'         => 'required|in:active,inactive,expired,discontinued',
                'shelf_location' => 'nullable|string|max:100',
                'description'    => 'nullable|string',
                'barcode'        => 'nullable|string|max:100',
            ]);

            $medicine = Medicine::create($validated);

            return response()->json([
                'success'  => true,
                'message'  => 'Medicine created successfully',
                'data'     => $medicine
            ], 201);

        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation Error',
                'errors'  => $e->errors()
            ], 422);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Save Error: ' . $e->getMessage()
            ], 500);
        }
    }
}
