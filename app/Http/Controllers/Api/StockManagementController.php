<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Batch;
use App\Models\Medicine;
use Illuminate\Http\Request;

class StockManagementController extends Controller
{
    public function summary()
    {
        return response()->json([
            'total_stock' => Medicine::sum('quantity'),
            'low_stock' => Medicine::whereColumn('quantity', '<=', 'reorder_level')->count(),
            'expiring_soon' => Batch::whereBetween('expiry_date', [now(), now()->addDays(90)])->count(),
            'expired' => Batch::where('expiry_date', '<', now())->count(),
            'damaged' => Medicine::where('status', 'damaged')->count(),
        ]);
    }

    public function currentStock(Request $request)
    {
        $query = Medicine::with(['category', 'supplier']);
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(fn ($q) => $q->where('name', 'like', "%{$search}%")->orWhere('generic_name', 'like', "%{$search}%"));
        }
        if ($request->filled('category_id')) {
            $query->where('category_id', $request->category_id);
        }
        return response()->json($query->paginate(20));
    }

    public function lowStock() { return response()->json(Medicine::whereColumn('quantity', '<=', 'reorder_level')->with('category')->get()); }
    public function expiry() { return response()->json(['expired' => Batch::where('expiry_date', '<', now())->with('medicine')->get(), 'expiring_soon' => Batch::whereBetween('expiry_date', [now(), now()->addDays(90)])->with('medicine')->get()]); }
    public function damaged() { return response()->json(Medicine::where('status', 'damaged')->get()); }
    public function adjust(Request $request) { return response()->noContent(); }
    public function restock(Request $request) { return response()->noContent(); }
    public function quarantine(Request $request) { return response()->noContent(); }
}
