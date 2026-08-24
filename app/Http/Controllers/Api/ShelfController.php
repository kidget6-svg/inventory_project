<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Branch;
use App\Models\Medicine;
use App\Models\RetailProduct;
use App\Models\Shelf;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class ShelfController extends Controller
{
    /**
     * List shelves with optional filtering by location_type / branch_id / product_type.
     * Warehouse shelves are global (not bound to a branch scope).
     */
    public function index(Request $request)
    {
        try {
            $user = $request->user();
            $branchScope = $user ? $user->getBranchScope($request) : null;

            $query = Shelf::query()->withCount(['medicines', 'retailProducts']);

            // Explicit location filter (warehouse | branch)
            if ($request->filled('location_type')) {
                $query->where('location_type', $request->location_type);

                // Warehouse shelves are global; do not apply branch scope to them.
                if ($request->location_type === Shelf::LOCATION_BRANCH && $request->filled('branch_id')) {
                    $query->where('branch_id', $request->branch_id);
                } elseif ($request->location_type === Shelf::LOCATION_BRANCH && $branchScope) {
                    $query->where('branch_id', $branchScope);
                }
            } else {
                // Default: branch shelves for the active branch scope (admin "all" => every branch).
                if ($branchScope) {
                    $query->where('branch_id', $branchScope);
                }
            }

            if ($request->filled('product_type')) {
                $query->where('product_type', $request->product_type);
            }

            if ($request->boolean('active_only')) {
                $query->where('status', 'active');
            }

            if ($request->filled('search')) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('code', 'like', "%{$search}%")
                        ->orWhere('shelf_location', 'like', "%{$search}%")
                        ->orWhere('description', 'like', "%{$search}%");
                });
            }

            $perPage = $request->get('per_page');

            if ($perPage === 'all' || $perPage == -1) {
                $allShelves = $query->latest()->get();
                return response()->json($allShelves);
            }

            $shelves = $query->latest()->paginate($perPage ?? 10);

            return response()->json([
                'success' => true,
                'data' => $shelves->items(),
                'meta' => [
                    'current_page' => $shelves->currentPage(),
                    'last_page' => $shelves->lastPage(),
                    'per_page' => $shelves->perPage(),
                    'total' => $shelves->total(),
                ],
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Query Error: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            $user = $request->user();

            if (!in_array($user->role, ['admin', 'pharmacist'])) {
                return response()->json(['message' => 'Only admin and pharmacists can create shelves.'], 403);
            }

            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'code' => 'required|string|max:255',
                'shelf_location' => 'nullable|string|max:255',
                'location_type' => ['required', Rule::in([Shelf::LOCATION_WAREHOUSE, Shelf::LOCATION_BRANCH])],
                'product_type' => ['required', Rule::in([Shelf::PRODUCT_MEDICINE, Shelf::PRODUCT_RETAIL_OTC])],
                'branch_id' => 'nullable|exists:branches,id',
                'warehouse_id' => 'nullable|integer',
                'description' => 'nullable|string',
                'capacity' => 'required|integer|min:1|max:1000000',
                'status' => 'nullable|in:active,inactive',
            ]);

            // Security: never trust a branch_id the client should not be able to use.
            if ($validated['location_type'] === Shelf::LOCATION_WAREHOUSE) {
                $validated['branch_id'] = null;
                $validated['warehouse_id'] = $validated['warehouse_id'] ?? 1;
            } else {
                // Branch shelf: enforce the requesting user's authority.
                if ($user->role !== 'admin') {
                    $userBranch = $user->getBranchScope($request);
                    if (!$userBranch) {
                        return response()->json(['message' => 'You are not assigned to a branch.'], 403);
                    }
                    $validated['branch_id'] = $userBranch;
                } elseif (empty($validated['branch_id'])) {
                    return response()->json(['message' => 'A branch must be selected for a branch shelf.'], 422);
                }
            }

            // Uniqueness within (location_type, branch_id, product_type)
            $duplicate = Shelf::where('location_type', $validated['location_type'])
                ->where('branch_id', $validated['branch_id'])
                ->where('product_type', $validated['product_type'])
                ->where(function ($q) use ($validated) {
                    $q->where('code', $validated['code'])
                        ->orWhere('shelf_location', $validated['shelf_location'] ?? $validated['code']);
                })
                ->exists();

            if ($duplicate) {
                return response()->json([
                    'success' => false,
                    'message' => 'A shelf with this code/name already exists for the selected location and product type.',
                ], 422);
            }

            $validated['status'] = $validated['status'] ?? 'active';
            $validated['current_quantity'] = 0;
            if (empty($validated['shelf_location'])) {
                $validated['shelf_location'] = $validated['code'];
            }

            $shelf = Shelf::create($validated);

            return response()->json([
                'success' => true,
                'message' => 'Shelf created successfully',
                'data' => $shelf,
            ], 201);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error creating shelf: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function show(Shelf $shelf)
    {
        return response()->json($shelf->loadCount(['medicines', 'retailProducts']));
    }

    public function items($id)
    {
        $shelf = Shelf::findOrFail($id);

        if ($shelf->product_type === Shelf::PRODUCT_RETAIL_OTC) {
            $items = $shelf->retailProducts()->with('branch')->orderBy('name')->get();
            $total = $items->sum('quantity');
        } else {
            $items = $shelf->medicines()->with('category')->orderBy('name')->get();
            $total = $items->sum('quantity');
        }

        return response()->json([
            'shelf' => $shelf,
            'items' => $items,
            'total_items' => $total,
            'item_count' => $items->count(),
            'product_type' => $shelf->product_type,
        ]);
    }

    public function update(Request $request, Shelf $shelf)
    {
        try {
            $user = $request->user();

            if (!in_array($user->role, ['admin', 'pharmacist'])) {
                return response()->json(['message' => 'Only admin and pharmacists can update shelves.'], 403);
            }

            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'code' => 'required|string|max:255',
                'shelf_location' => 'nullable|string|max:255',
                'location_type' => ['required', Rule::in([Shelf::LOCATION_WAREHOUSE, Shelf::LOCATION_BRANCH])],
                'product_type' => ['required', Rule::in([Shelf::PRODUCT_MEDICINE, Shelf::PRODUCT_RETAIL_OTC])],
                'branch_id' => 'nullable|exists:branches,id',
                'warehouse_id' => 'nullable|integer',
                'description' => 'nullable|string',
                'capacity' => 'required|integer|min:1|max:1000000',
                'status' => 'nullable|in:active,inactive',
            ]);

            // Security: enforce branch authority.
            if ($validated['location_type'] === Shelf::LOCATION_WAREHOUSE) {
                $validated['branch_id'] = null;
                $validated['warehouse_id'] = $validated['warehouse_id'] ?? $shelf->warehouse_id ?? 1;
            } else {
                if ($user->role !== 'admin') {
                    $userBranch = $user->getBranchScope($request);
                    if (!$userBranch) {
                        return response()->json(['message' => 'You are not assigned to a branch.'], 403);
                    }
                    $validated['branch_id'] = $userBranch;
                } elseif (empty($validated['branch_id'])) {
                    return response()->json(['message' => 'A branch must be selected for a branch shelf.'], 422);
                }
            }

            // Capacity cannot be reduced below current usage.
            if ((int) $validated['capacity'] < ($shelf->current_quantity ?: 0)) {
                return response()->json([
                    'success' => false,
                    'message' => "Capacity cannot be less than the current usage ({$shelf->current_quantity} items).",
                ], 422);
            }

            // Uniqueness within (location_type, branch_id, product_type), excluding self.
            $duplicate = Shelf::where('location_type', $validated['location_type'])
                ->where('branch_id', $validated['branch_id'])
                ->where('product_type', $validated['product_type'])
                ->where(function ($q) use ($validated) {
                    $q->where('code', $validated['code'])
                        ->orWhere('shelf_location', $validated['shelf_location'] ?? $validated['code']);
                })
                ->where('id', '!=', $shelf->id)
                ->exists();

            if ($duplicate) {
                return response()->json([
                    'success' => false,
                    'message' => 'A shelf with this code/name already exists for the selected location and product type.',
                ], 422);
            }

            if (empty($validated['shelf_location'])) {
                $validated['shelf_location'] = $validated['code'];
            }

            $shelf->update($validated);

            return response()->json([
                'success' => true,
                'message' => 'Shelf updated successfully',
                'data' => $shelf,
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error updating shelf: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function destroy(Request $request, Shelf $shelf)
    {
        try {
            if (!in_array($request->user()->role, ['admin', 'pharmacist'])) {
                return response()->json(['message' => 'Only admin and pharmacists can delete shelves.'], 403);
            }

            if ($shelf->medicines()->count() > 0 || $shelf->retailProducts()->count() > 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot delete shelf with existing items. Move or delete the items first.',
                ], 422);
            }

            $shelf->delete();
            return response()->json([
                'success' => true,
                'message' => 'Shelf deleted successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error deleting shelf: ' . $e->getMessage(),
            ], 500);
        }
    }
}
