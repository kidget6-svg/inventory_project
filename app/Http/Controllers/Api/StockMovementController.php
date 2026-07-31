<?php

namespace App\Http\Controllers\Api;

use App\Models\Medicine;
use App\Models\StockMovement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class StockMovementController extends Controller
{
    public function index(Request $request)
    {
        $query = StockMovement::with(['medicine', 'user']);

        // Filter by medicine
        if ($request->medicine_id) {
            $query->where('medicine_id', $request->medicine_id);
        }

        // Filter by type
        if ($request->type && in_array($request->type, ['in', 'out', 'adjustment', 'return', 'damaged'])) {
            $query->where('type', $request->type);
        }

        // Date range filter
        if ($request->start_date) {
            $query->whereDate('created_at', '>=', $request->start_date);
        }
        if ($request->end_date) {
            $query->whereDate('created_at', '<=', $request->end_date);
        }

        $movements = $query->latest()->limit(100)->get();

        return response()->json([
            'movements' => $movements,
            'medicines' => Medicine::orderBy('name')->get(['id', 'name', 'quantity'])
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'medicine_id' => 'required|exists:medicines,id',
            'type' => 'required|in:in,out,adjustment,return,damaged',
            'quantity' => 'required|integer|min:1',
            'reference' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
        ]);

        $response = DB::transaction(function () use ($validated) {
            $medicine = Medicine::lockForUpdate()->findOrFail($validated['medicine_id']);

            // Check for stock out
            if (in_array($validated['type'], ['out', 'damaged'])) {
                if ($validated['quantity'] > $medicine->quantity) {
                    throw ValidationException::withMessages([
                        'quantity' => "Insufficient stock. Available: {$medicine->quantity}"
                    ]);
                }
            }

            // Create movement record
            $movement = StockMovement::create([
                'medicine_id' => $validated['medicine_id'],
                'type' => $validated['type'],
                'quantity' => $validated['quantity'],
                'reference' => $validated['reference'] ?? null,
                'notes' => $validated['notes'] ?? null,
                'user_id' => auth()->id(),
                'before_quantity' => $medicine->quantity,
                'after_quantity' => 0, // Will be updated
            ]);

            // Update medicine quantity
            $newQuantity = $medicine->quantity;
            if (in_array($validated['type'], ['in', 'return'])) {
                $newQuantity += $validated['quantity'];
            } else if (in_array($validated['type'], ['out', 'damaged', 'adjustment'])) {
                $newQuantity -= $validated['quantity'];
            }

            $medicine->update(['quantity' => $newQuantity]);

            // Update movement with after quantity
            $movement->update(['after_quantity' => $newQuantity]);

            return [
                'movement' => $movement->load('medicine'),
                'medicine' => $medicine
            ];
        });

        return response()->json([
            'message' => 'Stock movement recorded successfully',
            'data' => $response
        ]);
    }

    public function show($id)
    {
        $movement = StockMovement::with(['medicine', 'user'])->findOrFail($id);
        return response()->json($movement);
    }

    public function getTypes()
    {
        return response()->json([
            'types' => [
                'in' => 'Stock In',
                'out' => 'Stock Out',
                'adjustment' => 'Adjustment',
                'return' => 'Return',
                'damaged' => 'Damaged'
            ]
        ]);
    }

    public function getSummary()
    {
        $summary = [
            'total_in' => StockMovement::where('type', 'in')->sum('quantity'),
            'total_out' => StockMovement::where('type', 'out')->sum('quantity'),
            'total_adjustments' => StockMovement::where('type', 'adjustment')->sum('quantity'),
            'total_returns' => StockMovement::where('type', 'return')->sum('quantity'),
            'total_damaged' => StockMovement::where('type', 'damaged')->sum('quantity'),
        ];

        return response()->json($summary);
    }
}