<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class CategoryController extends Controller
{
    public function index(Request $request)
    {
        try {
            $user = $request->user();
            $branchScope = $user ? $user->getBranchScope($request) : null;

            $query = Category::withCount('medicines');

            if ($branchScope) {
                $query->where('branch_id', $branchScope);
            }

            if ($request->filled('search')) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('description', 'like', "%{$search}%")
                      ->orWhere('shelf_location', 'like', "%{$search}%");
                });
            }

            if ($request->filled('type')) {
                $query->where('type', $request->type);
            }

            $perPage = $request->get('per_page');
            
            if ($perPage === 'all' || $perPage == -1) {
                $allCategories = $query->latest()->get();
                return response()->json($allCategories);
            }

            $categories = $query->latest()->paginate($perPage ?? 15);

            return response()->json([
                'success' => true,
                'data' => $categories->items(),
                'meta' => [
                    'current_page' => $categories->currentPage(),
                    'last_page' => $categories->lastPage(),
                    'per_page' => $categories->perPage(),
                    'total' => $categories->total(),
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
            $user = $request->user();
            if (!in_array($user->role, ['admin', 'pharmacist'])) {
                return response()->json(['message' => 'Only admin and pharmacists can create categories.'], 403);
            }

            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'description' => 'nullable|string',
                'shelf_location' => 'nullable|string|max:255',
                'type' => 'nullable|string|max:50',
                'branch_id' => 'nullable|exists:branches,id',
            ]);

            $branchScope = $user->getBranchScope($request);
            if ($branchScope) {
                $validated['branch_id'] = $branchScope;
            }

            $category = Category::create($validated);
            
            return response()->json([
                'success' => true,
                'message' => 'Category created successfully',
                'data' => $category->loadCount('medicines')
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
                'message' => 'Error creating category: ' . $e->getMessage()
            ], 500);
        }
    }

    public function show(Request $request, Category $category)
    {
        $branchScope = $request->user()->getBranchScope($request);
        if ($branchScope && $category->branch_id && $category->branch_id !== $branchScope) {
            return response()->json(['message' => 'Unauthorized access to this category.'], 403);
        }

        return response()->json($category->loadCount('medicines'));
    }

    public function update(Request $request, Category $category)
    {
        try {
            $user = $request->user();
            if (!in_array($user->role, ['admin', 'pharmacist'])) {
                return response()->json(['message' => 'Only admin and pharmacists can update categories.'], 403);
            }

            $branchScope = $user->getBranchScope($request);
            if ($branchScope && $category->branch_id && $category->branch_id !== $branchScope) {
                return response()->json(['message' => 'Unauthorized access to update this category.'], 403);
            }

            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'description' => 'nullable|string',
                'shelf_location' => 'nullable|string|max:255',
                'type' => 'nullable|string|max:50',
                'branch_id' => 'nullable|exists:branches,id',
            ]);

            if ($branchScope) {
                unset($validated['branch_id']);
            }

            $category->update($validated);
            
            return response()->json([
                'success' => true,
                'message' => 'Category updated successfully',
                'data' => $category->loadCount('medicines')
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
                'message' => 'Error updating category: ' . $e->getMessage()
            ], 500);
        }
    }

    public function destroy(Request $request, Category $category)
    {
        try {
            $user = $request->user();
            if (!in_array($user->role, ['admin', 'pharmacist'])) {
                return response()->json(['message' => 'Only admin and pharmacists can delete categories.'], 403);
            }

            $branchScope = $user->getBranchScope($request);
            if ($branchScope && $category->branch_id && $category->branch_id !== $branchScope) {
                return response()->json(['message' => 'Unauthorized access to delete this category.'], 403);
            }

            if ($category->medicines()->count() > 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot delete category with existing medicines. Move or delete the medicines first.'
                ], 422);
            }

            $category->delete();
            return response()->json([
                'success' => true,
                'message' => 'Category deleted successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error deleting category: ' . $e->getMessage()
            ], 500);
        }
    }
}