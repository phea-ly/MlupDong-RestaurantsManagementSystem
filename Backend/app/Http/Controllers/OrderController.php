<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Support\KdsPayload;
use App\Events\KdsOrderEvent;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

class OrderController extends Controller
{
    public function index()
    {
        $orders = Cache::remember(
            'orders_all',
            300,
            fn() =>
            Order::query()
                ->with(['user', 'table', 'discount', 'restaurant', 'orderItems.menuItem', 'payments', 'statusLogs'])
                ->latest('order_id')
                ->get()
        );

        return response()->json($orders);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'order_type'           => ['required', Rule::in(['dine_in', 'takeaway', 'delivery'])],
            'table_id'             => ['nullable', 'exists:tables,table_id'],
            'user_id'              => ['nullable', 'exists:users,user_id'],
            'restaurant_id'        => ['nullable', 'exists:restaurants,restaurant_id'],
            'special_instructions' => ['nullable', 'string', 'max:500'],
            'items'                => ['required', 'array', 'min:1'],
            'items.*.menu_item_id' => ['required', 'exists:menu_items,menu_item_id'],
            'items.*.quantity'     => ['required', 'integer', 'min:1'],
            'items.*.note'         => ['nullable', 'string', 'max:255'],
        ]);

        try {
            $order = DB::transaction(function () use ($validated) {
                // Fetch menu items to calculate price
                $ids       = collect($validated['items'])->pluck('menu_item_id');
                $menuItems = \App\Models\MenuItem::whereIn('menu_item_id', $ids)->get()->keyBy('menu_item_id');

                $subtotal = 0;
                foreach ($validated['items'] as $itemData) {
                    $menuItem = $menuItems[$itemData['menu_item_id']] ?? null;
                    if (!$menuItem) throw new \Exception("Menu item #{$itemData['menu_item_id']} not found.");
                    $subtotal += $menuItem->price * $itemData['quantity'];
                }

                $tax   = round($subtotal * 0.10, 2);
                $total = round($subtotal + $tax, 2);

                $order = Order::create([
                    'order_number'         => 'ORD-' . strtoupper(Str::random(8)),
                    'order_type'           => $validated['order_type'],
                    'table_id'             => $validated['table_id'] ?? null,
                    'user_id'              => $validated['user_id'] ?? null,
                    'restaurant_id'        => $validated['restaurant_id'] ?? null,
                    'order_status'         => 'new',
                    'payment_status'       => 'pending',
                    'total_amount'         => $subtotal,
                    'tax'                  => $tax,
                    'final_amount'         => $total,
                    'special_instructions' => $validated['special_instructions'] ?? null,
                ]);

                foreach ($validated['items'] as $itemData) {
                    $menuItem = $menuItems[$itemData['menu_item_id']];
                    $order->orderItems()->create([
                        'menu_item_id' => $menuItem->menu_item_id,
                        'quantity'     => $itemData['quantity'],
                        'unit_price'   => $menuItem->price,
                        'subtotal'     => round($menuItem->price * $itemData['quantity'], 2),
                        'note'         => $itemData['note'] ?? null,
                    ]);
                }

                return $order;
            });

            Cache::forget('orders_all');

            // Broadcast to KDS
            $payload = KdsPayload::fromOrder($order->load(['table', 'orderItems.menuItem']));
            event(new KdsOrderEvent('order.created', $payload));

            return response()->json(
                $order->load(['user', 'table', 'discount', 'restaurant', 'orderItems.menuItem', 'payments', 'statusLogs']),
                201
            );
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function show(string $id)
    {
        $order = Cache::remember(
            "order_{$id}",
            300,
            fn() =>
            Order::query()
                ->with(['user', 'table', 'discount', 'restaurant', 'orderItems', 'payments', 'statusLogs'])
                ->findOrFail($id)

        );

        return response()->json($order);
    }

    public function update(Request $request, string $id)
    {
        $order = Order::query()->findOrFail($id);

        $validated = $request->validate([
            'order_number'   => ['nullable', 'string', 'max:50', Rule::unique('orders', 'order_number')->ignore($id, 'order_id')],
            'order_type'     => ['sometimes', 'required', Rule::in(['dine_in', 'takeaway', 'delivery'])],
            'total_amount'   => ['nullable', 'numeric', 'min:0'],
            'tax'            => ['nullable', 'numeric', 'min:0'],
            'final_amount'   => ['nullable', 'numeric', 'min:0'],
            'payment_status' => ['nullable', Rule::in(['pending', 'paid', 'cancelled'])],
            'order_status'   => ['nullable', Rule::in(['new', 'received', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled'])],
            'user_id'        => ['nullable', 'exists:users,user_id'],
            'table_id'       => ['nullable', 'exists:tables,table_id'],
            'discount_id'    => ['nullable', 'exists:discounts,discount_id'],
            'restaurant_id'  => ['nullable', 'exists:restaurants,restaurant_id'],
        ]);

        $order->update($validated);

        Cache::forget('orders_all');
        Cache::forget("order_{$id}");
        Cache::forget('kds_active_orders');

        $payload = KdsPayload::fromOrder($order);
        event(new KdsOrderEvent('order.status.updated', $payload));

        return response()->json(
            $order->load(['user', 'table', 'discount', 'restaurant', 'orderItems.menuItem', 'payments', 'statusLogs'])
        );
    }

    public function destroy(string $id)
    {
        $order = Order::query()->findOrFail($id);

        // Items are usually deleted by cascade or manually if not set up in DB
        $order->orderItems()->delete();
        $order->delete();

        Cache::forget('orders_all');
        Cache::forget("order_{$id}");
        Cache::forget('kds_active_orders');

        return response()->noContent();
    }
}
