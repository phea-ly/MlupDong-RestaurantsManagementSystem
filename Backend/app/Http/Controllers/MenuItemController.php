<?php

namespace App\Http\Controllers;

use App\Models\MenuItem;
use App\Traits\LogsActivity;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class MenuItemController extends Controller
{
    use LogsActivity;

    public function index()
    {
        return response()->json(MenuItem::query()->with('category')->latest('menu_item_id')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'item_name'   => ['required', 'string', 'max:150'],
            'price'       => ['required', 'numeric', 'min:0'],
            'image'       => ['nullable'],
            'description' => ['nullable', 'string'],
            'status'      => ['nullable', 'boolean'],
            'category_id' => ['nullable', 'exists:categories,category_id'],
        ]);

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('menu-images', 'public');
            $validated['image'] = Storage::url($path);
        }

        $menuItem = MenuItem::query()->create($validated);
        // Observer logs 'created' automatically — no manual log needed here

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
            'item_name'   => ['sometimes', 'required', 'string', 'max:150'],
            'price'       => ['sometimes', 'required', 'numeric', 'min:0'],
            'image'       => ['nullable'],
            'description' => ['nullable', 'string'],
            'status'      => ['nullable', 'boolean'],
            'category_id' => ['nullable', 'exists:categories,category_id'],
        ]);

        if ($request->hasFile('image')) {
            if ($menuItem->image && str_starts_with($menuItem->image, '/storage/')) {
                $oldPath = str_replace('/storage/', 'public/', $menuItem->image);
                Storage::delete($oldPath);
            }
            $path = $request->file('image')->store('menu-images', 'public');
            $validated['image'] = Storage::url($path);
        }

        $menuItem->update($validated);
        // Observer logs 'updated' automatically

        return response()->json($menuItem->load('category'));
    }

    public function destroy(string $id)
    {
        $menuItem = MenuItem::query()->findOrFail($id);

        if ($menuItem->image && str_starts_with($menuItem->image, '/storage/')) {
            $oldPath = str_replace('/storage/', 'public/', $menuItem->image);
            Storage::delete($oldPath);
        }

        $menuItem->delete();
        // Observer logs 'deleted' automatically

        return response()->noContent();
    }

    public function updateAvailability(Request $request, string $id)
    {
        $menuItem = MenuItem::query()->findOrFail($id);

        $validated = $request->validate([
            'status' => ['required', 'boolean'],
        ]);

        $menuItem->update(['status' => $validated['status']]);

        // Log with a specific action — more descriptive than the generic 'updated'
        $state = $validated['status'] ? 'enabled' : 'disabled';
        $this->logActivity(
            'menu',
            'availability_changed',
            "Menu item \"{$menuItem->item_name}\" availability {$state}.",
            ['menu_item_id' => (int) $id, 'status' => $validated['status']]
        );

        return response()->json([
            'message' => 'Menu availability updated successfully',
            'data'    => $menuItem->load('category'),
        ]);
    }
}