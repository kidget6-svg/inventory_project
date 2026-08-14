<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Medicine;
use App\Models\Batch;
use App\Models\StockMovement;
use Illuminate\Http\Request;

class StockManagementController extends Controller
{
    public function summary()
    {
        try {
            $totalStock = Medicine::sum('quantity');
            $lowStock = Medicine::whereColumn('quantity', '<=', 'reorder_level')->count();
            $expiringSoon = Batch::whereBetween('expiry_date', [now(), now()->addDays(90)])->count();
            $expired = Batch::where('expiry_date', '<', now())->count();
            $damaged = Medicine::where('status', 'damaged')->count();

            return response()->json([
                'total_stock' => $totalStock,
                'low_stock' => $lowStock,
                'expiring_soon' => $expiringSoon,
                'expired' => $expired,
                'damaged' => $damaged,
            ]);
        } catch (\Exception $e) {
            \Log::error('StockManagement summary error: ' . $e->getMessage());
            return response()->json([
                'error' => $e->getMessage(),
                'message' => 'Failed to load stock summary'
            ], 500);
        }
    }

    public function currentStock(Request $request)
    {
        try {
            $query = Medicine::with(['category', 'supplier']);

            if ($request->filled('search')) {
                $search = $request->search;
                $query->where('name', 'like', "%{$search}%")
                      ->orWhere('generic_name', 'like', "%{$search}%");
            }

            if ($request->filled('category_id')) {
                $query->where('category_id', $request->category_id);
            }

            $stock = $query->paginate(20);
            return response()->json($stock);
        } catch (\Exception $e) {
            return response()->json([
                'error' => $e->getMessage(),
                'message' => 'Failed to load current stock'
            ], 500);
        }
    }

    public function lowStock()
    {
        try {
            $medicines = Medicine::whereColumn('quantity', '<=', 'reorder_level')
                ->with('category')
                ->get();

            return response()->json($medicines);
        } catch (\Exception $e) {
            return response()->json([
                'error' => $e->getMessage(),
                'message' => 'Failed to load low stock'
            ], 500);
        }
    }

    public function expiry()
    {
        try {
            $expired = Batch::where('expiry_date', '<', now())
                ->with('medicine')
                ->get();

            $expiringSoon = Batch::whereBetween('expiry_date', [now(), now()->addDays(90)])
                ->with('medicine')
                ->get();

            return response()->json([
                'expired' => $expired,
                'expiring_soon' => $expiringSoon,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => $e->getMessage(),
                'message' => 'Failed to load expiry data'
            ], 500);
        }
    }

    public function damaged()
    {
        try {
            $medicines = Medicine::where('status', 'damaged')->get();
            return response()->json($medicines);
        } catch (\Exception $e) {
            return response()->json([
                'error' => $e->getMessage(),
                'message' => 'Failed to load damaged items'
            ], 500);
        }
    }

    public function adjust(Request $request)
    {
        // Implementation for stock adjustment
    }

    public function restock(Request $request)
    {
        // Implementation for restock
    }

    public function quarantine(Request $request)
    {
        // Implementation for quarantine
    }
}