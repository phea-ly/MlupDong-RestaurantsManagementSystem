<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Support\KdsPayload;
use App\Events\KdsOrderEvent;
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
            $orders->map(fn ($order) => KdsPayload::fromOrder($order))
        );
    }

    public function updateStatus(Request $request, string $id)
    {
        $validated = $request->validate([
            'order_status' => ['required', Rule::in(['new', 'received', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled'])],
        ]);

        $order = Order::query()->findOrFail($id);
        $order->update(['order_status' => $validated['order_status']]);

        $payload = KdsPayload::fromOrder($order);
        $this->publish('order.status.updated', $payload);

        return response()->json($payload);
    }

    public function stream()
    {
        $headers = [
            'Content-Type' => 'text/event-stream',
            'Cache-Control' => 'no-cache',
            'Connection' => 'keep-alive',
            'X-Accel-Buffering' => 'no',
        ];

        return response()->stream(function () {
            $connected = json_encode([
                'event' => 'connected',
                'payload' => ['ts' => now()->toISOString()],
            ]);
            echo "data: {$connected}\n\n";
            @ob_flush();
            @flush();

            Redis::subscribe(['kds'], function ($message) {
                if (connection_aborted()) {
                    return false;
                }
                echo "data: {$message}\n\n";
                @ob_flush();
                @flush();
            });
        }, 200, $headers);
    }

    private function publish(string $event, array $payload): void
    {
        event(new KdsOrderEvent($event, $payload));
    }
}
