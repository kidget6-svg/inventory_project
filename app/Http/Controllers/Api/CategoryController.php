<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    public function index()
    {
        $categories = Category::withCount('medicines')->get();
        return response()->json($categories);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'shelf_location' => 'nullable|string|max:255',
        ]);

        $category = Category::create($validated);
        return response()->json($category->loadCount('medicines'), 201);
    }

    public function show(Category $category)
    {
        return response()->json($category->loadCount('medicines'));
    }

    public function update(Request $request, Category $category)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'shelf_location' => 'nullable|string|max:255',
        ]);

        $category->update($validated);
        return response()->json($category->loadCount('medicines'));
    }

    public function destroy(Category $category)
    {
        $category->delete();
        return response()->json(['message' => 'Category deleted successfully']);
    }
}