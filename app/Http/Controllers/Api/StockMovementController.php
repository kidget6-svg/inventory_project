<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Medicine;
use App\Models\RetailProduct;
use App\Models\StockMovement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use Barryvdh\DomPDF\Facade\Pdf;

class StockMovementController extends Controller
{
    public function index(Request $request)
    {
        try {
            $query = StockMovement::with(['medicine', 'itemable', 'user', 'approver', 'completer']);

            // Branch scoping: pharmacists/cashiers see only their branch's movements
            $user = $request->user();
            if ($user->shouldScopeToBranch()) {
                $query->where('branch_id', $user->branch_id);
            }

            if ($request->medicine_id) {
                $query->where('medicine_id', $request->medicine_id);
            }

            if ($request->type && in_array($request->type, ['in', 'out', 'adjustment', 'return', 'transfer', 'damaged', 'expired', 'lost', 'correction', 'self', 'warehouse'])) {
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
                'medicines' => Medicine::orderBy('name')->get(['id', 'name', 'quantity']),
                'retail_products' => RetailProduct::orderBy('name')->get(['id', 'name', 'sku', 'quantity']),
            ]);

        } catch (\Exception $e) {
            Log::error('StockMovements index error: ' . $e->getMessage());
            return response()->json([
                'error' => $e->getMessage(),
                'message' => 'Failed to load stock movements'
            ], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            // Validate the request
            $validated = $request->validate([
                'type' => 'required|in:in,out,adjustment,return,transfer,damaged,expired,lost,correction,self,warehouse',
                'reference' => 'nullable|string|max:255',
                'notes' => 'nullable|string',
                'source_type' => 'nullable|string|in:self,supplier,branch,sale,customer,warehouse',
                'source_id' => 'nullable|integer',
                'destination_type' => 'nullable|string|in:self,supplier,branch,sale,customer,warehouse',
                'destination_id' => 'nullable|integer',
                'branch_id' => 'nullable|integer',
                'status' => 'nullable|string|in:pending,approved,completed,cancelled',
                'items' => 'nullable|array|min:1',
                'items.*.type' => 'required_with:items|in:medicine,retail',
                'items.*.id' => 'required_with:items|integer|min:1',
                'items.*.quantity' => 'required_with:items|integer|min:1',
                'medicine_id' => 'nullable|exists:medicines,id',
                'retail_product_id' => 'nullable|exists:retail_products,id',
                'quantity' => 'nullable|integer|min:1',
            ]);

            $items = [];
            if (!empty($validated['items']) && is_array($validated['items'])) {
                $items = $validated['items'];
            } elseif (!empty($validated['medicine_id']) || !empty($validated['retail_product_id'])) {
                $type = !empty($validated['retail_product_id']) ? 'retail' : 'medicine';
                $id = !empty($validated['retail_product_id']) ? $validated['retail_product_id'] : $validated['medicine_id'];
                $items = [[
                    'type' => $type,
                    'id' => $id,
                    'quantity' => $validated['quantity'] ?? 1,
                ]];
            }

            if (empty($items)) {
                throw ValidationException::withMessages([
                    'items' => 'At least one product is required.',
                ]);
            }

            $response = DB::transaction(function () use ($validated, $items, $request) {
                $movements = [];
                $updatedProducts = [];

                foreach ($items as $item) {
                    $isRetail = ($item['type'] ?? 'medicine') === 'retail';

                    if ($isRetail) {
                        $product = RetailProduct::lockForUpdate()->findOrFail($item['id']);
                    } else {
                        $product = Medicine::lockForUpdate()->findOrFail($item['id']);
                    }

                    $oldQuantity = (int) $product->quantity;
                    $quantity = (int) ($item['quantity'] ?? 1);

                    if (in_array($validated['type'], ['out', 'damaged', 'expired', 'lost', 'correction'])) {
                        if ($quantity > $oldQuantity) {
                            throw ValidationException::withMessages([
                                'quantity' => "Insufficient stock for {$product->name}. Available: {$oldQuantity}"
                            ]);
                        }
                    }

                    $newQuantity = $oldQuantity;
                    if (in_array($validated['type'], ['in', 'return', 'transfer', 'warehouse'])) {
                        $newQuantity += $quantity;
                    } elseif (in_array($validated['type'], ['out', 'damaged', 'adjustment', 'expired', 'lost', 'correction', 'self'])) {
                        if ($quantity > $oldQuantity) {
                            throw new \Exception("Insufficient stock for {$product->name}. Available: {$oldQuantity}");
                        }
                        $newQuantity -= $quantity;
                    }

                    // Create the movement
                    $movement = StockMovement::create([
                        'medicine_id' => $isRetail ? null : $product->id,
                        'itemable_type' => $isRetail ? RetailProduct::class : Medicine::class,
                        'itemable_id' => $product->id,
                        'user_id' => auth()->id(),
                        'type' => $validated['type'],
                        'quantity' => $quantity,
                        'before_quantity' => $oldQuantity,
                        'after_quantity' => $newQuantity,
                        'reference' => $validated['reference'] ?? null,
                        'notes' => $validated['notes'] ?? null,
                        'source_type' => $validated['source_type'] ?? null,
                        'source_id' => $validated['source_id'] ?? null,
                        'destination_type' => $validated['destination_type'] ?? null,
                        'destination_id' => $validated['destination_id'] ?? null,
                        'branch_id' => $validated['branch_id'] ?? null,
                        'status' => $validated['status'] ?? 'completed',
                        'ip_address' => $request->ip(),
                        'device_info' => $request->userAgent(),
                    ]);

                    // Update product quantity
                    $product->update(['quantity' => $newQuantity]);
                    $updatedProducts[] = $product;

                    $movements[] = $movement->load('medicine', 'itemable', 'user');
                }

                return [
                    'movements' => $movements,
                    'products' => $updatedProducts,
                ];
            });

            return response()->json([
                'success' => true,
                'message' => 'Stock movement recorded successfully',
                'data' => $response
            ], 201);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('StockMovement store error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error recording movement: ' . $e->getMessage()
            ], 500);
        }
    }

    public function show($id)
    {
        try {
            $movement = StockMovement::with(['medicine', 'itemable', 'user', 'approver', 'completer'])->findOrFail($id);
            return response()->json($movement);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Movement not found'
            ], 404);
        }
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
                ['value' => 'warehouse', 'label' => 'Warehouse', 'color' => 'sky', 'icon' => '⌂'],
            ]
        ]);
    }

    public function getSummary(Request $request)
    {
        try {
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
                'total_movements' => (clone $query)->count(),
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
                'total_quantity' => (clone $query)->sum('quantity'),
            ];

            return response()->json($summary);

        } catch (\Exception $e) {
            return response()->json([
                'error' => $e->getMessage(),
                'message' => 'Failed to load summary'
            ], 500);
        }
    }

    public function exportPdf(Request $request)
    {
        try {
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

        } catch (\Exception $e) {
            Log::error('StockMovement export error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to export PDF'
            ], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $movement = StockMovement::with(['medicine', 'itemable'])->findOrFail($id);

            // Resolve the product (medicine or retail product) to revert stock
            $product = $movement->itemable ?? $movement->medicine;

            if ($product) {
                DB::transaction(function () use ($movement, $product) {
                    $qty = (int) $movement->quantity;

                    if (in_array($movement->type, ['in', 'return', 'transfer'])) {
                        $product->quantity = max(0, (int) $product->quantity - $qty);
                    } elseif (in_array($movement->type, ['out', 'damaged', 'expired', 'lost', 'correction', 'self'])) {
                        $product->quantity += $qty;
                    } elseif ($movement->type === 'adjustment') {
                        $product->quantity = $movement->before_quantity ?? $product->quantity;
                    }

                    $product->save();
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