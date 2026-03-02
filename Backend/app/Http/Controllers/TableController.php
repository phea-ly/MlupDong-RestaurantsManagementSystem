<?php

namespace App\Http\Controllers;

use App\Models\RestaurantTable;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class TableController extends Controller
{
    public function index()
    {
        return response()->json(
            RestaurantTable::query()->with('restaurant')->latest('table_id')->get()
        );
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'table_number' => ['required', 'integer', 'min:1'],
            'capacity' => ['required', 'integer', 'min:1'],
            'status' => ['nullable', Rule::in(['available', 'unavailable'])],
            'location' => ['nullable', 'string', 'max:100'],
            'qr_code' => ['nullable', 'string', 'max:255', 'unique:tables,qr_code'],
            'qr_code_url' => ['nullable', 'string', 'max:255'],
            'restaurant_id' => ['nullable', 'exists:restaurants,restaurant_id'],
        ]);

        $table = RestaurantTable::query()->create($validated);

        return response()->json($table->load('restaurant'), 201);
    }

    public function show(string $id)
    {
        return response()->json(
            RestaurantTable::query()->with('restaurant')->findOrFail($id)
        );
    }

    public function update(Request $request, string $id)
    {
        $table = RestaurantTable::query()->findOrFail($id);

        $validated = $request->validate([
            'table_number' => ['sometimes', 'required', 'integer', 'min:1'],
            'capacity' => ['sometimes', 'required', 'integer', 'min:1'],
            'status' => ['nullable', Rule::in(['available', 'unavailable'])],
            'location' => ['nullable', 'string', 'max:100'],
            'qr_code' => [
                'nullable',
                'string',
                'max:255',
                Rule::unique('tables', 'qr_code')->ignore($id, 'table_id'),
            ],
            'qr_code_url' => ['nullable', 'string', 'max:255'],
            'restaurant_id' => ['nullable', 'exists:restaurants,restaurant_id'],
        ]);

        $table->update($validated);

        return response()->json($table->load('restaurant'));
    }

    public function destroy(string $id)
    {
        $table = RestaurantTable::query()->findOrFail($id);
        $table->delete();

        return response()->noContent();
    }
}
