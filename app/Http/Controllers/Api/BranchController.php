<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Branch;
use App\Models\Medicine;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class BranchController extends Controller
{
    public function index(Request $request)
    {
        try {
            $query = Branch::query();

            if ($request->filled('search')) {
                $search = $request->search;
                $query->where('name', 'like', "%{$search}%")
                      ->orWhere('location', 'like', "%{$search}%");
            }

            $perPage = $request->get('per_page', 15);
            $branches = $query->latest()->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => $branches->items(),
                'meta' => [
                    'current_page' => $branches->currentPage(),
                    'last_page' => $branches->lastPage(),
                    'per_page' => $branches->perPage(),
                    'total' => $branches->total(),
                ]
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage()
            ], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'location' => 'required|string|max:255',
                'manager_name' => 'nullable|string|max:255',
                'phone' => 'nullable|string|max:50',
                'email' => 'nullable|email|max:255',
                'status' => 'in:active,inactive',
            ]);

            $branch = Branch::create($validated);
            return response()->json([
                'success' => true,
                'message' => 'Branch created successfully',
                'data' => $branch
            ], 201);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'errors' => $e->errors()
            ], 422);
        }
    }

    public function show(Branch $branch)
    {
        return response()->json([
            'success' => true,
            'data' => $branch
        ]);
    }

    public function stats()
    {
        return response()->json([
            'total' => Branch::count(),
            'active' => Branch::where('status', 'active')->count(),
            'inactive' => Branch::where('status', 'inactive')->count(),
        ]);
    }

    public function update(Request $request, Branch $branch)
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'location' => 'required|string|max:255',
                'manager_name' => 'nullable|string|max:255',
                'phone' => 'nullable|string|max:50',
                'email' => 'nullable|email|max:255',
                'status' => 'in:active,inactive',
            ]);

            $branch->update($validated);
            return response()->json([
                'success' => true,
                'message' => 'Branch updated successfully',
                'data' => $branch
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'errors' => $e->errors()
            ], 422);
        }
    }

    public function destroy(Branch $branch)
    {
        try {
            $branch->delete();
            return response()->json([
                'success' => true,
                'message' => 'Branch deleted successfully'
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage()
            ], 500);
        }
    }

    public function inventory(Branch $branch)
    {
        $inventory = Medicine::where('branch_id', $branch->id)
            ->with(['category', 'supplier'])
            ->get();

        $stats = [
            'total_medicines' => $inventory->count(),
            'total_items' => $inventory->sum('quantity'),
            'low_stock' => $inventory->whereColumn('quantity', '<=', 'reorder_level')->count(),
            'out_of_stock' => $inventory->where('quantity', 0)->count(),
        ];

        return response()->json([
            'success' => true,
            'data' => $inventory,
            'stats' => $stats
        ]);
    }
}