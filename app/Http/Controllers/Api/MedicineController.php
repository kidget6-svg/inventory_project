<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Medicine;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Validator;

class MedicineController extends Controller
{
    /**
     * GET /api/medicines
     */
    public function index(Request $request)
    {
        try {
            $query = Medicine::with('category');

            // Handle optional search query
            if ($request->filled('search')) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('generic_name', 'like', "%{$search}%")
                      ->orWhere('shelf_location', 'like', "%{$search}%");
                });
            }

            if ($request->filled('category_id')) {
                $query->where('category_id', $request->category_id);
            }

            if ($request->filled('supplier_id')) {
                $query->where('supplier_id', $request->supplier_id);
            }

            if ($request->filled('status')) {
                $query->where('status', $request->status);
            }

            $perPage = $request->get('per_page');
            if ($perPage === 'all' || $perPage == -1) {
                $allMedicines = $query->latest()->get();
                return response()->json([
                    'success'   => true,
                    'data'      => $allMedicines,
                    'medicines' => $allMedicines,
                ], 200);
            }

            $medicines = $query->latest()->paginate($perPage ?? 15);

            return response()->json([
                'success'   => true,
                'data'      => $medicines->items(),
                'medicines' => $medicines,
                'meta'      => [
                    'current_page' => $medicines->currentPage(),
                    'last_page'    => $medicines->lastPage(),
                    'per_page'     => $medicines->perPage(),
                    'total'        => $medicines->total(),
                ]
            ], 200);

        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Query Error: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * GET /api/medicines/low-stock
     */
    public function getLowStock()
    {
        try {
            $medicines = Medicine::whereColumn('quantity', '<=', 'reorder_level')
                ->with('category')
                ->orderBy('quantity')
                ->get();

            return response()->json([
                'success' => true,
                'data'    => $medicines
            ], 200);

        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * GET /api/medicines/{id}
     */
    public function show($id)
    {
        try {
            $medicine = Medicine::with(['category', 'supplier'])->find($id);

            if (!$medicine) {
                return response()->json([
                    'success' => false,
                    'message' => 'Medicine not found'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data'    => $medicine
            ], 200);

        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * POST /api/medicines
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name'           => 'required|string|max:255',
            'generic_name'   => 'nullable|string|max:255',
            'category_id'    => 'nullable|exists:categories,id',
            'supplier_id'    => 'nullable|exists:suppliers,id',
            'quantity'       => 'required|integer|min:0',
            'selling_price'  => 'required|numeric|min:0',
            'unit_price'     => 'nullable|numeric|min:0',
            'purchase_price' => 'nullable|numeric|min:0',
            'reorder_level'  => 'nullable|integer|min:0',
            'expiry_date'    => 'nullable|date',
            'status'         => 'nullable|in:active,inactive,expired,discontinued',
            'shelf_location' => 'nullable|string|max:100',
            'batch_number'   => 'nullable|string|max:100',
            'barcode'        => 'nullable|string|max:100',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation Failed',
                'errors'  => $validator->errors()
            ], 422);
        }

        try {
            $data = $validator->validated();
            $data['status'] = $data['status'] ?? 'active';

            if ($request->hasFile('image')) {
                $path = $request->file('image')->store('medicine-images', 'public');
                $data['image'] = $path;
            }

            $medicine = Medicine::create($data);

            return response()->json([
                'success' => true,
                'message' => 'Medicine created successfully',
                'data'    => $medicine
            ], 201);

        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Creation Error: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * PUT/POST /api/medicines/{id}
     */
    public function update(Request $request, $id)
    {
        $medicine = Medicine::find($id);

        if (!$medicine) {
            return response()->json([
                'success' => false,
                'message' => 'Medicine not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'name'           => 'required|string|max:255',
            'generic_name'   => 'nullable|string|max:255',
            'category_id'    => 'nullable|exists:categories,id',
            'supplier_id'    => 'nullable|exists:suppliers,id',
            'quantity'       => 'required|integer|min:0',
            'selling_price'  => 'required|numeric|min:0',
            'unit_price'     => 'nullable|numeric|min:0',
            'purchase_price' => 'nullable|numeric|min:0',
            'reorder_level'  => 'nullable|integer|min:0',
            'expiry_date'    => 'nullable|date',
            'status'         => 'nullable|in:active,inactive,expired,discontinued',
            'shelf_location' => 'nullable|string|max:100',
            'batch_number'   => 'nullable|string|max:100',
            'barcode'        => 'nullable|string|max:100',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation Failed',
                'errors'  => $validator->errors()
            ], 422);
        }

        try {
            $data = $validator->validated();

            if ($request->hasFile('image')) {
                $path = $request->file('image')->store('medicine-images', 'public');
                $data['image'] = $path;
            }

            $medicine->update($data);

            return response()->json([
                'success' => true,
                'message' => 'Medicine updated successfully',
                'data'    => $medicine->fresh('category')
            ], 200);

        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Update Error: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * DELETE /api/medicines/{id}
     */
    public function destroy($id)
    {
        try {
            $medicine = Medicine::find($id);

            if (!$medicine) {
                return response()->json([
                    'success' => false,
                    'message' => 'Medicine not found'
                ], 404);
            }

            DB::transaction(function () use ($medicine) {
                if (Schema::hasTable('stock_movements') && Schema::hasColumn('stock_movements', 'medicine_id')) {
                    DB::table('stock_movements')->where('medicine_id', $medicine->id)->delete();
                }
                if (Schema::hasTable('sale_items') && Schema::hasColumn('sale_items', 'medicine_id')) {
                    DB::table('sale_items')->where('medicine_id', $medicine->id)->delete();
                }
                if (Schema::hasTable('purchase_order_items') && Schema::hasColumn('purchase_order_items', 'medicine_id')) {
                    DB::table('purchase_order_items')->where('medicine_id', $medicine->id)->delete();
                }

                $medicine->delete();
            });

            return response()->json([
                'success' => true,
                'message' => 'Medicine deleted successfully'
            ], 200);

        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete medicine: ' . $e->getMessage()
            ], 500);
        }
    }
}