<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Branch;
use App\Models\Medicine;
use App\Models\Batch;
use App\Models\Shelf;
use App\Models\PurchaseOrder;
use App\Models\StockMovement;
use App\Models\StockTransfer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class WarehouseController extends Controller
{
public function stats(Request $request)
    {
        $user = $request->user();
        $branchScope = $user->getBranchScope();

        $totalMedicines = Medicine::when($branchScope, function ($query) use ($branchScope) {
            return $query->where('branch_id', $branchScope);
        })->count();
        $totalStock = Medicine::when($branchScope, function ($query) use ($branchScope) {
            return $query->where('branch_id', $branchScope);
        })->sum('quantity');
        $totalShelves = Shelf::when($branchScope, function ($query) use ($branchScope) {
            return $query->where('branch_id', $branchScope);
        })->count();
        $usedShelves = Shelf::when($branchScope, function ($query) use ($branchScope) {
            return $query->where('branch_id', $branchScope);
        })->whereHas('medicines')->count();
        $lowStock = Medicine::when($branchScope, function ($query) use ($branchScope) {
            return $query->where('branch_id', $branchScope);
        })->whereColumn('quantity', '<=', 'reorder_level')->count();
        $pendingRequests = StockTransfer::when($branchScope, function ($query) use ($branchScope) {
            return $query->where(function ($q) use ($branchScope) {
                $q->where('to_branch_id', $branchScope)
                    ->orWhere('from_branch_id', $branchScope);
            });
        })->where('status', 'pending')->count();

        return response()->json([
            'total_medicines' => $totalMedicines,
            'total_stock' => $totalStock,
            'total_shelves' => $totalShelves,
            'used_shelves' => $usedShelves,
            'low_stock' => $lowStock,
            'pending_requests' => $pendingRequests,
        ]);
    }

    public function shelves(Request $request)
    {
        $user = $request->user();

        // Warehouse page shows ONLY warehouse shelves.
        $shelves = Shelf::where('location_type', Shelf::LOCATION_WAREHOUSE)
            ->withCount(['medicines', 'retailProducts'])
            ->get()
            ->map(function ($shelf) {
                $capacity = $shelf->capacity ?? 100;
                $current = $shelf->current_quantity ?? 0;
                return [
                    'id' => $shelf->id,
                    'name' => $shelf->name,
                    'code' => $shelf->code,
                    'shelf_location' => $shelf->shelf_location,
                    'location_type' => $shelf->location_type,
                    'product_type' => $shelf->product_type,
                    'branch_id' => $shelf->branch_id,
                    'warehouse_id' => $shelf->warehouse_id,
                    'capacity' => $capacity,
                    'current_quantity' => $current,
                    'current_items' => $current,
                    'remaining_capacity' => max(0, $capacity - $current),
                    'utilization' => $capacity > 0 ? min(100, round(($current / $capacity) * 100)) : 0,
                    'occupancy_status' => $shelf->occupancy_status,
                    'occupancy_status_label' => $shelf->occupancy_status_label,
                    'status' => $shelf->status ?? 'active',
                ];
            });

        return response()->json($shelves);
    }

    public function stock(Request $request)
    {
        $user = $request->user();
        $branchScope = $user->getBranchScope();

        $query = Medicine::when($branchScope, function ($query) use ($branchScope) {
            return $query->where('branch_id', $branchScope);
        })->with(['category', 'supplier', 'shelf']);

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('generic_name', 'like', "%{$search}%");
            });
        }

        $stock = $query->paginate(20);
        return response()->json($stock);
    }

    public function receive(Request $request)
    {
        try {
            $validated = $request->validate([
                'purchase_order_id' => 'required|exists:purchase_orders,id',
                'batch_number' => 'required|string|max:255',
                'barcode' => 'nullable|string|max:255',
                'manufacturer' => 'nullable|string|max:255',
                'expiry_date' => 'required|date|after:today',
                'quantity' => 'required|integer|min:1',
                'shelf_id' => 'nullable|exists:shelves,id',
            ]);

            $po = PurchaseOrder::findOrFail($validated['purchase_order_id']);
            $item = $po->items()->first();
            $medicine = Medicine::findOrFail($item->medicine_id);

            // Received stock MUST go onto a warehouse shelf only.
            $shelf = null;
            if (!empty($validated['shelf_id'])) {
                $shelf = Shelf::findOrFail($validated['shelf_id']);
                if ($shelf->location_type !== Shelf::LOCATION_WAREHOUSE) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Received stock can only be placed on a warehouse shelf.',
                    ], 422);
                }
            }

            // Create batch
            $batch = Batch::create([
                'medicine_id' => $medicine->id,
                'batch_number' => $validated['batch_number'],
                'barcode' => $validated['barcode'] ?? null,
                'manufacturer' => $validated['manufacturer'] ?? null,
                'expiry_date' => $validated['expiry_date'],
                'quantity' => $validated['quantity'],
                'shelf_id' => $validated['shelf_id'] ?? null,
                'received_by' => auth()->id(),
                'purchase_order_id' => $po->id,
                'received_at' => now(),
            ]);

            // Update medicine quantity and shelf
            $oldQuantity = $medicine->quantity;
            $medicine->quantity += $validated['quantity'];
            if (!empty($validated['shelf_id'])) {
                $medicine->shelf_id = $validated['shelf_id'];
            }
            $medicine->save();

            // Enforce shelf capacity on the warehouse shelf.
            if ($shelf) {
                $shelf->addStock($validated['quantity']);
            }

            // Create stock movement
            StockMovement::create([
                'medicine_id' => $medicine->id,
                'batch_id' => $batch->id,
                'type' => 'in',
                'quantity' => $validated['quantity'],
                'before_quantity' => $oldQuantity,
                'after_quantity' => $medicine->quantity,
                'manufacturer' => $validated['manufacturer'] ?? null,
                'user_id' => auth()->id(),
                'source_type' => 'supplier',
                'source_id' => $po->supplier_id,
                'reference' => 'PO-' . $po->id,
                'status' => 'completed',
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Stock received successfully',
                'data' => $batch
            ], 201);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'errors' => $e->errors()
            ], 422);
        }
    }

    public function transferRequests(Request $request)
    {
        $user = $request->user();
        $branchScope = $user->getBranchScope();

        $query = StockTransfer::when($branchScope, function ($query) use ($branchScope) {
            return $query->where(function ($q) use ($branchScope) {
                $q->where('to_branch_id', $branchScope)
                    ->orWhere('from_branch_id', $branchScope);
            });
        });

        $transfers = $query->with(['medicine', 'fromBranch', 'toBranch', 'requestedBy'])
            ->latest()
            ->get();

        return response()->json($transfers);
    }

    public function approveTransfer($id)
    {
        $transfer = StockTransfer::findOrFail($id);
        $transfer->status = 'approved';
        $transfer->approved_by = auth()->id();
        $transfer->save();

        return response()->json([
            'success' => true,
            'message' => 'Transfer approved successfully'
        ]);
    }

    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'medicine_id' => 'required|exists:medicines,id',
                'to_branch_id' => 'required|exists:branches,id',
                'quantity' => 'required|integer|min:1',
                'priority' => 'nullable|in:low,medium,high,urgent',
                'expected_delivery' => 'nullable|date',
                'notes' => 'nullable|string|max:1000',
            ]);

            $toBranch = Branch::findOrFail($validated['to_branch_id']);
            $user = $request->user();

            $transfer = StockTransfer::create([
                'medicine_id' => $validated['medicine_id'],
                'from_branch_id' => $user->branch_id ?? null,
                'to_branch_id' => $validated['to_branch_id'],
                'from_location' => $user->branch ? $user->branch->name : 'Central Warehouse',
                'to_location' => $toBranch->name,
                'quantity' => $validated['quantity'],
                'status' => StockTransfer::STATUS_PENDING,
                'priority' => $validated['priority'] ?? StockTransfer::PRIORITY_MEDIUM,
                'expected_delivery' => $validated['expected_delivery'] ?? null,
                'notes' => $validated['notes'] ?? null,
                'requested_by' => $user->id,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Transfer request created successfully',
                'data' => $transfer->load(['medicine', 'toBranch', 'requestedBy'])
            ], 201);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'errors' => $e->errors()
            ], 422);
        }
    }

    public function shelfItems($id)
    {
        $shelf = Shelf::findOrFail($id);
        $items = $shelf->medicines()->with('category')->orderBy('name')->get();

        return response()->json([
            'shelf' => $shelf,
            'items' => $items,
            'total_items' => $items->sum('quantity'),
            'item_count' => $items->count(),
        ]);
    }

    public function completeTransfer(Request $request, $id)
    {
        try {
            $transfer = StockTransfer::with('medicine')->findOrFail($id);

            if ($transfer->status === StockTransfer::STATUS_COMPLETED) {
                return response()->json(['success' => true, 'message' => 'Transfer already completed']);
            }

            $validated = $request->validate([
                'shelf_id' => 'required|exists:shelves,id',
            ]);

            // Validate the destination shelf BEFORE touching any stock.
            $destShelf = Shelf::findOrFail($validated['shelf_id']);
            if ($destShelf->location_type !== Shelf::LOCATION_BRANCH) {
                throw ValidationException::withMessages([
                    'shelf_id' => 'Destination shelf must be a branch shelf.',
                ]);
            }
            if ((int) $destShelf->branch_id !== (int) $transfer->to_branch_id) {
                throw ValidationException::withMessages([
                    'shelf_id' => 'Destination shelf does not belong to the destination branch.',
                ]);
            }
            if ($destShelf->product_type !== Shelf::PRODUCT_MEDICINE) {
                throw ValidationException::withMessages([
                    'shelf_id' => 'Destination shelf is not a medicine shelf for this branch.',
                ]);
            }

            DB::transaction(function () use ($transfer, $destShelf) {
                $source = $transfer->medicine;
                $qty = (int) $transfer->quantity;

                if (!$source) {
                    throw new \Exception('Transfer medicine not found');
                }

                if ($source->quantity < $qty) {
                    throw ValidationException::withMessages([
                        'quantity' => "Insufficient stock for {$source->name}. Available: {$source->quantity}"
                    ]);
                }

                // Free capacity on the source shelf (warehouse or branch) if it sits on one.
                if ($source->shelf_id) {
                    $srcShelf = Shelf::find($source->shelf_id);
                    if ($srcShelf) {
                        $srcShelf->removeStock($qty);
                    }
                }

                // Decrement source (warehouse or branch) stock
                $sourceOld = $source->quantity;
                $source->quantity -= $qty;
                $source->save();

                // Find or create the destination medicine for the target branch
                $dest = Medicine::where('branch_id', $transfer->to_branch_id)
                    ->where('name', $source->name)
                    ->first();

                if ($dest) {
                    $destOld = $dest->quantity;
                    $dest->quantity += $qty;
                    $dest->shelf_id = $destShelf->id;
                    $dest->save();
                } else {
                    $dest = Medicine::create([
                        'name' => $source->name,
                        'generic_name' => $source->generic_name,
                        'category_id' => $source->category_id,
                        'reorder_level' => $source->reorder_level,
                        'status' => $source->status,
                        'description' => $source->description,
                        'dosage_form' => $source->dosage_form,
                        'strength' => $source->strength,
                        'unit' => $source->unit,
                        'batch_number' => $source->batch_number,
                        'manufacturer' => $source->manufacturer,
                        'quantity' => $qty,
                        'branch_id' => $transfer->to_branch_id,
                        'shelf_id' => $destShelf->id,
                    ]);
                    $destOld = 0;
                }

                // Enforce destination shelf capacity.
                $destShelf->addStock($qty);

                // Source outgoing movement
                StockMovement::create([
                    'medicine_id' => $source->id,
                    'itemable_type' => Medicine::class,
                    'itemable_id' => $source->id,
                    'type' => 'out',
                    'quantity' => $qty,
                    'before_quantity' => $sourceOld,
                    'after_quantity' => $source->quantity,
                    'manufacturer' => $source->manufacturer,
                    'user_id' => auth()->id(),
                    'source_type' => $transfer->from_branch_id ? 'branch' : 'warehouse',
                    'source_id' => $transfer->from_branch_id,
                    'destination_type' => 'branch',
                    'destination_id' => $transfer->to_branch_id,
                    'reference' => 'TRANSFER-' . $transfer->id,
                    'status' => 'completed',
                ]);

                // Destination incoming movement
                StockMovement::create([
                    'medicine_id' => $dest->id,
                    'itemable_type' => Medicine::class,
                    'itemable_id' => $dest->id,
                    'type' => 'in',
                    'quantity' => $qty,
                    'before_quantity' => $destOld,
                    'after_quantity' => $dest->quantity,
                    'manufacturer' => $source->manufacturer,
                    'user_id' => auth()->id(),
                    'source_type' => $transfer->from_branch_id ? 'branch' : 'warehouse',
                    'source_id' => $transfer->from_branch_id,
                    'destination_type' => 'branch',
                    'destination_id' => $transfer->to_branch_id,
                    'branch_id' => $transfer->to_branch_id,
                    'reference' => 'TRANSFER-' . $transfer->id,
                    'status' => 'completed',
                ]);

                // Mark transfer complete
                $transfer->status = StockTransfer::STATUS_COMPLETED;
                $transfer->completed_by = auth()->id();
                $transfer->actual_delivery = now();
                $transfer->save();
            });

            return response()->json([
                'success' => true,
                'message' => 'Transfer completed and stock updated for the destination branch'
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 422);
        }
    }

    public function receivingHistory(Request $request)
    {
        $user = $request->user();
        $branchScope = $user->getBranchScope();

        $query = StockMovement::where('type', 'in');

        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }
        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        $query->when($branchScope, function ($query) use ($branchScope) {
            return $query->where('branch_id', $branchScope);
        });

        $history = $query->with(['medicine', 'user', 'itemable', 'supplier'])
            ->latest()
            ->paginate(20);
        return response()->json($history);
    }
}