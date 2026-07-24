<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Medicine;
use App\Models\StockMovement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class StockMovementController extends Controller
{
    public function index()
    {
        $medicines = Medicine::orderBy('name')->get();
        $movements = StockMovement::with('medicine')->latest()->get();
        return response()->json(['medicines' => $medicines, 'movements' => $movements]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'medicine_id' => 'required|exists:medicines,id',
            'type' => 'required|in:in,out',
            'quantity' => 'required|integer|min:1',
            'reference' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
        ]);

        DB::beginTransaction();

        try {
            $medicine = Medicine::lockForUpdate()->find($validated['medicine_id']);

            if ($validated['type'] === 'out' && $medicine->quantity < $validated['quantity']) {
                DB::rollBack();
                return response()->json(['message' => 'Insufficient stock'], 422);
            }

            if ($validated['type'] === 'in') {
                $medicine->increment('quantity', $validated['quantity']);
            } else {
                $medicine->decrement('quantity', $validated['quantity']);
            }

            $movement = StockMovement::create($validated);

            DB::commit();

            return response()->json($movement->load('medicine'), 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Error: ' . $e->getMessage()], 500);
        }
    }
}
