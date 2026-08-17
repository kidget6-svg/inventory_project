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
    public function summary()
    {
        try {
            $totalStock = Medicine::sum('quantity') + RetailProduct::sum('quantity');
            $lowStock = Medicine::whereColumn('quantity', '<=', 'reorder_level')->count() + RetailProduct::whereColumn('quantity', '<=', 'reorder_level')->count();
            
            $expiringSoonBatches = Batch::whereBetween('expiry_date', [now(), now()->addDays(90)])->count();
            $expiringSoonRetail = RetailProduct::whereBetween('expiry_date', [now(), now()->addDays(90)])->count();
            $expiringSoon = $expiringSoonBatches + $expiringSoonRetail;

            $expiredBatches = Batch::where('expiry_date', '<', now())->count();
            $expiredRetail = RetailProduct::where('expiry_date', '<', now())->count();
            $expired = $expiredBatches + $expiredRetail;

            $damagedMed = Medicine::whereIn('status', ['damaged', 'quarantined'])->count();
            $damagedRetail = RetailProduct::whereIn('status', ['damaged', 'quarantined'])->count();
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
            $search = $request->input('search');
            $categoryId = $request->input('category_id');

            $medicinesQuery = Medicine::with(['category', 'supplier']);
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

            $retailQuery = RetailProduct::with(['supplier']);
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

    public function lowStock()
    {
        try {
            $medicines = Medicine::whereColumn('quantity', '<=', 'reorder_level')
                ->with('category')
                ->get()
                ->map(function($m) {
                    $m->product_type = 'medicine';
                    return $m;
                });

            $retail = RetailProduct::whereColumn('quantity', '<=', 'reorder_level')
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
            return response()->json([
                'error' => $e->getMessage(),
                'message' => 'Failed to load low stock'
            ], 500);
        }
    }

    public function expiry()
    {
        try {
            $expiredBatches = Batch::where('expiry_date', '<', now())
                ->with('medicine')
                ->get()
                ->map(function($b) {
                    $b->product_type = 'medicine';
                    $b->name = $b->medicine->name ?? 'Unknown Medicine';
                    return $b;
                });

            $expiredRetail = RetailProduct::where('expiry_date', '<', now())
                ->get()
                ->map(function($r) {
                    $r->product_type = 'retail';
                    return $r;
                });

            $expiringSoonBatches = Batch::whereBetween('expiry_date', [now(), now()->addDays(90)])
                ->with('medicine')
                ->get()
                ->map(function($b) {
                    $b->product_type = 'medicine';
                    $b->name = $b->medicine->name ?? 'Unknown Medicine';
                    return $b;
                });

            $expiringSoonRetail = RetailProduct::whereBetween('expiry_date', [now(), now()->addDays(90)])
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
            return response()->json([
                'error' => $e->getMessage(),
                'message' => 'Failed to load expiry data'
            ], 500);
        }
    }

    public function damaged()
    {
        try {
            $medicines = Medicine::whereIn('status', ['damaged', 'quarantined'])
                ->get()
                ->map(function($m) {
                    $m->product_type = 'medicine';
                    return $m;
                });

            $retail = RetailProduct::whereIn('status', ['damaged', 'quarantined'])
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
            return response()->json([
                'error' => $e->getMessage(),
                'message' => 'Failed to load damaged items'
            ], 500);
        }
    }
}
