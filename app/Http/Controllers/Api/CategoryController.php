<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCategoryRequest;
use App\Http\Requests\UpdateCategoryRequest;
use App\Models\Category;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    /**
     * Display a paginated list of categories with medicine counts.
     */
    public function index(Request $request)
    {
        $query = Category::withCount('medicines');

        if ($request->has('page') || $request->has('per_page')) {
            return response()->json(
                $query->orderBy('name')->paginate((int) $request->input('per_page', 10))
            );
        }

        return response()->json($query->orderBy('name')->get());
    }

    /**
     * Store a newly created category.
     */
    public function store(StoreCategoryRequest $request)
    {
        $category = Category::create($request->validated());

        return response()->json($category->loadCount('medicines'), 201);
    }

    /**
     * Display the specified category.
     */
    public function show(Category $category)
    {
        return response()->json($category->loadCount('medicines'));
    }

    /**
     * Update the specified category.
     */
    public function update(UpdateCategoryRequest $request, Category $category)
    {
        $category->update($request->validated());

        return response()->json($category->loadCount('medicines'));
    }

    /**
     * Delete the specified category.
     *
     * Category deletion is prevented when the category is already
     * associated with medicines to avoid orphaned foreign keys.
     */
    public function destroy(Category $category)
    {
        if ($category->isAssociatedWithMedicines()) {
            return response()->json([
                'message' => 'Cannot delete the category "' . $category->name .
                             '" because it is associated with ' .
                             $category->medicines()->count() . ' medicine(s). ' .
                             'Reassign or delete the associated medicines first.',
                'error'   => 'category_associated_with_medicines',
            ], 422);
        }

        $category->delete();

        return response()->json(['message' => 'Category deleted successfully']);
    }
}
