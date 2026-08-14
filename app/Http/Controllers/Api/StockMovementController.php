<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Medicine;
use App\Models\StockMovement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Barryvdh\DomPDF\Facade\Pdf;

class StockMovementController extends Controller
{
    public function index(Request $request)
    {
        $query = StockMovement::with(['medicine', 'user', 'approver', 'completer']);

        if ($request->medicine_id) {
            $query->where('medicine_id', $request->medicine_id);
        }

        if ($request->type && in_array($request->type, ['in', 'out', 'adjustment', 'return', 'transfer', 'damaged', 'expired', 'lost', 'correction', 'self'])) {
            $query->where('type', $request->type);
        }

        if ($request->source_type) {
            $query->where('source_type', $request->source_type);
        }
        if ($request->destination_type) {
            $query->where('destination_type', $request->destination_type);
        }
        if ($request->is_self) {
            $query->where(function ($q) {
                $q->where('source_type', 'self')->orWhere('destination_type', 'self');
            });
        }

        if ($request->start_date) {
            $query->whereDate('created_at', '>=', $request->start_date);
        }
        if ($request->end_date) {
            $query->whereDate('created_at', '<=', $request->end_date);
        }

        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('reference', 'like', "%{$request->search}%")
                  ->orWhere('notes', 'like', "%{$request->search}%");
            });
        }

        $movements = $query->latest()->paginate(50);

        return response()->json([
            'movements' => $movements,
            'medicines' => Medicine::orderBy('name')->get(['id', 'name', 'quantity'])
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'medicine_id' => 'required|exists:medicines,id',
            'type' => 'required|in:in,out,adjustment,return,transfer,damaged,expired,lost,correction,self',
            'quantity' => 'required|integer|min:1',
            'reference' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
            'source_type' => 'nullable|string|in:self,supplier,branch,sale,customer',
            'source_id' => 'nullable|integer',
            'destination_type' => 'nullable|string|in:self,supplier,branch,sale,customer',
            'destination_id' => 'nullable|integer',
            'branch_id' => 'nullable|integer',
            'status' => 'nullable|string|in:pending,approved,completed,cancelled',
        ]);

        $response = DB::transaction(function () use ($validated, $request) {
            $medicine = Medicine::lockForUpdate()->findOrFail($validated['medicine_id']);
            $oldQuantity = $medicine->quantity;

            if (in_array($validated['type'], ['out', 'damaged', 'expired', 'lost', 'correction'])) {
                if ($validated['quantity'] > $medicine->quantity) {
                    throw ValidationException::withMessages([
                        'quantity' => "Insufficient stock. Available: {$medicine->quantity}"
                    ]);
                }
            }

            $newQuantity = $oldQuantity;
            if (in_array($validated['type'], ['in', 'return', 'transfer'])) {
                $newQuantity += $validated['quantity'];
            } else if (in_array($validated['type'], ['out', 'damaged', 'adjustment', 'expired', 'lost', 'correction', 'self'])) {
                $newQuantity -= $validated['quantity'];
            }

            $movement = StockMovement::create([
                'medicine_id' => $validated['medicine_id'],
                'user_id' => auth()->id(),
                'type' => $validated['type'],
                'quantity' => $validated['quantity'],
                'before_quantity' => $oldQuantity,
                'after_quantity' => $newQuantity,
                'reference' => $validated['reference'] ?? null,
                'notes' => $validated['notes'] ?? null,
                'source_type' => $validated['source_type'] ?? null,
                'source_id' => $validated['source_id'] ?? null,
                'destination_type' => $validated['destination_type'] ?? null,
                'destination_id' => $validated['destination_id'] ?? null,
                'branch_id' => $validated['branch_id'] ?? null,
                'status' => $validated['status'] ?? 'pending',
                'ip_address' => $request->ip(),
                'device_info' => $request->userAgent(),
            ]);

            $medicine->update(['quantity' => $newQuantity]);

            return [
                'movement' => $movement->load('medicine', 'user', 'approver', 'completer'),
                'medicine' => $medicine
            ];
        });

        return response()->json([
            'message' => 'Stock movement recorded successfully',
            'data' => $response
        ], 201);
    }

    public function show($id)
    {
        $movement = StockMovement::with(['medicine', 'user', 'approver', 'completer'])->findOrFail($id);
        return response()->json($movement);
    }

    public function getTypes()
    {
        return response()->json([
            'types' => [
                ['value' => 'in', 'label' => 'Stock In', 'color' => 'green', 'icon' => '↓'],
                ['value' => 'out', 'label' => 'Stock Out', 'color' => 'red', 'icon' => '↑'],
                ['value' => 'adjustment', 'label' => 'Adjustment', 'color' => 'orange', 'icon' => '↔'],
                ['value' => 'return', 'label' => 'Return', 'color' => 'blue', 'icon' => '↩'],
                ['value' => 'transfer', 'label' => 'Transfer', 'color' => 'purple', 'icon' => '⇄'],
                ['value' => 'damaged', 'label' => 'Damaged', 'color' => 'red', 'icon' => '✕'],
                ['value' => 'expired', 'label' => 'Expired', 'color' => 'gray', 'icon' => '⏳'],
                ['value' => 'lost', 'label' => 'Lost', 'color' => 'orange', 'icon' => '?'],
                ['value' => 'correction', 'label' => 'Correction', 'color' => 'sky', 'icon' => '✓'],
                ['value' => 'self', 'label' => 'Self Adjustment', 'color' => 'emerald', 'icon' => '↻'],
            ]
        ]);
    }

    public function getSummary(Request $request)
    {
        $query = StockMovement::query();

        if ($request->start_date) {
            $query->whereDate('created_at', '>=', $request->start_date);
        }
        if ($request->end_date) {
            $query->whereDate('created_at', '<=', $request->end_date);
        }

        if ($request->medicine_id) {
            $query->where('medicine_id', $request->medicine_id);
        }

        $summary = [
            'total_in' => (clone $query)->where('type', 'in')->sum('quantity'),
            'total_out' => (clone $query)->where('type', 'out')->sum('quantity'),
            'total_adjustments' => (clone $query)->where('type', 'adjustment')->sum('quantity'),
            'total_returns' => (clone $query)->where('type', 'return')->sum('quantity'),
            'total_transfers' => (clone $query)->where('type', 'transfer')->sum('quantity'),
            'total_damaged' => (clone $query)->where('type', 'damaged')->sum('quantity'),
            'total_expired' => (clone $query)->where('type', 'expired')->sum('quantity'),
            'total_lost' => (clone $query)->where('type', 'lost')->sum('quantity'),
            'total_corrections' => (clone $query)->where('type', 'correction')->sum('quantity'),
            'total_self' => (clone $query)->where('type', 'self')->sum('quantity'),
            'total_movements' => (clone $query)->count(),
        ];

        return response()->json($summary);
    }

    public function exportPdf(Request $request)
    {
        $query = StockMovement::with(['medicine', 'user']);

        if ($request->start_date) {
            $query->whereDate('created_at', '>=', $request->start_date);
        }
        if ($request->end_date) {
            $query->whereDate('created_at', '<=', $request->end_date);
        }
        if ($request->medicine_id) {
            $query->where('medicine_id', $request->medicine_id);
        }
        if ($request->type) {
            $query->where('type', $request->type);
        }

        $movements = $query->latest()->get();

        $summary = [
            'total_in' => (clone $query)->where('type', 'in')->sum('quantity'),
            'total_out' => (clone $query)->where('type', 'out')->sum('quantity'),
            'total_adjustments' => (clone $query)->where('type', 'adjustment')->sum('quantity'),
            'total_returns' => (clone $query)->where('type', 'return')->sum('quantity'),
            'total_transfers' => (clone $query)->where('type', 'transfer')->sum('quantity'),
            'total_damaged' => (clone $query)->where('type', 'damaged')->sum('quantity'),
            'total_expired' => (clone $query)->where('type', 'expired')->sum('quantity'),
            'total_lost' => (clone $query)->where('type', 'lost')->sum('quantity'),
            'total_corrections' => (clone $query)->where('type', 'correction')->sum('quantity'),
            'total_self' => (clone $query)->where('type', 'self')->sum('quantity'),
        ];

        $pdf = Pdf::loadView('reports.stock-movements', compact('movements', 'summary', 'request'));

        return $pdf->download('stock-movements-report.pdf');
    }

    public function destroy($id)
    {
        try {
            $movement = StockMovement::with('medicine')->findOrFail($id);

            if ($movement->medicine) {
                DB::transaction(function () use ($movement) {
                    $medicine = $movement->medicine;
                    $qty = (int) $movement->quantity;

                    if (in_array($movement->type, ['in', 'return', 'transfer'])) {
                        $medicine->quantity = max(0, (int) $medicine->quantity - $qty);
                    } elseif (in_array($movement->type, ['out', 'damaged', 'expired', 'lost', 'correction', 'self'])) {
                        $medicine->quantity += $qty;
                    } elseif ($movement->type === 'adjustment') {
                        $medicine->quantity = $movement->before_quantity ?? $medicine->quantity;
                    }

                    $medicine->save();
                });
            }

            $movement->delete();

            return response()->json([
                'message' => 'Stock movement deleted and stock reverted successfully'
            ], 200);

        } catch (\Throwable $e) {
            Log::error('StockMovement Delete Error: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
                'id' => $id,
            ]);

            return response()->json([
                'message' => 'Failed to delete stock movement.',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error.',
            ], 500);
        }
    }
}
