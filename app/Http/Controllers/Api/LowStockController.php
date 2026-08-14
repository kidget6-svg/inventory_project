<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Medicine;
use App\Models\StockMovement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Barryvdh\DomPDF\Facade\Pdf;

class LowStockController extends Controller
{
    public function index(Request $request)
    {
        try {
            $query = Medicine::with(['category', 'supplier'])
                ->whereColumn('quantity', '<=', 'reorder_level')
                ->orderBy('quantity', 'asc');

            // Search filter
            if ($request->filled('search')) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('generic_name', 'like', "%{$search}%")
                      ->orWhere('barcode', 'like', "%{$search}%");
                });
            }

            // Category filter
            if ($request->filled('category_id')) {
                $query->where('category_id', $request->category_id);
            }

            // Supplier filter
            if ($request->filled('supplier_id')) {
                $query->where('supplier_id', $request->supplier_id);
            }

            // Status filter: out, critical, low
            if ($request->filled('status')) {
                $status = $request->status;
                if ($status === 'out') {
                    $query->where('quantity', '<=', 0);
                } elseif ($status === 'critical') {
                    $query->where('quantity', '>', 0)->whereColumn('quantity', '<=', DB::raw('reorder_level / 2'));
                } elseif ($status === 'low') {
                    $query->where('quantity', '>', 0)->whereColumn('quantity', '>', DB::raw('reorder_level / 2'))->whereColumn('quantity', '<=', 'reorder_level');
                }
            }

            // Pagination
            $perPage = (int) ($request->get('per_page', 50));
            if ($perPage <= 0 || $perPage > 200) {
                $perPage = 50;
            }
            $page = (int) ($request->get('page', 1));
            if ($page <= 0) {
                $page = 1;
            }

            $paginatedMedicines = $query->paginate($perPage);

            // Calculate stats from ALL filtered results (not just the page)
            $allFiltered = clone $query;
            $medicines = $allFiltered->get();

            $totalCount = $medicines->count();
            $outOfStockCount = $medicines->where('quantity', '<=', 0)->count();
            $criticalCount = $medicines->filter(function ($m) {
                return (int) $m->quantity > 0 && (int) $m->quantity <= (int) ($m->reorder_level / 2);
            })->count();
            $lowCount = $medicines->filter(function ($m) {
                return (int) $m->quantity > 0 && (int) $m->quantity <= (int) $m->reorder_level;
            })->count();

            $inventoryValue = $medicines->sum(function ($m) {
                $price = (float) ($m->purchase_price ?? $m->unit_price ?? 0);
                return ((int) $m->quantity) * $price;
            });

            $avgDaysToStockout = $this->calculateAvgDaysToStockout($medicines);

            $stockHealth = $totalCount > 0 ? max(0, 100 - ((($outOfStockCount + $criticalCount) / $totalCount) * 100)) : 100;

            $selfManagedCount = $medicines->filter(function ($m) {
                return $m->stockMovements()->where('source_type', 'self')->orWhere('destination_type', 'self')->exists();
            })->count();

            $stats = [
                'total' => $totalCount,
                'out_of_stock' => $outOfStockCount,
                'critical' => $criticalCount,
                'low' => $lowCount,
                'inventory_value' => round($inventoryValue, 2),
                'avg_days_to_stockout' => $avgDaysToStockout,
                'stock_health' => (int) round($stockHealth),
                'self_managed' => (int) $selfManagedCount,
            ];

            return response()->json([
                'medicines' => $paginatedMedicines->items(),
                'stats' => $stats,
                'meta' => [
                    'current_page' => $paginatedMedicines->currentPage(),
                    'last_page' => $paginatedMedicines->lastPage(),
                    'per_page' => $paginatedMedicines->perPage(),
                    'total' => $paginatedMedicines->total(),
                ]
            ]);

        } catch (\Throwable $e) {
            Log::error('LowStockController index error: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
                'request' => $request->all(),
            ]);

            return response()->json([
                'message' => 'Failed to load low stock data.',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error.',
            ], 500);
        }
    }

    public function orderNow(Request $request, Medicine $medicine)
    {
        try {
            if (! $medicine->supplier) {
                return response()->json([
                    'message' => 'This medicine has no supplier assigned. Please assign a supplier first.'
                ], 422);
            }

            $quantity = max(1, (int) $medicine->reorder_level - (int) $medicine->quantity);
            $unitPrice = (float) ($medicine->purchase_price ?? $medicine->unit_price ?? 0);
            $subtotal = $quantity * $unitPrice;

            $order = \App\Models\PurchaseOrder::create([
                'supplier_id' => $medicine->supplier_id,
                'order_date' => now(),
                'status' => 'draft',
                'total_amount' => $subtotal,
            ]);

            \App\Models\PurchaseOrderItem::create([
                'purchase_order_id' => $order->id,
                'medicine_id' => $medicine->id,
                'quantity' => $quantity,
                'unit_price' => $unitPrice,
                'subtotal' => $subtotal,
            ]);

            return response()->json([
                'message' => 'Purchase order created successfully',
                'purchase_order' => $order->load('items'),
            ], 201);

        } catch (\Throwable $e) {
            Log::error('LowStockController orderNow error: ' . $e->getMessage(), [
                'medicine_id' => $medicine->id,
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'message' => 'Failed to create purchase order.',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error.',
            ], 500);
        }
    }

    public function exportPdf(Request $request)
    {
        try {
            $query = Medicine::with(['category', 'supplier'])
                ->whereColumn('quantity', '<=', 'reorder_level')
                ->orderBy('quantity', 'asc');

            if ($request->filled('search')) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('generic_name', 'like', "%{$search}%")
                      ->orWhere('barcode', 'like', "%{$search}%");
                });
            }
            if ($request->filled('category_id')) {
                $query->where('category_id', $request->category_id);
            }
            if ($request->filled('supplier_id')) {
                $query->where('supplier_id', $request->supplier_id);
            }

            $medicines = $query->get();
            $stats = [
                'total' => $medicines->count(),
                'out_of_stock' => $medicines->where('quantity', '<=', 0)->count(),
                'critical' => $medicines->filter(fn ($m) => (int) $m->quantity > 0 && (int) $m->quantity <= (int) ($m->reorder_level / 2))->count(),
                'low' => $medicines->filter(fn ($m) => (int) $m->quantity > 0 && (int) $m->quantity <= (int) $m->reorder_level)->count(),
                'inventory_value' => $medicines->sum(fn ($m) => ((int) $m->quantity) * (float) ($m->purchase_price ?? $m->unit_price ?? 0)),
            ];

            $pdf = Pdf::loadView('reports.low-stock', compact('medicines', 'stats'));

            return $pdf->download('low-stock-report.pdf');

        } catch (\Throwable $e) {
            Log::error('LowStockController exportPdf error: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
                'request' => $request->all(),
            ]);

            return response()->json([
                'message' => 'Failed to generate PDF report.',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error.',
            ], 500);
        }
    }

    private function calculateAvgDaysToStockout($medicines)
    {
        $totalDays = 0;
        $countDays = 0;

        foreach ($medicines as $medicine) {
            $dailyConsumption = (float) ($medicine->daily_consumption ?? 0);
            if ($dailyConsumption > 0 && (int) $medicine->quantity > 0) {
                $totalDays += (int) $medicine->quantity / $dailyConsumption;
                $countDays++;
            }
        }

        return $countDays > 0 ? (int) round($totalDays / $countDays) : 0;
    }
}
