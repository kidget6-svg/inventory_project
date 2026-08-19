<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreShelfRequest;
use App\Http\Requests\UpdateShelfRequest;
use App\Models\Shelf;
use Illuminate\Http\Request;

class ShelfController extends Controller
{
    public function index(Request $request)
    {
        try {
            $query = Shelf::withCount('medicines');

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

    public function store(StoreShelfRequest $request)
    {
        if (!in_array($request->user()->role, ['admin', 'pharmacist'])) {
            return response()->json(['message' => 'Only admin and pharmacists can create shelves.'], 403);
        }

        $validated = $request->validated();
        $validated['name'] = $validated['shelf_location'];

        $shelf = Shelf::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Shelf created successfully',
            'data'    => $shelf->loadCount('medicines'),
        ], 201);
    }

    public function show(Shelf $shelf)
    {
        return response()->json($shelf->loadCount('medicines'));
    }

    public function update(UpdateShelfRequest $request, Shelf $shelf)
    {
        if (!in_array($request->user()->role, ['admin', 'pharmacist'])) {
            return response()->json(['message' => 'Only admin and pharmacists can update shelves.'], 403);
        }

        $validated = $request->validated();
        $validated['name'] = $validated['shelf_location'];

        $shelf->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Shelf updated successfully',
            'data'    => $shelf->loadCount('medicines'),
        ]);
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
