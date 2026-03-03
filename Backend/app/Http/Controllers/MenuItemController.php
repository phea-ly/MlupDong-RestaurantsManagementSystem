<?php

namespace App\Http\Controllers;

use App\Models\MenuItem;
use Illuminate\Http\Request;

class MenuItemController extends Controller
{
    public function index()
    {
        return response()->json(MenuItem::query()->with('category')->latest('menu_item_id')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'item_name' => ['required', 'string', 'max:150'],
            'price' => ['required', 'numeric', 'min:0'],
            'image' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'status' => ['nullable', 'boolean'],
            'category_id' => ['nullable', 'exists:categories,category_id'],
        ]);

        $menuItem = MenuItem::query()->create($validated);

        return response()->json($menuItem->load('category'), 201);
    }

    public function show(string $id)
    {
        return response()->json(MenuItem::query()->with('category')->findOrFail($id));
    }

    public function update(Request $request, string $id)
    {
        $menuItem = MenuItem::query()->findOrFail($id);

        $validated = $request->validate([
            'item_name' => ['sometimes', 'required', 'string', 'max:150'],
            'price' => ['sometimes', 'required', 'numeric', 'min:0'],
            'image' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'status' => ['nullable', 'boolean'],
            'category_id' => ['nullable', 'exists:categories,category_id'],
        ]);

        $menuItem->update($validated);

        return response()->json($menuItem->load('category'));
    }

    public function destroy(string $id)
    {
        $menuItem = MenuItem::query()->findOrFail($id);
        $menuItem->delete();

        return response()->noContent();
    }
}
