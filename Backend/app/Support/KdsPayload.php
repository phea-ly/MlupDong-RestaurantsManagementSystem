<?php

namespace App\Support;

use App\Models\Order;

class KdsPayload
{
    public function __construct(
        public readonly int     $orderId,
        public readonly string  $orderNumber,
        public readonly string  $orderStatus,
        public readonly string  $orderType,
        public readonly ?string $tableNumber,
        public readonly array   $items,
        public readonly string  $createdAt,
        public readonly ?string $notes = null,
    ) {}

    public static function fromOrder(Order $order): self
    {
        // Ensure relations are loaded
        if (!$order->relationLoaded('orderItems')) {
            $order->load(['orderItems.menuItem', 'table']);
        }

        return new self(
            orderId:     $order->order_id,
            orderNumber: $order->order_number ?? 'N/A',
            orderStatus: $order->order_status,
            orderType:   $order->order_type ?? 'dine_in',
            tableNumber: $order->table?->table_number
                ? (string) $order->table->table_number
                : null,
            items: $order->orderItems->map(fn ($item) => [
                'order_item_id' => $item->order_item_id,
                // ✅ Fix: use item_name (your MenuItem model field) not ->name
                'name'          => $item->menuItem?->item_name ?? 'Unknown Item',
                'quantity'      => $item->quantity,
                'unit_price'    => $item->unit_price,
                'subtotal'      => $item->subtotal,
                'note'          => $item->note,
            ])->toArray(),
            createdAt: $order->created_at->toISOString(),
            notes:     $order->special_instructions ?? null,
        );
    }

    public function toArray(): array
    {
        return [
            // ✅ Frontend kds.store expects 'id' not 'order_id'
            'id'           => $this->orderId,
            'order_id'     => $this->orderId,
            'order_number' => $this->orderNumber,
            'order_status' => $this->orderStatus,
            'order_type'   => $this->orderType,
            // ✅ Frontend expects 'table_name' for display
            'table_name'   => $this->tableNumber
                ? 'Table ' . $this->tableNumber
                : ($this->orderType === 'takeaway' ? 'Takeaway' : 'Table ?'),
            'table_number' => $this->tableNumber,
            'items'        => $this->items,
            'created_at'   => $this->createdAt,
            'notes'        => $this->notes,
            'special_instructions' => $this->notes,
        ];
    }
}