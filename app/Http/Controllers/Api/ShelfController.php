<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Shelf;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class ShelfController extends Controller
{
    public function index(Request $request)
    {
        try {
            $user = $request->user();
            $branchScope = $user ? $user->getBranchScope($request) : null;

            $query = Shelf::withCount('medicines')
                ->when($branchScope, fn($q) => $q->where('branch_id', $branchScope));

            if ($request->filled('search')) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('shelf_location', 'like', "%{$search}%")
                      ->orWhere('description', 'like', "%{$search}%");
                });
            }

            $perPage = $request->get('per_page');
            
            if ($perPage === 'all' || $perPage == -1) {
                $allShelves = $query->latest()->get();
                return response()->json($allShelves);
            }

            $shelves = $query->latest()->paginate($perPage ?? 15);

            return response()->json([
                'success' => true,
                'data' => $shelves->items(),
                'meta' => [
                    'current_page' => $shelves->currentPage(),
                    'last_page' => $shelves->lastPage(),
                    'per_page' => $shelves->perPage(),
                    'total' => $shelves->total(),
                ]
            ]);

        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Query Error: ' . $e->getMessage()
            ], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            // Check permissions
            if (!in_array($request->user()->role, ['admin', 'pharmacist'])) {
                return response()->json(['message' => 'Only admin and pharmacists can create shelves.'], 403);
            }

            // Validate the request
            $validated = $request->validate([
                'shelf_location' => 'required|string|max:255|unique:shelves,shelf_location',
                'description' => 'nullable|string',
                'capacity' => 'required|integer|min:1',
                'branch_id' => 'nullable|exists:branches,id',
            ]);

            // Set name from shelf_location
            $validated['name'] = $validated['shelf_location'];

            if (empty($validated['branch_id'])) {
                $userBranch = $request->user()->getBranchScope($request);
                if ($userBranch) {
                    $validated['branch_id'] = $userBranch;
                }
            }

            // Create the shelf
            $shelf = Shelf::create($validated);
            
            return response()->json([
                'success' => true,
                'message' => 'Shelf created successfully',
                'data' => $shelf->loadCount('medicines')
            ], 201);

        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error creating shelf: ' . $e->getMessage()
            ], 500);
        }
    }

    public function show(Shelf $shelf)
    {
        return response()->json($shelf->loadCount('medicines')->load('medicines.category'));
    }

    public function items($id)
    {
        $shelf = Shelf::findOrFail($id);
        $items = $shelf->medicines()->with('category')->orderBy('name')->get();

        return response()->json([
            'shelf' => $shelf,
            'items' => $items,
            'total_items' => $items->sum('quantity'),
            'item_count' => $items->count(),
        ]);
    }

    public function update(Request $request, Shelf $shelf)
    {
        try {
            // Check permissions
            if (!in_array($request->user()->role, ['admin', 'pharmacist'])) {
                return response()->json(['message' => 'Only admin and pharmacists can update shelves.'], 403);
            }

            // Validate the request
            $validated = $request->validate([
                'shelf_location' => 'required|string|max:255|unique:shelves,shelf_location,' . $shelf->id,
                'description' => 'nullable|string',
                'capacity' => 'required|integer|min:1',
                'branch_id' => 'nullable|exists:branches,id',
            ]);

            // Set name from shelf_location
            $validated['name'] = $validated['shelf_location'];

            // Update the shelf
            $shelf->update($validated);
            
            return response()->json([
                'success' => true,
                'message' => 'Shelf updated successfully',
                'data' => $shelf->loadCount('medicines')
            ]);

        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error updating shelf: ' . $e->getMessage()
            ], 500);
        }
    }

    public function destroy(Request $request, Shelf $shelf)
    {
        try {
            // Check permissions
            if (!in_array($request->user()->role, ['admin', 'pharmacist'])) {
                return response()->json(['message' => 'Only admin and pharmacists can delete shelves.'], 403);
            }

            // Check if shelf has medicines
            if ($shelf->medicines()->count() > 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot delete shelf with existing medicines. Move or delete the medicines first.'
                ], 422);
            }

            $shelf->delete();
            return response()->json([
                'success' => true,
                'message' => 'Shelf deleted successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error deleting shelf: ' . $e->getMessage()
            ], 500);
        }
    }
}