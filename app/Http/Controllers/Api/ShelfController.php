<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Shelf;
use Illuminate\Http\Request;

class ShelfController extends Controller
{
    /**
     * Display a listing of all shelves with their medicine counts.
     */
    public function index(Request $request)
    {
        $query = Shelf::query();

        // Search by shelf code or location
        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('shelf_code', 'like', "%{$search}%")
                  ->orWhere('location', 'like', "%{$search}%");
            });
        }

        $shelves = $query->withCount('medicines')
            ->orderBy('shelf_code')
            ->get();

        return response()->json($shelves);
    }

    /**
     * Store a newly created shelf in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'shelf_code' => 'required|string|max:255|unique:shelves,shelf_code',
            'location'   => 'required|string|max:255',
        ]);

        $shelf = Shelf::create($validated);

        return response()->json($shelf, 201);
    }

    /**
     * Display the specified shelf.
     */
    public function show(Shelf $shelf)
    {
        return response()->json($shelf->load('medicines'));
    }

    /**
     * Update the specified shelf in storage.
     */
    public function update(Request $request, Shelf $shelf)
    {
        $validated = $request->validate([
            'shelf_code' => 'required|string|max:255|unique:shelves,shelf_code,' . $shelf->id,
            'location'   => 'required|string|max:255',
        ]);

        $shelf->update($validated);

        return response()->json($shelf);
    }

    /**
     * Remove the specified shelf from storage.
     */
    public function destroy(Shelf $shelf)
    {
        $shelf->delete();

        return response()->json(['message' => 'Shelf deleted']);
    }
}
