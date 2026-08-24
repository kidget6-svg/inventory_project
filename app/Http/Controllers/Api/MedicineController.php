<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Medicine;
use App\Models\Shelf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class MedicineController extends Controller
{
    /**
     * GET /api/medicines
     */
    public function index(Request $request)
    {
        try {
            $query = Medicine::with(['category']);

            $user = $request->user();
            $branchScope = $user ? $user->getBranchScope($request) : null;
            if ($branchScope) {
                $query->where('branch_id', $branchScope);
            }

            if ($request->filled('search')) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('generic_name', 'like', "%{$search}%");
                });
            }

            if ($request->filled('category_id')) {
                $query->where('category_id', $request->category_id);
            }

            if ($request->filled('shelf_id')) {
                $query->where('shelf_id', $request->shelf_id);
            }

            if ($request->filled('status')) {
                $query->where('status', $request->status);
            }

            $perPage = $request->get('per_page');
            
            // If requesting all records
            if ($perPage === 'all' || $perPage == -1) {
                $allMedicines = $query->latest()->get();
                return response()->json($allMedicines);
            }

            // Paginated response
            $medicines = $query->latest()->paginate($perPage ?? 10);

            return response()->json([
                'data' => $medicines->items(),
                'meta' => [
                    'current_page' => $medicines->currentPage(),
                    'last_page' => $medicines->lastPage(),
                    'per_page' => $medicines->perPage(),
                    'total' => $medicines->total(),
                ]
            ]);

        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Query Error: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * POST /api/medicines
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'generic_name' => 'nullable|string|max:255',
            'batch_number' => 'nullable|string|max:255',
            'category_id' => 'required|exists:categories,id',
            'quantity' => 'required|integer|min:0',
            'unit_price' => 'nullable|numeric|min:0',
            'reorder_level' => 'required|integer|min:0',
            'status' => 'in:active,inactive,expired,discontinued',
            'description' => 'nullable|string',
            'dosage_form' => 'nullable|string|max:50',
            'strength' => 'nullable|string|max:50',
            'unit' => 'nullable|string|20',
            'manufacturer' => 'nullable|string|max:255',
            'branch_id' => 'nullable|exists:branches,id',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg,webp|max:2048',
        ]);

        $validated = $this->handleImageUpload($validated, null);

        // New medicines start with zero stock; the initial quantity is recorded
        // through the automatic stock movement created after creation.
        $validated['quantity'] = 0;

        // Assign the creating user's branch so branch-scoped users can see it,
        // or respect the explicitly passed / active branch for admins.
        if (empty($validated['branch_id'])) {
            $userBranch = $request->user()->getBranchScope($request);
            if ($userBranch) {
                $validated['branch_id'] = $userBranch;
            }
        }

        $medicine = Medicine::create($validated);
        return response()->json($medicine->load(['category']), 201);
    }

    /**
     * GET /api/medicines/{medicine}
     */
    public function show(Medicine $medicine)
    {
        return response()->json($medicine->load(['category']));
    }

    /**
     * GET /api/medicines/low-stock
     */
    public function getLowStock(Request $request)
    {
        try {
            $user = $request->user();
            $branchScope = $user ? $user->getBranchScope($request) : null;

            $query = Medicine::whereColumn('quantity', '<=', 'reorder_level')
                ->with('category')
                ->when($branchScope, function ($q) use ($branchScope) {
                    $q->where('branch_id', $branchScope);
                })
                ->orderBy('quantity');

            $medicines = $query->paginate(10);

            return response()->json([
                'success' => true,
                'data'    => $medicines->items(),
                'meta'    => [
                    'current_page' => $medicines->currentPage(),
                    'last_page'    => $medicines->lastPage(),
                    'per_page'     => $medicines->perPage(),
                    'total'        => $medicines->total(),
                ]
            ]);

        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * PUT /api/medicines/{medicine}
     */
    public function update(Request $request, Medicine $medicine)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'generic_name' => 'nullable|string|max:255',
            'batch_number' => 'nullable|string|max:255',
            'category_id' => 'required|exists:categories,id',
            'quantity' => 'required|integer|min:0',
            'unit_price' => 'nullable|numeric|min:0',
            'reorder_level' => 'required|integer|min:0',
            'status' => 'in:active,inactive,expired,discontinued',
            'description' => 'nullable|string',
            'dosage_form' => 'nullable|string|max:50',
            'strength' => 'nullable|string|max:50',
            'unit' => 'nullable|string|20',
            'manufacturer' => 'nullable|string|max:255',
            'branch_id' => 'nullable|exists:branches,id',
            'shelf_id' => 'nullable|exists:shelves,id',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg,webp|max:2048',
        ]);

        $oldShelfId = $medicine->shelf_id;
        $oldQty = (int) $medicine->quantity;
        $newShelfId = $validated['shelf_id'] ?? null;
        $newQty = (int) $validated['quantity'];

        // Enforce that a selected shelf belongs to the medicine's branch/location.
        if ($newShelfId && $newShelfId != $oldShelfId) {
            $shelf = Shelf::findOrFail($newShelfId);
            $medicineBranch = $validated['branch_id'] ?? $medicine->branch_id;
            if ($shelf->location_type === Shelf::LOCATION_BRANCH && (int) $shelf->branch_id !== (int) $medicineBranch) {
                return response()->json([
                    'success' => false,
                    'message' => 'Selected shelf does not belong to this medicine\'s branch.',
                ], 422);
            }
        }

        // Adjust shelf capacity using the difference, never old + new.
        if ($newShelfId != $oldShelfId || $newQty != $oldQty) {
            try {
                if ($oldShelfId && $oldShelfId != $newShelfId) {
                    $oldShelf = Shelf::find($oldShelfId);
                    if ($oldShelf) {
                        $oldShelf->removeStock($oldQty);
                    }
                }
                if ($newShelfId) {
                    $newShelf = Shelf::findOrFail($newShelfId);
                    if ($newShelfId == $oldShelfId) {
                        $delta = $newQty - $oldQty;
                        if ($delta > 0) {
                            $newShelf->addStock($delta);
                        } elseif ($delta < 0) {
                            $newShelf->removeStock(-$delta);
                        }
                    } else {
                        $newShelf->addStock($newQty);
                    }
                }
            } catch (ValidationException $e) {
                return response()->json([
                    'success' => false,
                    'message' => collect($e->errors())->flatten()->first(),
                    'errors' => $e->errors(),
                ], 422);
            }
        }

        $validated = $this->handleImageUpload($validated, $medicine);
        $medicine->update($validated);
        return response()->json($medicine->load(['category']));
    }

    /**
     * PATCH /api/medicines/{medicine}/status
     */
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

    /**
     * Store an uploaded medicine image on the public disk.
     * Deletes any previously stored image when updating.
     */
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