<?php

namespace App\Http\Controllers;

use App\Models\Medicine;
use App\Models\StockMovement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class StockMovementController extends Controller
{
    public function index()
    {
        $medicines = Medicine::orderBy('name')->get();

        $movements = StockMovement::with('medicine')
            ->latest()
            ->get();

        return view('stock-movements.index', compact('medicines', 'movements'));
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

        DB::transaction(function () use ($validated) {
            $medicine = Medicine::lockForUpdate()->findOrFail($validated['medicine_id']);

            if ($validated['type'] === 'out' && $validated['quantity'] > $medicine->quantity) {
                throw ValidationException::withMessages([
                    'quantity' => 'There is not enough medicine in stock.',
                ]);
            }

            StockMovement::create($validated);

            if ($validated['type'] === 'in') {
                $medicine->increment('quantity', $validated['quantity']);
            } else {
                $medicine->decrement('quantity', $validated['quantity']);
            }
        });

        return redirect()
            ->route('stock-movements.index')
            ->with('success', 'Stock movement recorded successfully.');
    }
}