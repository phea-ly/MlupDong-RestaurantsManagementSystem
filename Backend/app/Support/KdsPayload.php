<?php

namespace App\Support;

use App\Models\Order;

class KdsPayload
{
    public static function fromOrder(Order $order): array
    {
        $order->loadMissing(['table', 'orderItems.menuItem']);

        $tableNumber = $order->table?->table_number;
        $tableName = $tableNumber ? "Table {$tableNumber}" : 'Table —';

        return [
            'id' => $order->order_id,
            'order_number' => $order->order_number ?? ('ORD-' . str_pad((string) $order->order_id, 4, '0', STR_PAD_LEFT)),
            'order_status' => $order->order_status ?? 'new',
            'created_at' => optional($order->created_at)->toISOString(),
            'table_name' => $tableName,
            'items' => $order->orderItems->map(function ($item) {
                return [
                    'id' => $item->order_item_id,
                    'name' => $item->menuItem?->item_name ?? 'Item',
                    'quantity' => $item->quantity ?? 1,
                    'note' => $item->note,
                ];
            })->values()->all(),
        ];
    }
}
