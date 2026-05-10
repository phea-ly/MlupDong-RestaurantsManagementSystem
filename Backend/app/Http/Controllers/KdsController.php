<?php
// app/Http/Controllers/KdsController.php

namespace App\Http\Controllers;

use App\Events\KdsOrderEvent;
use App\Models\Order;
use App\Support\KdsPayload;
use Throwable;
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

        return response()->json(
            $orders->map(fn ($order) => KdsPayload::fromOrder($order)->toArray())
        );
    }

    public function updateStatus(Request $request, string $id)
    {
        $status = $request->input('status', $request->input('order_status'));

        validator(
            ['status' => $status],
            [
                'status' => ['required', Rule::in(['new', 'received', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled'])],
            ]
        )->validate();

        $order = Order::query()
            ->with(['table', 'orderItems.menuItem'])
            ->findOrFail($id);

        $order->update(['order_status' => $status]);
        $order->refresh();

        $payload = KdsPayload::fromOrder($order);

        try {
            event(new KdsOrderEvent('order.status.updated', $payload));
        } catch (Throwable $e) {
            report($e);
        }

        return response()->json($payload->toArray());
    }
}
