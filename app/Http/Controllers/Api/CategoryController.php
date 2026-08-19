<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCategoryRequest;
use App\Http\Requests\UpdateCategoryRequest;
use App\Models\Category;
use App\Models\Shelf;
use App\Models\Medicine;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class CategoryController extends Controller
{
    public function index(Request $request)
    {
        try {
            $query = Category::withCount('medicines');

            if ($request->filled('search')) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('description', 'like', "%{$search}%")
                      ->orWhere('shelf_location', 'like', "%{$search}%");
                });
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
                    'last_page'    => $categories->lastPage(),
                    'per_page'     => $categories->perPage(),
                    'total'        => $categories->total(),
                ],
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Query Error: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function store(StoreCategoryRequest $request)
    {
        try {
            if (!in_array($request->user()->role, ['admin', 'pharmacist'])) {
                return response()->json(['message' => 'Only admin and pharmacists can create categories.'], 403);
            }

            $validated = $request->validated();

            // Restriction: If category type is retail or otc, check if selected shelf is occupied by medicine
            if (in_array($validated['type'], ['retail', 'otc']) && !empty($validated['shelf_location'])) {
                $shelf = Shelf::where('shelf_location', $validated['shelf_location'])->first();
                $isOccupiedByMedicine = false;
                if ($shelf) {
                    $isOccupiedByMedicine = Medicine::where('shelf_id', $shelf->id)
                        ->orWhere('shelf_location', $validated['shelf_location'])
                        ->exists();
                } else {
                    $isOccupiedByMedicine = Medicine::where('shelf_location', $validated['shelf_location'])->exists();
                }

                if ($isOccupiedByMedicine) {
                    throw ValidationException::withMessages([
                        'shelf_location' => 'This shelf is already occupied by medicine and cannot be selected for retail or OTC products.',
                    ]);
                }
            }

            $category = Category::create($validated);

            return response()->json([
                'success' => true,
                'message' => 'Category created successfully',
                'data'    => $category->loadCount('medicines'),
            ], 201);
        } catch (ValidationException $e) {
            return response()->json([
                'success'  => false,
                'message'  => 'Validation failed',
                'errors'   => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error creating category: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function show(Category $category)
    {
        return response()->json($category->loadCount('medicines'));
    }

    public function update(UpdateCategoryRequest $request, Category $category)
    {
        try {
            if (!in_array($request->user()->role, ['admin', 'pharmacist'])) {
                return response()->json(['message' => 'Only admin and pharmacists can update categories.'], 403);
            }

            $validated = $request->validated();

            // Restriction: If category type is retail or otc, check if selected shelf is occupied by medicine
            if (in_array($validated['type'], ['retail', 'otc']) && !empty($validated['shelf_location'])) {
                $shelf = Shelf::where('shelf_location', $validated['shelf_location'])->first();
                $isOccupiedByMedicine = false;
                if ($shelf) {
                    $isOccupiedByMedicine = Medicine::where('shelf_id', $shelf->id)
                        ->orWhere('shelf_location', $validated['shelf_location'])
                        ->exists();
                } else {
                    $isOccupiedByMedicine = Medicine::where('shelf_location', $validated['shelf_location'])->exists();
                }

                if ($isOccupiedByMedicine) {
                    throw ValidationException::withMessages([
                        'shelf_location' => 'This shelf is already occupied by medicine and cannot be selected for retail or OTC products.',
                    ]);
                }
            }

            $category->update($validated);

            return response()->json([
                'success' => true,
                'message' => 'Category updated successfully',
                'data'    => $category->loadCount('medicines'),
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'success'  => false,
                'message'  => 'Validation failed',
                'errors'   => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error updating category: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function destroy(Request $request, Category $category)
    {
        try {
            if (!in_array($request->user()->role, ['admin', 'pharmacist'])) {
                return response()->json(['message' => 'Only admin and pharmacists can delete categories.'], 403);
            }

            if ($category->medicines()->count() > 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot delete category with existing medicines. Move or delete the medicines first.',
                ], 422);
            }

            $category->delete();
            return response()->json([
                'success' => true,
                'message' => 'Category deleted successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error deleting category: ' . $e->getMessage(),
            ], 500);
        }
    }
}
