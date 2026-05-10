<?php

namespace App\Http\Controllers;

use App\Events\KdsOrderEvent;
use App\Models\MenuItem;
use App\Models\Order;
use App\Models\OrderItem;
use App\Support\KdsPayload;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class CustomerOrderController extends Controller
{
    /**
     * POST /customer/orders
     * Body: {
     *   table_id: int,
     *   order_type: 'dine_in',
     *   special_instructions?: string,
     *   items: [{ menu_item_id, quantity, note? }]
     * }
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'table_id'             => ['required', 'exists:tables,table_id'],
            'order_type'           => ['required', 'in:dine_in,takeaway,delivery'],
            'special_instructions' => ['nullable', 'string', 'max:500'],
            'items'                => ['required', 'array', 'min:1'],
            'items.*.menu_item_id' => ['required', 'exists:menu_items,menu_item_id'],
            'items.*.quantity'     => ['required', 'integer', 'min:1'],
            'items.*.note'         => ['nullable', 'string', 'max:255'],
        ]);

        try {
            $order = DB::transaction(function () use ($validated) {

                // Fetch active menu items in one query
                $ids       = collect($validated['items'])->pluck('menu_item_id');
                $menuItems = MenuItem::whereIn('menu_item_id', $ids)
                    ->where('status', true)
                    ->get()
                    ->keyBy('menu_item_id');

                // Calculate totals
                $subtotal = 0;
                foreach ($validated['items'] as $line) {
                    $item = $menuItems[$line['menu_item_id']] ?? null;
                    if (!$item) {
                        throw new \Exception("Menu item #{$line['menu_item_id']} is unavailable.");
                    }
                    $subtotal += $item->price * $line['quantity'];
                }

                $tax   = round($subtotal * 0.10, 2);
                $total = round($subtotal + $tax, 2);

                // Create order
                $order = Order::create([
                    'order_number'         => 'ORD-' . strtoupper(Str::random(8)),
                    'order_type'           => $validated['order_type'],
                    'table_id'             => $validated['table_id'],
                    'order_status'         => 'new',
                    'payment_status'       => 'pending',
                    'total_amount'         => $subtotal,
                    'tax'                  => $tax,
                    'final_amount'         => $total,
                    // ✅ Store special instructions on the order
                    'special_instructions' => $validated['special_instructions'] ?? null,
                ]);

                // Create order items
                foreach ($validated['items'] as $line) {
                    $item = $menuItems[$line['menu_item_id']];
                    OrderItem::create([
                        'order_id'     => $order->order_id,
                        'menu_item_id' => $item->menu_item_id,
                        'quantity'     => $line['quantity'],
                        'unit_price'   => $item->price,
                        'subtotal'     => round($item->price * $line['quantity'], 2),
                        'note'         => $line['note'] ?? null,
                    ]);
                }

                return $order;
            });

            // Load relations AFTER transaction completes
            $order->load(['table', 'orderItems.menuItem']);

            // Build payload and broadcast to kitchen channel
            $payload = KdsPayload::fromOrder($order);
            event(new KdsOrderEvent('order.created', $payload));

            return response()->json([
                'success'               => true,
                'order_id'              => $order->order_id,
                'order_number'          => $order->order_number,
                'total'                 => $order->final_amount,
                'estimated_wait_minutes'=> $this->estimateWait($order->order_id),
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    private function estimateWait(int $newOrderId): int
    {
        $ahead = Order::whereIn('order_status', ['new', 'received', 'confirmed', 'preparing'])
            ->where('order_id', '<', $newOrderId)
            ->count();
        return max(5, $ahead * 5);
    }
}