<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class CategoryController extends Controller
{
    public function index()
    {
        return response()->json(
            Category::query()
                ->with('restaurant')
                ->withCount('menuItems')          // → menu_items_count on each category
                ->latest('category_id')
                ->get()
        );
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'category_name' => [
                'required',
                'string',
                'max:150',
                // Unique per restaurant (or globally if no restaurant_id)
                Rule::unique('categories', 'category_name')
                    ->where('restaurant_id', $request->restaurant_id),
            ],
            'description'   => ['nullable', 'string'],
            'status'        => ['nullable', 'boolean'],
            'restaurant_id' => ['nullable', 'exists:restaurants,restaurant_id'],
        ]);

        $category = Category::query()->create($validated);

        return response()->json(
            $category->loadCount('menuItems')->load('restaurant'),
            201
        );
    }

    public function show(string $id)
    {
        return response()->json(
            Category::query()
                ->with('restaurant')
                ->withCount('menuItems')
                ->findOrFail($id)
        );
    }

    public function update(Request $request, string $id)
    {
        $category = Category::query()->findOrFail($id);

        $validated = $request->validate([
            'category_name' => [
                'sometimes',
                'required',
                'string',
                'max:150',
                // Ignore the current category when checking uniqueness
                Rule::unique('categories', 'category_name')
                    ->ignore($id, 'category_id')
                    ->where('restaurant_id', $request->restaurant_id ?? $category->restaurant_id),
            ],
            'description'   => ['nullable', 'string'],
            'status'        => ['nullable', 'boolean'],
            'restaurant_id' => ['nullable', 'exists:restaurants,restaurant_id'],
        ]);

        $category->update($validated);

        return response()->json(
            $category->loadCount('menuItems')->load('restaurant')
        );
    }

    public function destroy(string $id)
    {
        $category = Category::query()->findOrFail($id);
        $category->delete();

        return response()->noContent();
    }
}