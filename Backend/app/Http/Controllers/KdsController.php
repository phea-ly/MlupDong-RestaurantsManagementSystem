<?php
// app/Http/Controllers/KdsController.php

namespace App\Http\Controllers;

use App\Events\KdsOrderEvent;
use App\Models\Order;
use App\Support\KdsPayload;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class KdsController extends Controller
{
    public function orders()
    {
        $orders = Order::query()
            ->whereIn('order_status', ['new', 'received', 'confirmed', 'preparing', 'ready', 'completed'])
            ->with(['table', 'orderItems.menuItem'])
            ->latest('order_id')
            ->get();

        // ✅ Fix: call ->toArray() so JSON response gets plain arrays, not objects
        return response()->json(
            $orders->map(fn ($order) => KdsPayload::fromOrder($order)->toArray())
        );
    }

    public function updateStatus(Request $request, string $id)
    {
        $validated = $request->validate([
            // ✅ Fix: field is 'status' to match frontend PATCH body { status: '...' }
            'status' => ['required', Rule::in(['new', 'received', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled'])],
        ]);

        $order = Order::query()
            ->with(['table', 'orderItems.menuItem'])
            ->findOrFail($id);

        $order->update(['order_status' => $validated['status']]);
        $order->refresh();

        $payload = KdsPayload::fromOrder($order);

        // ✅ Fix: pass KdsPayload object (not array) — KdsOrderEvent expects KdsPayload
        event(new KdsOrderEvent('order.status.updated', $payload));

        return response()->json($payload->toArray());
    }
}