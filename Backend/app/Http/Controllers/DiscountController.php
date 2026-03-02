<?php

namespace App\Http\Controllers;

use App\Models\Discount;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class DiscountController extends Controller
{
    public function index()
    {
        return response()->json(Discount::query()->latest('discount_id')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'code' => ['required', 'string', 'max:50', 'unique:discounts,code'],
            'type' => ['required', Rule::in(['percentage', 'fixed'])],
            'value' => ['required', 'numeric', 'min:0'],
            'min_order_amount' => ['nullable', 'numeric', 'min:0'],
            'expires_at' => ['nullable', 'date'],
            'is_active' => ['nullable', 'boolean'],
            'usage_limit' => ['nullable', 'integer', 'min:0'],
            'used_count' => ['nullable', 'integer', 'min:0'],
        ]);

        $discount = Discount::query()->create($validated);

        return response()->json($discount, 201);
    }

    public function show(string $id)
    {
        return response()->json(Discount::query()->findOrFail($id));
    }

    public function update(Request $request, string $id)
    {
        $discount = Discount::query()->findOrFail($id);

        $validated = $request->validate([
            'code' => [
                'sometimes',
                'required',
                'string',
                'max:50',
                Rule::unique('discounts', 'code')->ignore($id, 'discount_id'),
            ],
            'type' => ['sometimes', 'required', Rule::in(['percentage', 'fixed'])],
            'value' => ['sometimes', 'required', 'numeric', 'min:0'],
            'min_order_amount' => ['nullable', 'numeric', 'min:0'],
            'expires_at' => ['nullable', 'date'],
            'is_active' => ['nullable', 'boolean'],
            'usage_limit' => ['nullable', 'integer', 'min:0'],
            'used_count' => ['nullable', 'integer', 'min:0'],
        ]);

        $discount->update($validated);

        return response()->json($discount);
    }

    public function destroy(string $id)
    {
        $discount = Discount::query()->findOrFail($id);
        $discount->delete();

        return response()->noContent();
    }
}
