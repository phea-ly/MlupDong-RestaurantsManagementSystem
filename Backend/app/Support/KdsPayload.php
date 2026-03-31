<?php
// app/Support/KdsPayload.php

namespace App\Support;

use App\Models\Order;

class KdsPayload
{
    public function __construct(public readonly array $data) {}

    public static function fromOrder(Order $order): self
    {
        // Estimate prep time: 5 min base + 3 min per unique item
        $itemCount = $order->orderItems->sum('quantity');
        $prepTime  = max(5, 5 + ($itemCount * 2));

        return new self([
            // IDs — always include both forms so frontend is flexible
            'id'                    => $order->order_id,
            'order_id'              => $order->order_id,
            'order_number'          => $order->order_number,
            'order_status'          => $order->order_status,
            'order_type'            => $order->order_type,
            'payment_status'        => $order->payment_status,

            // Table info
            'table_id'              => $order->table_id,
            'table_number'          => $order->table?->table_number,
            'table_name'            => $order->table
                                        ? 'Table ' . $order->table->table_number
                                        : 'Takeaway',

            // Financials
            'total_amount'          => $order->total_amount,
            'tax'                   => $order->tax,
            'final_amount'          => $order->final_amount,

            // Notes
            'special_instructions'  => $order->special_instructions ?? null,

            // Prep time estimate
            'estimated_prep_minutes'=> $prepTime,

            // Items — include per-item note for chef
            'items'                 => $order->orderItems->map(fn ($item) => [
                'order_item_id' => $item->order_item_id,
                'menu_item_id'  => $item->menu_item_id,
                'name'          => $item->menuItem?->item_name ?? 'Unknown',
                'quantity'      => $item->quantity,
                'unit_price'    => $item->unit_price,
                'subtotal'      => $item->subtotal,
                'note'          => $item->note,           // ← chef sees this
                'image'         => $item->menuItem?->image,
                'prep_minutes'  => 3,                     // per-item base time
            ])->values()->toArray(),

            // Timestamps
            'created_at'            => $order->created_at?->toIso8601String(),
            'updated_at'            => $order->updated_at?->toIso8601String(),
        ]);
    }

    public function toArray(): array
    {
        return $this->data;
    }
}