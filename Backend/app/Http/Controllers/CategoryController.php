<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    public function index()
    {
        return response()->json(Category::query()->with('restaurant')->latest('category_id')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'category_name' => ['required', 'string', 'max:150'],
            'description' => ['nullable', 'string'],
            'status' => ['nullable', 'boolean'],
            'restaurant_id' => ['nullable', 'exists:restaurants,restaurant_id'],
        ]);

        $category = Category::query()->create($validated);

        return response()->json($category->load('restaurant'), 201);
    }

    public function show(string $id)
    {
        return response()->json(Category::query()->with('restaurant')->findOrFail($id));
    }

    public function update(Request $request, string $id)
    {
        $category = Category::query()->findOrFail($id);

        $validated = $request->validate([
            'category_name' => ['sometimes', 'required', 'string', 'max:150'],
            'description' => ['nullable', 'string'],
            'status' => ['nullable', 'boolean'],
            'restaurant_id' => ['nullable', 'exists:restaurants,restaurant_id'],
        ]);

        $category->update($validated);

        return response()->json($category->load('restaurant'));
    }

    public function destroy(string $id)
    {
        $category = Category::query()->findOrFail($id);
        $category->delete();

        return response()->noContent();
    }
}
