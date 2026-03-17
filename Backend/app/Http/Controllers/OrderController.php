<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Support\KdsPayload;
use App\Events\KdsOrderEvent;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class OrderController extends Controller
{
    public function index()
    {
        return response()->json(
            Order::query()
                ->with(['user', 'table', 'discount', 'restaurant', 'orderItems', 'payments', 'statusLogs'])
                ->latest('order_id')
                ->get()
        );
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'order_number' => ['nullable', 'string', 'max:50', 'unique:orders,order_number'],
            'order_type' => ['required', Rule::in(['dine_in', 'takeaway', 'delivery'])],
            'total_amount' => ['nullable', 'numeric', 'min:0'],
            'tax' => ['nullable', 'numeric', 'min:0'],
            'final_amount' => ['nullable', 'numeric', 'min:0'],
            'payment_status' => ['nullable', Rule::in(['pending', 'paid', 'cancelled'])],
            'order_status' => ['nullable', Rule::in(['new', 'received', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled'])],
            'user_id' => ['nullable', 'exists:users,user_id'],
            'table_id' => ['nullable', 'exists:tables,table_id'],
            'discount_id' => ['nullable', 'exists:discounts,discount_id'],
            'restaurant_id' => ['nullable', 'exists:restaurants,restaurant_id'],
        ]);

        $order = Order::query()->create($validated);

        $payload = KdsPayload::fromOrder($order);
        event(new KdsOrderEvent('order.created', $payload));

        return response()->json(
            $order->load(['user', 'table', 'discount', 'restaurant', 'orderItems', 'payments', 'statusLogs']),
            201
        );
    }

    public function show(string $id)
    {
        $order = Order::query()
            ->with(['user', 'table', 'discount', 'restaurant', 'orderItems', 'payments', 'statusLogs'])
            ->findOrFail($id);

        return response()->json($order);
    }

    public function update(Request $request, string $id)
    {
        $order = Order::query()->findOrFail($id);

        $validated = $request->validate([
            'order_number' => [
                'nullable',
                'string',
                'max:50',
                Rule::unique('orders', 'order_number')->ignore($id, 'order_id'),
            ],
            'order_type' => ['sometimes', 'required', Rule::in(['dine_in', 'takeaway', 'delivery'])],
            'total_amount' => ['nullable', 'numeric', 'min:0'],
            'tax' => ['nullable', 'numeric', 'min:0'],
            'final_amount' => ['nullable', 'numeric', 'min:0'],
            'payment_status' => ['nullable', Rule::in(['pending', 'paid', 'cancelled'])],
            'order_status' => ['nullable', Rule::in(['new', 'received', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled'])],
            'user_id' => ['nullable', 'exists:users,user_id'],
            'table_id' => ['nullable', 'exists:tables,table_id'],
            'discount_id' => ['nullable', 'exists:discounts,discount_id'],
            'restaurant_id' => ['nullable', 'exists:restaurants,restaurant_id'],
        ]);

        $order->update($validated);

        $payload = KdsPayload::fromOrder($order);
        event(new KdsOrderEvent('order.status.updated', $payload));

        return response()->json(
            $order->load(['user', 'table', 'discount', 'restaurant', 'orderItems', 'payments', 'statusLogs'])
        );
    }

    public function destroy(string $id)
    {
        $order = Order::query()->findOrFail($id);
        $order->delete();

        return response()->noContent();
    }
}
