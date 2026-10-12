<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Medicine;
use App\Models\RetailProduct;
use App\Models\Batch;
use App\Models\StockMovement;
use Illuminate\Http\Request;

class StockManagementController extends Controller
{
    public function summary(Request $request)
    {
        try {
            $user = $request->user();
            $branchScope = $user ? $user->getBranchScope($request) : null;

            $totalStock = Medicine::when($branchScope, fn($q) => $q->where('branch_id', $branchScope))->sum('quantity') 
                        + RetailProduct::when($branchScope, fn($q) => $q->where('branch_id', $branchScope))->sum('quantity');
            $lowStock = Medicine::whereColumn('quantity', '<=', 'reorder_level')->when($branchScope, fn($q) => $q->where('branch_id', $branchScope))->count() 
                      + RetailProduct::whereColumn('quantity', '<=', 'reorder_level')->when($branchScope, fn($q) => $q->where('branch_id', $branchScope))->count();
            
            $expiringSoonBatches = Batch::whereBetween('expiry_date', [now(), now()->addDays(90)])
                ->when($branchScope, fn($q) => $q->whereHas('medicine', fn($m) => $m->where('branch_id', $branchScope)))
                ->count();
            $expiringSoonRetail = RetailProduct::whereBetween('expiry_date', [now(), now()->addDays(90)])
                ->when($branchScope, fn($q) => $q->where('branch_id', $branchScope))
                ->count();
            $expiringSoon = $expiringSoonBatches + $expiringSoonRetail;

            $expiredBatches = Batch::where('expiry_date', '<', now())
                ->when($branchScope, fn($q) => $q->whereHas('medicine', fn($m) => $m->where('branch_id', $branchScope)))
                ->count();
            $expiredRetail = RetailProduct::where('expiry_date', '<', now())
                ->when($branchScope, fn($q) => $q->where('branch_id', $branchScope))
                ->count();
            $expired = $expiredBatches + $expiredRetail;

            $damagedMed = Medicine::whereIn('status', ['damaged', 'quarantined'])->when($branchScope, fn($q) => $q->where('branch_id', $branchScope))->count();
            $damagedRetail = RetailProduct::whereIn('status', ['damaged', 'quarantined'])->when($branchScope, fn($q) => $q->where('branch_id', $branchScope))->count();
            $damaged = $damagedMed + $damagedRetail;

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
            $user = $request->user();
            $branchScope = $user ? $user->getBranchScope($request) : null;
            $search = $request->input('search');
            $categoryId = $request->input('category_id');

            $medicinesQuery = Medicine::with(['category', 'supplier'])->when($branchScope, fn($q) => $q->where('branch_id', $branchScope));
            if ($search) {
                $medicinesQuery->where(function($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('generic_name', 'like', "%{$search}%")
                      ->orWhere('barcode', 'like', "%{$search}%");
                });
            }
            if ($categoryId) {
                $medicinesQuery->where('category_id', $categoryId);
            }
            $medicines = $medicinesQuery->get()->map(function($m) {
                $m->product_type = 'medicine';
                return $m;
            });

            $retailQuery = RetailProduct::with(['supplier', 'branch'])->when($branchScope, fn($q) => $q->where('branch_id', $branchScope));
            if ($search) {
                $retailQuery->where(function($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('sku', 'like', "%{$search}%")
                      ->orWhere('barcode', 'like', "%{$search}%");
                });
            }
            if ($categoryId) {
                $retailQuery->where('category', $categoryId);
            }
            $retailProducts = $retailQuery->get()->map(function($r) {
                $r->product_type = 'retail';
                $r->category = ['name' => $r->category ?? 'Retail/OTC'];
                return $r;
            });

            $all = $medicines->concat($retailProducts)->sortBy('name')->values();

            return response()->json([
                'data' => $all,
                'medicines' => $medicines,
                'retail_products' => $retailProducts,
            ]);
        } catch (\Exception $e) {
            \Log::error('StockManagement currentStock error: ' . $e->getMessage());
            return response()->json([
                'error' => $e->getMessage(),
                'message' => 'Failed to load current stock'
            ], 500);
        }
    }

    public function lowStock(Request $request)
    {
        try {
            $user = $request->user();
            $branchScope = $user ? $user->getBranchScope($request) : null;

            $medicines = Medicine::whereColumn('quantity', '<=', 'reorder_level')
                ->when($branchScope, fn($q) => $q->where('branch_id', $branchScope))
                ->with('category')
                ->get()
                ->map(function($m) {
                    $m->product_type = 'medicine';
                    return $m;
                });

            $retail = RetailProduct::whereColumn('quantity', '<=', 'reorder_level')
                ->when($branchScope, fn($q) => $q->where('branch_id', $branchScope))
                ->get()
                ->map(function($r) {
                    $r->product_type = 'retail';
                    $r->category = ['name' => $r->category ?? 'Retail/OTC'];
                    return $r;
                });

            return response()->json([
                'medicines' => $medicines,
                'retail_products' => $retail,
                'all' => $medicines->concat($retail)->values(),
            ]);
        } catch (\Exception $e) {
            \Log::error('StockManagement lowStock error: ' . $e->getMessage());
            return response()->json([
                'error' => $e->getMessage(),
                'message' => 'Failed to load low stock'
            ], 500);
        }
    }

    public function expiry(Request $request)
    {
        try {
            $user = $request->user();
            $branchScope = $user ? $user->getBranchScope($request) : null;

            $expiredBatches = Batch::where('expiry_date', '<', now())
                ->when($branchScope, fn($q) => $q->whereHas('medicine', fn($m) => $m->where('branch_id', $branchScope)))
                ->with('medicine')
                ->get()
                ->map(function($b) {
                    $b->product_type = 'medicine';
                    $b->name = $b->medicine->name ?? 'Unknown Medicine';
                    return $b;
                });

            $expiredRetail = RetailProduct::where('expiry_date', '<', now())
                ->when($branchScope, fn($q) => $q->where('branch_id', $branchScope))
                ->get()
                ->map(function($r) {
                    $r->product_type = 'retail';
                    return $r;
                });

            $expiringSoonBatches = Batch::whereBetween('expiry_date', [now(), now()->addDays(90)])
                ->when($branchScope, fn($q) => $q->whereHas('medicine', fn($m) => $m->where('branch_id', $branchScope)))
                ->with('medicine')
                ->get()
                ->map(function($b) {
                    $b->product_type = 'medicine';
                    $b->name = $b->medicine->name ?? 'Unknown Medicine';
                    return $b;
                });

            $expiringSoonRetail = RetailProduct::whereBetween('expiry_date', [now(), now()->addDays(90)])
                ->when($branchScope, fn($q) => $q->where('branch_id', $branchScope))
                ->get()
                ->map(function($r) {
                    $r->product_type = 'retail';
                    return $r;
                });

            return response()->json([
                'expired' => $expiredBatches->concat($expiredRetail)->values(),
                'expiring_soon' => $expiringSoonBatches->concat($expiringSoonRetail)->values(),
            ]);
        } catch (\Exception $e) {
            \Log::error('StockManagement expiry error: ' . $e->getMessage());
            return response()->json([
                'error' => $e->getMessage(),
                'message' => 'Failed to load expiry data'
            ], 500);
        }
    }

    public function damaged(Request $request)
    {
        try {
            $user = $request->user();
            $branchScope = $user ? $user->getBranchScope($request) : null;

            $medicines = Medicine::whereIn('status', ['damaged', 'quarantined'])
                ->when($branchScope, fn($q) => $q->where('branch_id', $branchScope))
                ->get()
                ->map(function($m) {
                    $m->product_type = 'medicine';
                    return $m;
                });

            $retail = RetailProduct::whereIn('status', ['damaged', 'quarantined'])
                ->when($branchScope, fn($q) => $q->where('branch_id', $branchScope))
                ->get()
                ->map(function($r) {
                    $r->product_type = 'retail';
                    $r->category = ['name' => $r->category ?? 'Retail/OTC'];
                    return $r;
                });

            return response()->json([
                'medicines' => $medicines,
                'retail_products' => $retail,
                'all' => $medicines->concat($retail)->values(),
            ]);
        } catch (\Exception $e) {
            \Log::error('StockManagement damaged error: ' . $e->getMessage());
            return response()->json([
                'error' => $e->getMessage(),
                'message' => 'Failed to load damaged items'
            ], 500);
        }
    }
}
