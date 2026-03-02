<?php

namespace App\Http\Controllers;

use App\Models\Restaurant;
use Illuminate\Http\Request;

class RestaurantController extends Controller
{
    public function index()
    {
        return response()->json(Restaurant::query()->latest('restaurant_id')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:150'],
            'address' => ['nullable', 'string', 'max:255'],
            'lat' => ['nullable', 'numeric', 'between:-90,90'],
            'lng' => ['nullable', 'numeric', 'between:-180,180'],
            'allowed_radius_meters' => ['nullable', 'integer', 'min:0'],
            'phone' => ['nullable', 'string', 'max:20'],
            'open_time' => ['nullable', 'date_format:H:i:s'],
            'close_time' => ['nullable', 'date_format:H:i:s'],
        ]);

        $restaurant = Restaurant::create($validated);

        return response()->json($restaurant, 201);
    }

    public function show(string $id)
    {
        return response()->json(Restaurant::query()->findOrFail($id));
    }

    public function update(Request $request, string $id)
    {
        $restaurant = Restaurant::query()->findOrFail($id);

        $validated = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:150'],
            'address' => ['nullable', 'string', 'max:255'],
            'lat' => ['nullable', 'numeric', 'between:-90,90'],
            'lng' => ['nullable', 'numeric', 'between:-180,180'],
            'allowed_radius_meters' => ['nullable', 'integer', 'min:0'],
            'phone' => ['nullable', 'string', 'max:20'],
            'open_time' => ['nullable', 'date_format:H:i:s'],
            'close_time' => ['nullable', 'date_format:H:i:s'],
        ]);

        $restaurant->update($validated);

        return response()->json($restaurant);
    }

    public function destroy(string $id)
    {
        $restaurant = Restaurant::query()->findOrFail($id);
        $restaurant->delete();

        return response()->noContent();
    }
}
