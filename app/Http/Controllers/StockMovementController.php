<?php

namespace App\Http\Controllers;

use App\Models\StockMovement;
use App\Models\Medicine;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class StockMovementController extends Controller
{
    /**
     * Display a listing of stock movements with statistics and filters.
     */
    public function index(Request $request)
    {
        try {
            $query = StockMovement::with(['medicine', 'user']);

            // Filter by search (medicine name, generic name, barcode, or reference)
            if ($request->filled('search')) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->whereHas('medicine', function ($mq) use ($search) {
                        $mq->where('name', 'like', "%{$search}%")
                           ->orWhere('generic_name', 'like', "%{$search}%")
                           ->orWhere('barcode', 'like', "%{$search}%");
                    })
                    ->orWhere('reference', 'like', "%{$search}%")
                    ->orWhere('notes', 'like', "%{$search}%");
                });
            }

            // Filter by movement type (IN, OUT, ADJUSTMENT)
            if ($request->filled('type')) {
                $query->where('type', $request->type);
            }

            // Filter by medicine ID
            if ($request->filled('medicine_id')) {
                $query->where('medicine_id', $request->medicine_id);
            }

            // Filter by date range
            if ($request->filled('start_date')) {
                $query->whereDate('created_at', '>=', $request->start_date);
            }
            if ($request->filled('end_date')) {
                $query->whereDate('created_at', '<=', $request->end_date);
            }

            // Order by most recent movements first
            $movements = $query->latest()->paginate($request->get('per_page', 15));

            // Calculate movement statistics for frontend KPI cards
            $stats = [
                'total_movements'   => StockMovement::count(),
                'total_in'          => StockMovement::where('type', 'IN')->count(),
                'total_out'         => StockMovement::where('type', 'OUT')->count(),
                'total_adjustments' => StockMovement::where('type', 'ADJUSTMENT')->count(),
                'qty_in'            => (int) StockMovement::where('type', 'IN')->sum('quantity'),
                'qty_out'           => (int) StockMovement::where('type', 'OUT')->sum('quantity'),
            ];

            return response()->json([
                'movements' => $movements,
                'stats'     => $stats,
            ], 200);

        } catch (\Exception $e) {
            Log::error('StockMovement Index Error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to fetch stock movements: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly recorded stock movement in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'medicine_id'      => 'required|exists:medicines,id',
            'type'             => 'required|in:in,out,adjustment,return,transfer,damaged,expired,lost,correction,self,warehouse',
            'quantity'         => 'required|integer|min:1',
            'reference'        => 'nullable|string|max:255',
            'notes'            => 'nullable|string|max:1000',
            'source_type'      => 'nullable|string|in:self,supplier,branch,sale,customer,warehouse',
            'source_id'        => 'nullable|integer',
            'destination_type' => 'nullable|string|in:self,supplier,branch,sale,customer,warehouse',
            'destination_id'   => 'nullable|integer',
            'branch_id'        => 'nullable|integer',
            'status'           => 'nullable|string|in:pending,approved,completed,cancelled',
        ]);

        try {
            return DB::transaction(function () use ($validated, $request) {
                $medicine = Medicine::lockForUpdate()->findOrFail($validated['medicine_id']);
                $qty = (int) $validated['quantity'];
                $oldQuantity = (int) $medicine->quantity;

                if (in_array($validated['type'], ['in', 'return', 'transfer', 'warehouse'])) {
                    $medicine->quantity += $qty;
                } elseif (in_array($validated['type'], ['out', 'damaged', 'expired', 'lost', 'correction', 'self'])) {
                    if ($medicine->quantity < $qty) {
                        return response()->json([
                            'message' => 'Insufficient stock for outward movement. Available stock: ' . $medicine->quantity
                        ], 422);
                    }
                    $medicine->quantity -= $qty;
                } elseif ($validated['type'] === 'adjustment') {
                    $medicine->quantity = $qty;
                }

                $medicine->save();

                $movement = StockMovement::create([
                    'medicine_id'      => $validated['medicine_id'],
                    'user_id'          => Auth::id() ?? 1,
                    'type'             => $validated['type'],
                    'quantity'         => $qty,
                    'before_quantity'  => $oldQuantity,
                    'after_quantity'   => $medicine->quantity,
                    'reference'        => $validated['reference'] ?? null,
                    'notes'            => $validated['notes'] ?? null,
                    'source_type'      => $validated['source_type'] ?? null,
                    'source_id'        => $validated['source_id'] ?? null,
                    'destination_type' => $validated['destination_type'] ?? null,
                    'destination_id'   => $validated['destination_id'] ?? null,
                    'branch_id'        => $validated['branch_id'] ?? null,
                    'status'           => $validated['status'] ?? 'pending',
                    'ip_address'       => $request->ip(),
                    'device_info'      => $request->userAgent(),
                ]);

                return response()->json([
                    'message'  => 'Stock movement recorded successfully',
                    'movement' => $movement->load('medicine', 'user'),
                    'medicine' => $medicine,
                ], 201);
            });

        } catch (\Throwable $e) {
            Log::error('StockMovement Store Error: ' . $e->getMessage(), [
                'trace'   => $e->getTraceAsString(),
                'request' => $request->all(),
            ]);

            return response()->json([
                'message' => 'Failed to record stock movement.',
                'error'   => config('app.debug') ? $e->getMessage() : 'Internal server error.',
            ], 500);
        }
    }

    /**
     * Display specified stock movement details.
     */
    public function show($id)
    {
        try {
            $movement = StockMovement::with(['medicine', 'user'])->findOrFail($id);

            return response()->json([
                'data' => $movement
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Stock movement not found.'
            ], 404);
        }
    }

    /**
     * Remove the specified stock movement and revert medicine stock.
     */
    public function destroy($id)
    {
        try {
            $movement = StockMovement::with('medicine')->findOrFail($id);

            if ($movement->medicine) {
                DB::transaction(function () use ($movement) {
                    $medicine = $movement->medicine;
                    $qty = (int) $movement->quantity;

                    if (in_array($movement->type, ['IN', 'in', 'return', 'transfer'])) {
                        $medicine->quantity = max(0, (int) $medicine->quantity - $qty);
                    } elseif (in_array($movement->type, ['OUT', 'out', 'damaged', 'expired', 'lost', 'correction', 'self'])) {
                        $medicine->quantity += $qty;
                    } elseif ($movement->type === 'ADJUSTMENT' || $movement->type === 'adjustment') {
                        $medicine->quantity = $movement->before_quantity ?? $medicine->quantity;
                    }

                    $medicine->save();
                });
            }

            $movement->delete();

            return response()->json([
                'message' => 'Stock movement deleted and stock reverted successfully'
            ], 200);

        } catch (\Exception $e) {
            Log::error('StockMovement Delete Error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to delete stock movement.',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error.',
            ], 500);
        }
    }
}
