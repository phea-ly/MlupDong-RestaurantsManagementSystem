<?php

namespace App\Http\Controllers;

use App\Models\OrderItem;
use Illuminate\Http\Request;

class OrderItemController extends Controller
{
    public function index()
    {
        return response()->json(OrderItem::query()->with(['order', 'menuItem'])->latest('order_item_id')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'order_id' => ['required', 'exists:orders,order_id'],
            'menu_item_id' => ['required', 'exists:menu_items,menu_item_id'],
            'quantity' => ['required', 'integer', 'min:1'],
            'unit_price' => ['nullable', 'numeric', 'min:0'],
            'subtotal' => ['nullable', 'numeric', 'min:0'],
            'note' => ['nullable', 'string', 'max:255'],
        ]);

        $orderItem = OrderItem::query()->create($validated);

        return response()->json($orderItem->load(['order', 'menuItem']), 201);
    }

    public function show(string $id)
    {
        return response()->json(OrderItem::query()->with(['order', 'menuItem'])->findOrFail($id));
    }

    public function update(Request $request, string $id)
    {
        $orderItem = OrderItem::query()->findOrFail($id);

        $validated = $request->validate([
            'order_id' => ['sometimes', 'required', 'exists:orders,order_id'],
            'menu_item_id' => ['sometimes', 'required', 'exists:menu_items,menu_item_id'],
            'quantity' => ['sometimes', 'required', 'integer', 'min:1'],
            'unit_price' => ['nullable', 'numeric', 'min:0'],
            'subtotal' => ['nullable', 'numeric', 'min:0'],
            'note' => ['nullable', 'string', 'max:255'],
        ]);

        $orderItem->update($validated);

        return response()->json($orderItem->load(['order', 'menuItem']));
    }

    public function destroy(string $id)
    {
        $orderItem = OrderItem::query()->findOrFail($id);
        $orderItem->delete();

        return response()->noContent();
    }
}
