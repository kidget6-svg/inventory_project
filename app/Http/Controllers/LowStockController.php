<?php

namespace App\Http\Controllers;

use App\Models\Medicine;
use App\Models\PurchaseOrder;
use App\Models\PurchaseOrderItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;

class LowStockController extends Controller
{
    /**
     * Display a listing of low stock medicines with aggregate statistics.
     */
    public function index(Request $request)
    {
        try {
            // Eager load relationships needed for frontend rendering
            $query = Medicine::with(['category', 'supplier']);

            // 1. Search Filter (by name, generic name, or barcode)
            if ($request->filled('search')) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('generic_name', 'like', "%{$search}%")
                      ->orWhere('barcode', 'like', "%{$search}%");
                });
            }

            // 2. Category Filter
            if ($request->filled('category_id')) {
                $query->where('category_id', $request->category_id);
            }

            // 3. Supplier Filter
            if ($request->filled('supplier_id')) {
                $query->where('supplier_id', $request->supplier_id);
            }

            // 4. Status Filter
            if ($request->filled('status')) {
                if ($request->status === 'out') {
                    $query->where('quantity', '<=', 0);
                } elseif ($request->status === 'critical') {
                    $query->whereRaw('quantity <= (reorder_level / 2)');
                } elseif ($request->status === 'low') {
                    $query->whereRaw('quantity <= reorder_level AND quantity > (reorder_level / 2)');
                }
            } else {
                // Default: Return items where quantity is at or below the reorder level OR completely out of stock
                $query->whereRaw('quantity <= reorder_level');
            }

            // 5. Sorting
            $sortParam = $request->get('sort', 'name_asc');
            [$sortField, $sortDir] = explode('_', $sortParam) + ['name', 'asc'];
            
            $allowedSorts = ['name', 'quantity', 'reorder_level', 'price', 'expiry_date'];
            if (in_array($sortField, $allowedSorts)) {
                $query->orderBy($sortField, strtolower($sortDir) === 'desc' ? 'desc' : 'asc');
            } else {
                $query->orderBy('name', 'asc');
            }

            // Paginate results
            $perPage = (int) $request->get('per_page', 15);
            $medicines = $query->paginate($perPage);

            // Calculate overall inventory statistics safely
            $totalMedicines = Medicine::count();
            $totalLow = Medicine::whereRaw('quantity <= reorder_level')->count();
            $outOfStock = Medicine::where('quantity', '<=', 0)->count();
            $critical = Medicine::whereRaw('quantity <= (reorder_level / 2) AND quantity > 0')->count();
            $low = Medicine::whereRaw('quantity <= reorder_level AND quantity > (reorder_level / 2)')->count();
            
            // COALESCE avoids null return when database table is empty
            $inventoryValue = (float) Medicine::whereRaw('quantity <= reorder_level')
                ->sum(DB::raw('COALESCE(quantity, 0) * COALESCE(price, 0)'));

            // Prevent division-by-zero for stock health percentage
            $stockHealth = $totalMedicines > 0 
                ? round((($totalMedicines - $totalLow) / $totalMedicines) * 100, 1) 
                : 100;

            $stats = [
                'total'                => $totalLow,
                'out_of_stock'         => $outOfStock,
                'critical'             => $critical,
                'low'                  => $low,
                'inventory_value'      => $inventoryValue,
                'avg_days_to_stockout' => 7, // Estimated metric default
                'stock_health'         => $stockHealth,
                'self_managed'         => 0,
            ];

            return response()->json([
                'medicines' => $medicines,
                'stats'     => $stats,
            ], 200);

        } catch (\Exception $e) {
            Log::error('LowStock Index Error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to load low stock data: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Create an immediate purchase order for a specific low-stock medicine.
     */
    public function orderNow(Request $request, $id)
    {
        try {
            $medicine = Medicine::findOrFail($id);

            return DB::transaction(function () use ($medicine) {
                // Calculate quantity to order (bring back up to twice the reorder level or default min)
                $orderQuantity = max(($medicine->reorder_level * 2) - $medicine->quantity, 10);

                // Create a purchase order
                $po = PurchaseOrder::create([
                    'supplier_id'  => $medicine->supplier_id,
                    'order_number' => 'PO-' . strtoupper(uniqid()),
                    'status'       => 'pending',
                    'total_amount' => $orderQuantity * ($medicine->purchase_price ?? $medicine->price ?? 0),
                    'created_by'   => Auth::id() ?? 1,
                    'notes'        => "Auto-generated purchase order for low stock item: {$medicine->name}",
                ]);

                // Create order item
                if (class_exists(PurchaseOrderItem::class)) {
                    PurchaseOrderItem::create([
                        'purchase_order_id' => $po->id,
                        'medicine_id'       => $medicine->id,
                        'quantity'          => $orderQuantity,
                        'unit_price'        => $medicine->purchase_price ?? $medicine->price ?? 0,
                    ]);
                }

                return response()->json([
                    'message' => 'Purchase order generated successfully.',
                    'order'   => $po,
                ], 201);
            });

        } catch (\Exception $e) {
            Log::error('LowStock OrderNow Error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to generate purchase order: ' . $e->getMessage()
            ], 500);
        }
    }
}