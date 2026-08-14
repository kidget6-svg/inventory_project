<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Medicine;
use App\Models\Batch;
use App\Models\Shelf;
use App\Models\PurchaseOrder;
use App\Models\StockMovement;
use App\Models\StockTransfer;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class WarehouseController extends Controller
{
    public function stats()
    {
        $totalMedicines = Medicine::count();
        $totalStock = Medicine::sum('quantity');
        $totalShelves = Shelf::count();
        $usedShelves = Shelf::whereHas('medicines')->count();
        $lowStock = Medicine::whereColumn('quantity', '<=', 'reorder_level')->count();
        $pendingRequests = StockTransfer::where('status', 'pending')->count();

        return response()->json([
            'total_medicines' => $totalMedicines,
            'total_stock' => $totalStock,
            'total_shelves' => $totalShelves,
            'used_shelves' => $usedShelves,
            'low_stock' => $lowStock,
            'pending_requests' => $pendingRequests,
        ]);
    }

    public function shelves()
    {
        $shelves = Shelf::withCount('medicines')->get()->map(function ($shelf) {
            $totalItems = $shelf->medicines()->sum('quantity');
            $capacity = $shelf->capacity ?? 100;
            return [
                'id' => $shelf->id,
                'name' => $shelf->name,
                'shelf_location' => $shelf->shelf_location,
                'capacity' => $capacity,
                'current_items' => $totalItems,
                'utilization' => $capacity > 0 ? round(($totalItems / $capacity) * 100) : 0,
                'status' => $shelf->status ?? 'active',
            ];
        });

        return response()->json($shelves);
    }

    public function stock(Request $request)
    {
        $query = Medicine::with(['category', 'supplier', 'shelf']);

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where('name', 'like', "%{$search}%")
                  ->orWhere('generic_name', 'like', "%{$search}%");
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
                'expiry_date' => 'required|date|after:today',
                'quantity' => 'required|integer|min:1',
            ]);

            $po = PurchaseOrder::findOrFail($validated['purchase_order_id']);
            $item = $po->items()->first();
            $medicine = Medicine::findOrFail($item->medicine_id);

            // Create batch
            $batch = Batch::create([
                'medicine_id' => $medicine->id,
                'batch_number' => $validated['batch_number'],
                'expiry_date' => $validated['expiry_date'],
                'quantity' => $validated['quantity'],
                'received_by' => auth()->id(),
                'purchase_order_id' => $po->id,
                'received_at' => now(),
            ]);

            // Update medicine quantity
            $oldQuantity = $medicine->quantity;
            $medicine->quantity += $validated['quantity'];
            $medicine->save();

            // Create stock movement
            StockMovement::create([
                'medicine_id' => $medicine->id,
                'batch_id' => $batch->id,
                'type' => 'in',
                'quantity' => $validated['quantity'],
                'before_quantity' => $oldQuantity,
                'after_quantity' => $medicine->quantity,
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

    public function transferRequests()
    {
        $transfers = StockTransfer::with(['medicine', 'toBranch', 'requestedBy'])
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

    public function completeTransfer($id)
    {
        $transfer = StockTransfer::findOrFail($id);
        $transfer->status = 'completed';
        $transfer->completed_by = auth()->id();
        $transfer->save();

        return response()->json([
            'success' => true,
            'message' => 'Transfer completed successfully'
        ]);
    }

    public function receivingHistory(Request $request)
    {
        $query = StockMovement::where('type', 'in')
            ->with(['medicine', 'user']);

        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }
        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        $history = $query->latest()->paginate(20);
        return response()->json($history);
    }
}