<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreMedicineRequest;
use App\Http\Requests\UpdateMedicineRequest;
use App\Models\Medicine;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;

class MedicineController extends Controller
{
    public function index(Request $request)
    {
        try {
            $query = Medicine::with(['category', 'supplier']);

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

            if ($request->filled('shelf_id')) {
                $query->where('shelf_id', $request->shelf_id);
            }

            if ($request->filled('status')) {
                $query->where('status', $request->status);
            }

            $perPage = $request->get('per_page');

            if ($perPage === 'all' || $perPage == -1) {
                $allMedicines = $query->latest()->get();
                return response()->json($allMedicines);
            }

            $medicines = $query->latest()->paginate($perPage ?? 15);

            return response()->json([
                'data' => $medicines->items(),
                'meta' => [
                    'current_page' => $medicines->currentPage(),
                    'last_page'    => $medicines->lastPage(),
                    'per_page'     => $medicines->perPage(),
                    'total'        => $medicines->total(),
                ],
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Query Error: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function store(StoreMedicineRequest $request)
    {
        $validated = $request->validated();
        $validated = $this->handleImageUpload($validated, null);

        $medicine = Medicine::create($validated);
        return response()->json([
            'success' => true,
            'message' => 'Medicine created successfully',
            'data'    => $medicine->load(['category', 'supplier']),
        ], 201);
    }

    public function show(Medicine $medicine)
    {
        return response()->json($medicine->load(['category', 'supplier']));
    }

    public function getLowStock()
    {
        try {
            $medicines = Medicine::whereColumn('quantity', '<=', 'reorder_level')
                ->with('category')
                ->orderBy('quantity')
                ->paginate(10);

            return response()->json([
                'success' => true,
                'data'    => $medicines->items(),
                'meta'    => [
                    'current_page' => $medicines->currentPage(),
                    'last_page'    => $medicines->lastPage(),
                    'per_page'     => $medicines->perPage(),
                    'total'        => $medicines->total(),
                ],
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function update(UpdateMedicineRequest $request, Medicine $medicine)
    {
        $validated = $request->validated();
        $validated = $this->handleImageUpload($validated, $medicine);

        $medicine->update($validated);
        return response()->json([
            'success' => true,
            'message' => 'Medicine updated successfully',
            'data'    => $medicine->load(['category', 'supplier']),
        ]);
    }

    public function updateStatus(Request $request, Medicine $medicine)
    {
        $validated = $request->validate([
            'status' => 'required|in:active,inactive',
        ]);

        $medicine->syncAutomaticExpiryState();

        if ($medicine->status === Medicine::STATUS_EXPIRED) {
            return response()->json(['message' => 'Expired medicines cannot be activated or deactivated.'], 422);
        }

        $medicine->update(['status' => $validated['status']]);

        return response()->json($medicine->fresh());
    }

    public function destroy($id)
    {
        try {
            $medicine = Medicine::find($id);

            if (!$medicine) {
                return response()->json([
                    'success' => false,
                    'message' => 'Medicine not found',
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
                'message' => 'Medicine deleted successfully',
            ], 200);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete medicine: ' . $e->getMessage(),
            ], 500);
        }
    }

    protected function handleImageUpload(array $validated, ?Medicine $medicine = null): array
    {
        $request = request();

        if (! $request->hasFile('image')) {
            return $validated;
        }

        if ($medicine && $medicine->image && Storage::disk('public')->exists($medicine->image)) {
            Storage::disk('public')->delete($medicine->image);
        }

        $path = $request->file('image')->store('medicine-images', 'public');

        return array_merge($validated, ['image' => $path]);
    }
}
